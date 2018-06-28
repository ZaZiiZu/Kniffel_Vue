const lineFunctions = require('./serverThings/lineFunctions').lineFunctions
const sheetLayout = require('./serverThings/sheet').sheetLayout

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/*    defining the server     */
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 4000;

/*     starting server and listening to connections   */
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/*    accepting requests    */
app.post('/pickDices', (request, response) => {
  const dicesToFix = pick_some_dices(
    request.body.rollsLeft,
    request.body.dices,
    request.body.sheetColumn)
  response.json({
    dices: dicesToFix
  });
});

app.post('/pickCell', (req, res) => {
  const sheetRecalced = recalc_fill_sheet(
    req.body.state,
    req.body.dices,
    req.body.sheetColumn)
  res.json({
    sheetRecalced: sheetRecalced
  });
});

function pick_some_dices(rollsLeft, dices, playerColumn) {
  const list = new List(playerColumn)
  // list_sort sorts: prioritize missing dices factored with potential score

  const aimedCell = list.sorted().shift(); //extracts the cell to focus on
  // using information in aimedCell, extract fitting dices out of whole dice-array
  return extract_matching(dices, aimedCell)
}

function recalc_fill_sheet(state, dices, playerColumn) {
  let x; // x = {result: integer, dicesMatch: [], dicesMatchNot: [] }
  let j;
  let rollsArray = [];
  if (state.newTurn) {
    rollsArray = [0];
  } else {
    rollsArray = dices;
  }
  for (j = 0; j < sheetLayout.length; j += 1) {
    x = lineFunctions[sheetLayout[j].methode](
      rollsArray,
      j,
      sheetLayout,
      playerColumn[state.currentPlayer],
      state.currentPlayer
    );
    const cell = playerColumn[state.currentPlayer][j]
    if (!cell.fixed) {
      cell.value = x.result;
      cell.data = x;
    }
  }
  return playerColumn;
}


/*  Viktors little helpers    */
class List {
  constructor(column) {
    this.raw = JSON.parse(JSON.stringify(column));
    this.cleaned = function (toClean) {
      let array = JSON.parse(JSON.stringify(toClean || this.raw))
      array = array.filter(cell => !(cell.fixed || sheetLayout[cell.sheetRowDef].anklickbar === 0))
      array = !(array.length > 1)
        ? array
        : array.filter(cell => !(cell.data.potential === 0 || cell.data.dicesMatch.length === 0))
      return array
    }
    this.sorted = function (array) {
      array = array || JSON.parse(JSON.stringify(this.cleaned()))
      array.sort((a, b) => {
        if (
          5 / a.data.dicesMissing * a.data.potential >
          5 / b.data.dicesMissing * a.data.potential
        ) {
          return -1;
        }
        if (
          5 / a.data.dicesMissing * a.data.potential <
          5 / b.data.dicesMissing * a.data.potential
        ) {
          return 1;
        }
        if (a.data.potential > b.data.potential) return -1;
        if (a.data.potential < b.data.potential) return 1;
        return 0;
      }); // Prioritize: least missing dices first, then by potential=result
      return array
    }
  }
}


function extract_matching(dices, aimedCell) {
  const arrCut = !aimedCell ? [] : aimedCell.data.dicesMatchNot || [];
  for (let i = 0; i < dices.length; i++) {
    //cut out the "matchNot" out of rollArray
    if (!arrCut || !arrCut[0]) return dices;
    for (let k = 0; k < arrCut.length; k++) {
      if (dices[i] === arrCut[k]) {
        dices.splice(i, 1);
        i--;
        arrCut.splice(k, 1);
        k--;
      }
    }
  }
  return dices
}
