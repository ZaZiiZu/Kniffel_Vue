const electron = require('electron')
const lineFunctions = require('./serverThings/lineFunctions')
const sheetLayout = require('./serverThings/sheetDef')

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/*    defining the server     */
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 62100;

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
// app.post('/pickDices', (request, response) => {
//   const dicesToFix = get_return(
//     request.body.rollsLeft,
//     request.body.dices,
//     request.body.sheetColumn)
//   response.json({
//     dices: dicesToFix
//   });
// });

// app.post('/pickCell', (req, res) => {
//   const sheetRecalced = recalc_fill_sheet(
//     req.body.state,
//     req.body.dices,
//     req.body.sheetColumn)
//   res.json({
//     sheetRecalced: sheetRecalced
//   });
// });

app.post('/yahtzee/turn', (req, res) => {
  const turnInfo = {
    dices: req.DiceSet,
    throwsLeft: req.ThrowsLeft,
    sheetColumn: req.SheetColumn
  }
  const analyzedSheet = new Sheet(turnInfo.sheetColumn, turnInfo.dices, turnInfo.throwsLeft)
  const returnObj = get_return(turnInfo.throwsLeft, turnInfo.dices, analyzedSheet.analyzedColumn)
  res.json({
    DiceLocks: returnObj.dices,
    CategoryIndex: returnObj.cell

  });
});



/*  Viktors little helpers    */

function get_return(rollsLeft, dices, playerColumn) {
  const list = new List(playerColumn)
  // list_sort sorts: prioritize missing dices factored with potential score

  const aimedCell = list.sortedFocus.shift(); //extracts the cell to focus on
  // using information in aimedCell, extract fitting dices out of whole dice-array
  const returnObj = {}
  returnObj.DiceLocks = extract_matching_asBoolean(dices, aimedCell)
  returnObj.CategoryIndex = list.sortedPick.shift().sheetRowDef - 1
  return returnObj
}

class List {
  constructor(column) {
    this.raw = this.get_clone(column);
    this.cleaned = this.get_cleanedArr(this.raw)
    this.sortedFocus = this.get_sortedArr(this.cleaned, "focusPrio")
    this.sortedPick = this.get_sortedArr(this.cleaned, "pickPrio")
  }

  get_cleanedArr(input_arr) {
    let array = this.get_clone(input_arr || this.raw)
    array = array.filter(cell => !(cell.fixed || sheetLayout[cell.sheetRowDef].anklickbar === 0))
    array = !(array.length > 1)
      ? array
      : array.filter(cell => !(cell.data.potential === 0 || cell.data.dicesMatch.length === 0))
    return array
  }
  get_sortedArr(input_arr, priority) {
    let prio = priority || "focusPrio"
    let array = this.get_clone(input_arr || this.cleaned)
    array.sort((a, b) => {
      if (
        a.data[prio] >
        b.data[prio]
      ) {
        return -1;
      }
      if (
        a.data[prio] <
        b.data[prio]
      ) {
        return 1;
      }
      if (a.data.potential > b.data.potential) return -1;
      if (a.data.potential < b.data.potential) return 1;
      return 0;
    }); // Prioritize using focusPrio
    return array
  }
  get_clone(input) {
    return JSON.parse(JSON.stringify(input))
  }
}

class Sheet {
  constructor(input_column, input_rollsArr, input_rollLeft) {
    this.raw_column = this.get_clone(input_column)
    this.raw_transformed = this.transform_raw(this.raw_column)
    this.analyzedColumn = this.get_analyzedColumn(this.raw_transformed, input_rollsArr, input_rollLeft)
  }
  transform_raw(input_arr) {
    const sheetData = []
    for (let j = 1; j <= input_arr.length; j += 1) {
      sheetData.push({
        value: input_arr[j - 1],
        fixed: Number.isInteger(input_arr[j - 1]),
        sheetRowDef: j // zum Nachschlagen von line-spezifischen properties
      })
    }
    return sheetData
  }
  get_analyzedColumn(input_arr, input_rollsArray, input_rollLeft) {
    const rollsArray = input_rollsArray || [0]
    let resultsArray = this.get_clone(input_arr)
    const turnsLeft = input_arr.filter(x => x === null).length
    for (let j = 1; j <= input_arr.length; j += 1) {
      let x = lineFunctions[sheetLayout[j].methode]({
        rollsAsArray: rollsArray,
        currentRow: j,
        sheetLayout: sheetLayout,
        sheetDataColumnX: input_arr,
        playerX: 1,
        rollsLeft: input_rollLeft,
        turnsLeft: turnsLeft
      })
      resultsArray[j - 1].data = x
    }
    return resultsArray
  }
  get_clone(input) {
    return JSON.parse(JSON.stringify(input))
  }
}



// function extract_matching2(dices, aimedCell) {
//   const arrCut = !aimedCell ? [] : aimedCell.data.dicesMatchNot || [];
//   for (let i = 0; i < dices.length; i++) {
//     //cut out the "matchNot" out of rollArray
//     if (!arrCut || !arrCut[0]) return dices;
//     for (let k = 0; k < arrCut.length; k++) {
//       if (dices[i] === arrCut[k]) {
//         dices.splice(i, 1);
//         i--;
//         arrCut.splice(k, 1);
//         k--;
//       }
//     }
//   }
//   return dices
// }

function extract_matching_asBoolean(dices, aimedCell) {
  const arrCut = !aimedCell ? [] : aimedCell.data.dicesMatchNot || [];
  for (let i = 0; i < dices.length; i++) {
    //cut out the "matchNot" out of rollArray
    if (!arrCut || !arrCut[0]) return dices;
    for (let k = 0; k < arrCut.length; k++) {
      if (dices[i] === arrCut[k]) {
        dices[i] = 0
        // dices.splice(i, 1);
        // i--;
        arrCut.splice(k, 1);
        k--;
      }
    }
  }
  dices.forEach((element, index) => {
    dices[index] = element > 0 ? 1 : 0
  });
  return dices
}


// const columnArrayDefault = Array(13).fill(null)
// const dicesArrayDefault = [1, 2, 3, 3, 3]
// const throwsLeftDefault = 2
// const analyzedSheet = new Sheet(columnArrayDefault, dicesArrayDefault, throwsLeftDefault)
// const results = get_return(throwsLeftDefault, dicesArrayDefault, analyzedSheet.analyzedColumn)
