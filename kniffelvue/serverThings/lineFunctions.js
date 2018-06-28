
function arraySum(array) {
  if (!array.length) {
    return 0;
  }
  const add = (a, b) => parseInt(a, 10) + parseInt(b, 10);
  const sum = array.reduce(add);
  return sum;
};

// copy paste from web: creating Set from array to delete duplicates. Then parse back to array
function removeDuplicate(arr) {
  const unique_array = Array.from(new Set(arr));
  return unique_array;
};
/* to get longest sequence like 2,3,4 within 6,3,4,6,2 */
function getSequence(arr) {
  const noDublicates = removeDuplicate(arr).sort() || [1, 2, 3, 6]
  // let currentLength = 1;
  let maxLength = 1;
  let currentArray = [noDublicates[0]];
  let maxArray = [noDublicates[0]]; //***NEEEDS FIX at some point***: default-value, only triggers when there are NO 2+ sequences. Bad if it also starts with 1 while there are 2-5 available
  let newArray = [];
  // run through sorted array and slice after every sequence
  for (let i = 0; i < noDublicates.length - 1; i++) {
    if (noDublicates[i] === noDublicates[i + 1] - 1) {
      currentArray.push(noDublicates[i + 1])
    } else {
      newArray.push(currentArray.slice())
      currentArray = []
      currentArray.push(noDublicates[i + 1])
    }
  }
  newArray.push(currentArray.slice())
  newArray = newArray.filter(x => x.length >= 2) // filter all sequences length 2+
  if (newArray && newArray[0]) { // if there is anything left in ^, override maxArray and maxLength
    // sort below is for special cases like [1,2,4,5]: two doublets -> two options: keep 1,2 or 4,5? It now prefers 4,5 (because of sorting)
    if (newArray && newArray.length >= 2) {
      newArray.sort((a, b) => {
        if (a.length !== b.length) return (b.length - a.length) // sort by length(descending)
        return (Math.min(...a) === 1 || Math.max(...a) === 6) ? 1 : -1 //having same length, prioritize "open" pairs over "cornered" ones
      })
    }
    maxLength = newArray ? newArray[0].length : 1
    maxArray = newArray ? newArray[0] : []
  }
  return { maxLength, maxArray }
}

function getMatchNot(asdf, arrayCut) {
  const arrFull = asdf.slice() || [1, 2, 3, 4, 5, 6]
  const arrCut = arrayCut.slice() || []
  for (let i = 0; i < arrFull.length; i++) {
    if (!arrCut || !arrCut[0]) break;
    for (let j = 0; j < arrCut.length; j++) {
      if (arrFull[i] === arrCut[j]) {
        arrFull.splice(i, 1)
        i--
        arrCut.splice(j, 1)
        j--
      }
    }
  }
  return arrFull
}

/* sorting to match one of these:
    +-----------+
    | A A A A A |
    | A A A A B |
    | A A A B B |
    | A A A B C |
    | A A B B C |
    | A A B C D |
    | A B C D E |
    +-----------+
    And throw out some additional info, sequence, pattern, ...
  */
function analyzeRolls(arr) {
  const result = {};
  const rollsArrayCopy = arr.slice() || [0, 0, 0, 0, 0]
  let temp2dArray = [];

  /*  basically, create a new array to count all the individual elements,
      e.g. 1x1, 0x2, 0x3, 2x4, 2x5, 0x6 */
  for (let index = 0; index < rollsArrayCopy.length; index++) {
    const val = rollsArrayCopy[index]
    temp2dArray[val] = (temp2dArray[val]) ? temp2dArray[val] : []
    temp2dArray[val].push(val)
  }
  temp2dArray = temp2dArray.filter(n => n !== undefined); // clean the eventual "unidefined"
  temp2dArray.sort((a, b) => {  // sort by length(descending), then by value(descending)
    if (a.length !== b.length) return (b.length - a.length)
    if (a[0] !== b[0]) return (b[0] - a[0])
    return 0
  })
  // filter doublets, then deep-clone it via stringify->parse (deep-clone to prevent some weird shit)
  let dupsToReplace = JSON.parse(JSON.stringify(temp2dArray.filter(n => n.length >= 2)));
  for (let i = 0; i < dupsToReplace.length; i++) {
    dupsToReplace[i].pop();  // reduce doublets by one to mark them as "toReplace"
  }
  result.pattern = temp2dArray.filter(n => n.length >= 2) //array with duplicate-blocks
  result.merged = [].concat.apply([], temp2dArray);  //  merge that above to get  e.g. : 4 4 5 5 1
  result.merged = result.merged.filter(n => n !== undefined); // clean the eventual "undefined"
  result.sequence = getSequence(result.merged); // with maxLength and maxArray

  dupsToReplace = dupsToReplace.reduce((acc, val) => acc.concat(val), []); // flatten the array by one level, e.g.: [[a,b,c],[d,e]] to a simple [a,b,c,d,e]
  result.sequence.duplicates = dupsToReplace;
  return result;
}

/* saving the copy/paste for several lineFunctions */
function getConf(asdf) {
  const rollsArray = asdf || [0, 0, 0, 0, 0];
  rollsArray.sort();
  return {
    x: {
      result: 0,
      dicesMatch: [],
      dicesMatchNot: [],
      dicesMissing: [],
      potential: 0
    },
    rollsArray,
  }
}

const lineFunctions = {
  matching(asdf, i, sheet) {
    const conf = getConf(asdf)
    conf.x.dicesMatch = (conf.rollsArray.filter(jk => jk === sheet[i].sums))
    conf.x.dicesMatchNot = (conf.rollsArray.filter(jk => jk !== sheet[i].sums))
    conf.x.dicesMissing = Math.max(4 - conf.x.dicesMatch.length, 0)
    conf.x.result = arraySum(conf.x.dicesMatch);
    conf.x.potential = sheet[i].sums * (asdf.length - 1)
    return conf.x;
  },
  pasch(asdf, i, sheet) {
    const conf = getConf(asdf)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    if (rollsAnalyzed.pattern[0] && rollsAnalyzed.pattern[0].length >= sheet[i].sums) {
      conf.x.result = arraySum(conf.rollsArray);
    }
    conf.x.dicesMatch = rollsAnalyzed.pattern[0] || []
    if (!rollsAnalyzed.pattern[0]) {
      conf.x.dicesMatchNot = asdf;
    } else {
      conf.x.dicesMatchNot = asdf.filter(x => !rollsAnalyzed.pattern[0].includes(x))
    }
    conf.x.dicesMissing = Math.max(sheet[i].sums - conf.x.dicesMatch.length, 0)
    conf.x.potential = (conf.x.dicesMatch[0] || 2) * sheet[i].sums + (asdf.length - sheet[i].sums) * 2
    conf.x.potentialMax = 5 * asdf.length
    return conf.x;
  },
  fullHouse(asdf) {
    const conf = getConf(asdf)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const fhValue = 25
    conf.rollsArray = rollsAnalyzed.merged;
    if (rollsAnalyzed.pattern.length >= 2 && rollsAnalyzed.pattern[0].length >= 3 && rollsAnalyzed.pattern[1].length >= 2) {
      conf.x.result = fhValue
      conf.x.dicesMatch = rollsAnalyzed.pattern[0].concat(rollsAnalyzed.pattern[1])
      conf.x.dicesMatchNot = []
    } else {
      if (rollsAnalyzed && rollsAnalyzed.pattern.length) rollsAnalyzed.pattern[0].length = 3
      conf.x.dicesMatch = !rollsAnalyzed.pattern[0] ? [] : rollsAnalyzed.pattern[1] ? rollsAnalyzed.pattern[0].concat(rollsAnalyzed.pattern[1]) : rollsAnalyzed.pattern[0]
      conf.x.dicesMatchNot = getMatchNot(asdf, conf.x.dicesMatch)
    }
    conf.x.dicesMissing = Math.max(5 - conf.x.dicesMatch.length, 0)
    conf.x.potential = fhValue
    return conf.x;
  },
  kleineStraße(asdf) {
    const conf = getConf(asdf)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const ksValue = 30
    if (rollsAnalyzed.sequence && rollsAnalyzed.sequence.maxLength >= 4) conf.x.result = ksValue;
    conf.x.dicesMatch = rollsAnalyzed.sequence.maxArray
    conf.x.dicesMatchNot = getMatchNot(asdf, rollsAnalyzed.sequence.maxArray)
    conf.x.dicesMissing = Math.max(4 - conf.x.dicesMatch.length, 0)
    conf.x.potential = ksValue
    return conf.x;
  },
  großeStraße(asdf) {
    const conf = getConf(asdf)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const gsValue = 40
    if (rollsAnalyzed.sequence && rollsAnalyzed.sequence.maxLength >= 5) conf.x.result = gsValue;
    conf.x.dicesMatch = rollsAnalyzed.sequence.maxArray
    conf.x.dicesMatchNot = getMatchNot(asdf, rollsAnalyzed.sequence.maxArray)
    conf.x.dicesMissing = Math.max(5 - conf.x.dicesMatch.length, 0)
    conf.x.potential = gsValue
    return conf.x;
  },
  Kniffel(asdf, i, sheet) {
    const conf = getConf(asdf)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const knfValue = 50
    if (rollsAnalyzed.pattern[0] && rollsAnalyzed.pattern[0].length >= sheet[i].sums) {
      conf.x.result = knfValue;
      conf.x.dicesMatch = rollsAnalyzed.pattern[0];
      conf.x.dicesMatchNot = [] // asdf.filter(x => !rollsAnalyzed.pattern[0].includes(x))
    } else if (rollsAnalyzed.pattern[0]) {
      conf.x.dicesMatch = rollsAnalyzed.pattern[0] ? rollsAnalyzed.pattern[0] : asdf;
      conf.x.dicesMatchNot = asdf.filter(x => !rollsAnalyzed.pattern[0].includes(x))
    }
    conf.x.dicesMissing = Math.max(5 - conf.x.dicesMatch.length, 0)
    conf.x.potential = knfValue
    return conf.x;
  },
  Chance(asdf) { // prioritäten einbauen
    const conf = getConf(asdf)
    conf.x.result = arraySum(conf.rollsArray)
    conf.x.dicesMatch = [];
    conf.x.dicesMatchNot = []
    conf.x.potential = 5.5 * asdf.length
    return conf.x;
  },
  none(asdf, i, sheet, sheetDataPlayerX, currentPlayer) {
    const x = {
      result: "Player " + (currentPlayer),
      dicesMatch: [],
      dicesMatchNot: [],
      potential: 0
    }
    return x

  },
  sum_sums(asdf, i, sheet, sheetDataPlayerX) {
    const conf = getConf(asdf)
    // filtert nur fixed werte aus dem richtigen block
    const found = sheetDataPlayerX.filter(
      el => ((sheet[el.sheetRowDef].classBlock === sheet[i].sums) &&
        (el.fixed || sheet[el.sheetRowDef].anklickbar === 0)));
    for (let j = 0; j < found.length; j += 1) {
      conf.x.result += (found[j].value) || 0;
    }
    return conf.x;
  },
  bonus_oben(asdf, i, sheet, sheetDataPlayerX) {
    const conf = getConf(asdf)
    conf.x.result = sheetDataPlayerX[7].value >= 63 ? 35 : 0;
    return conf.x;
  }
};

module.exports.lineFunctions = lineFunctions
