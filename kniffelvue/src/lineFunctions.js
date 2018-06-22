const math = require('mathjs');

const answerToEverything = {}

function generateAnswersToEverything() {
  const base = [
    [120 / 1296, 900 / 1296, 250 / 1296, 25 / 1296, 1 / 1296],
    [0, 120 / 216, 80 / 216, 15 / 216, 1 / 216],
    [0, 0, 25 / 36, 10 / 36, 1 / 36],
    [0, 0, 0, 5 / 6, 1 / 6],
    [0, 0, 0, 0, 1]
  ]
  for (let k = 0; k <= 5; k++) {
    answerToEverything[k] = add_padding_Matrix(round_matrix(math.pow(base, k), 3))
  }
}
generateAnswersToEverything();

function round_matrix(endlessFloating, potInput) {
  const pot = potInput || 2
  const copyEndlessFloating = JSON.parse(JSON.stringify(endlessFloating))
  const bla = copyEndlessFloating.map(x => x.map(y => Math.round(y * (10 ** pot)) / (10 ** pot)))
  return bla
}

function add_padding_Matrix(goodMatrix) {
  const crap = JSON.parse(JSON.stringify(goodMatrix))
  crap.map(x => x.unshift(0))
  crap.unshift(0)
  return crap
}

function get_oddsArray(input) {
  const exponent = Math.max(input.potentialRolls, 0)
  const row = Math.max(input.minLength, 1)
  if (input.minLength == 0) {
    const factor = answerToEverything
  }
  // row = input.minLength == 0 ? row * factor //////////
  return answerToEverything[exponent][row]
}

function get_stats(input) {
  const possibleResultsArray = input.possibleResults || [0]
  const lowestFixed = input.minLength
  const oddsArray = get_oddsArray({
    potentialRolls: input.rollsLeft,
    minLength: lowestFixed
  })
  const sharedLength = Math.min(possibleResultsArray.length, oddsArray.length)
  const array1 = possibleResultsArray.slice(0, sharedLength)
  const array2 = oddsArray.slice(0, sharedLength)

  const datObject = {}
  for (let i = 0; i < sharedLength; i++) {
    const subObject = {
      value: array1[i] || 0,
      odds: array2[i] || 0
    }
    datObject[i] = subObject
  }
  // console.log('dat object: ', datObject)
  const factoredArray = math.dotMultiply(array1, array2)
  const average = arraySum(factoredArray)
  const keys = Object.keys(datObject)
  // console.log('keys: ', keys)
  const filtered = keys.filter(keyIndex => datObject[keyIndex].odds > 0)
  // console.log('filtered: ', filtered)
  const minValue = datObject[filtered[0]].value || 0
  const minOdds = datObject[filtered[0]].odds
  const maxValue = datObject[filtered[filtered.length - 1]].value || 0
  const maxOdds = datObject[filtered[filtered.length - 1]].odds || 0
  const likelyOdds = Math.max(...array2)
  const likelyValue = datObject[keys.filter(keyIndex => datObject[keyIndex].odds == likelyOdds)].value

  console.log('average: ', average)
  console.log('expected: ', likelyValue)
  const elObjecte = {
    input: input,
    valuesArray: possibleResultsArray,
    oddsArray: oddsArray,
    hits: datObject,
    result: {
      array: factoredArray,
      average: average,
      minValue: minValue,
      minOdds: minOdds,
      maxValue: maxValue,
      maxOdds: maxOdds,
      likelyValue: likelyValue,
      likelyOdds: likelyOdds
    }
  }
  return elObjecte
}

// copied and adjusted from web: summing up arrays
function arraySum(array) {
  if (!array.length) {
    return 0;
  }
  let sum = 0;
  for (let i = array.length; i--;) {
    sum += array[i];
  }
  // const add = (a, b) => parseFloat(a) + parseFloat(b);
  // const sum = array.reduce(add);
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
  return {
    maxLength,
    maxArray
  }
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
  temp2dArray.sort((a, b) => { // sort by length(descending), then by value(descending)
    if (a.length !== b.length) return (b.length - a.length)
    if (a[0] !== b[0]) return (b[0] - a[0])
    return 0
  })
  // filter doublets, then deep-clone it via stringify->parse (deep-clone to prevent some weird shit)
  let dupsToReplace = JSON.parse(JSON.stringify(temp2dArray.filter(n => n.length >= 2)));
  for (let i = 0; i < dupsToReplace.length; i++) {
    dupsToReplace[i].pop(); // reduce doublets by one to mark them as "toReplace"
  }
  result.pattern = temp2dArray.filter(n => n.length >= 2) //array with duplicate-blocks

  result.merged = [].concat.apply([], temp2dArray); //  merge that above to get  e.g. : 4 4 5 5 1
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
      potential: 0,
      focusPrio: 0,
      pickPrio: 0,
      dicesNeeded: []
    },
    rollsArray,
  }
}

const lineFunctions = {
  matching(lFObjectInput) {
    let conf = getConf()
    if (lFObjectInput.rollsAsArray.length <= 1) return conf.x
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray || [0]
    const currentRow = lFObject.currentRow || [1]
    const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    const rollsLeft = lFObject.rollsLeft || 0
    // const rollsLeft = lFObject.rollsLeft

    const factors = {
      focus: {
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
        6: 1
      },
      pick: {
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2
      }
    }
    const variableX = 0.8
    const variableZ = 2
    const riskThreshold = 0.8
    conf = getConf(rollsAsArray)
    conf.x.dicesMatch = (conf.rollsArray.filter(jk => jk === sheetLayout[currentRow].sums))
    conf.x.dicesMatchNot = (conf.rollsArray.filter(jk => jk !== sheetLayout[currentRow].sums))
    conf.x.dicesMissing = Math.max(4 - conf.x.dicesMatch.length, 0)
    conf.x.result = arraySum(conf.x.dicesMatch);
    conf.x.potential = sheetLayout[currentRow].sums * (rollsAsArray.length - 1)
    if (sheetDataColumnX[8].value === 0) {
      conf.x.potential = conf.x.dicesMatch.length >= 3 ? conf.x.result : conf.x.potential
      conf.x.potentialMax = sheetDataColumnX[9].value + conf.x.result >= 63 ? conf.x.result : conf.x.potential
    }
    const boost = sheetDataColumnX[8].value ? 0 : 1

    const potentialArray = Array(rollsAsArray.length + 1).fill().map((x, i) => (i * sheetLayout[currentRow].sums))
    // console.log('potential array: ', potentialArray)
    const statistics = get_stats({
      rollsLeft: rollsLeft || 0,
      minLength: conf.x.dicesMatch.length || 0,
      possibleResults: potentialArray
    })
    console.log('stats!', statistics)

    conf.x.focusPrio = boost ? math.pow(sheetLayout[currentRow].sums, conf.x.dicesMatch.length / variableZ)
      : sheetLayout[currentRow].sums * conf.x.dicesMatch.length
    conf.x.pickPrio = conf.x.dicesMatch.length < 3
      ? conf.x.result * (1 - variableX)
      : conf.x.dicesMatch.length >= 3
      ? (boost * 10 + 1) * conf.x.result
      : conf.x.result * factors[currentRow]
    conf.x.priority = conf.x.dicesMatch.length < 3
      ? conf.x.potential * (1 - variableX)
      : conf.x.dicesMatch.length >= 3
      ? (1 + 10 * boost) * conf.x.potential : conf.x.potential
    conf.x.dicesNeeded = []
    return conf.x;
  },
  pasch(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    const currentRow = lFObject.currentRow
    const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    if (rollsAnalyzed.pattern[0] && rollsAnalyzed.pattern[0].length >= sheetLayout[currentRow].sums) {
      conf.x.result = arraySum(conf.rollsArray);
    }
    conf.x.dicesMatch = rollsAnalyzed.pattern[0] || []
    if (!rollsAnalyzed.pattern[0]) {
      conf.x.dicesMatchNot = rollsAsArray;
    } else {
      conf.x.dicesMatchNot = rollsAsArray.filter(x => !rollsAnalyzed.pattern[0].includes(x))
    }
    conf.x.dicesMissing = Math.max(sheetLayout[currentRow].sums - conf.x.dicesMatch.length, 0)
    conf.x.potential = (conf.x.dicesMatch[0] || 2) * sheetLayout[currentRow].sums
    conf.x.potentialMax = 5 * rollsAsArray.length
    const boost = sheetDataColumnX[8].value ? 0 : 1
    conf.x.focusPrio = conf.x.potential
    conf.x.pickPrio = math.pow(conf.x.result, conf.x.length / 3)
    conf.x.priority = (1 - 0.5 * boost) * conf.x.potential
    return conf.x;
  },
  fullHouse(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    // const currentRow = lFObject.currentRow
    // const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const fhValue = 25
    const needed = 5
    conf.rollsArray = rollsAnalyzed.merged;
    if (rollsAnalyzed.pattern.length >= 2 && rollsAnalyzed.pattern[0].length >= 3 && rollsAnalyzed.pattern[1].length >= 2) {
      conf.x.result = fhValue
      conf.x.dicesMatch = rollsAnalyzed.pattern[0].concat(rollsAnalyzed.pattern[1])
      conf.x.dicesMatchNot = []
    } else if (rollsAnalyzed && rollsAnalyzed.pattern.length) {
      rollsAnalyzed.pattern[0].length = rollsAnalyzed.pattern[0].length > 3 ? 3 : rollsAnalyzed.pattern[0].length
      conf.x.dicesMatch = !rollsAnalyzed.pattern[0] ? [] : rollsAnalyzed.pattern[1] ? rollsAnalyzed.pattern[0].concat(rollsAnalyzed.pattern[1]) : rollsAnalyzed.pattern[0]
      conf.x.dicesMatchNot = getMatchNot(rollsAsArray, conf.x.dicesMatch)
    }
    conf.x.dicesMissing = Math.max(5 - conf.x.dicesMatch.length, 0)
    conf.x.potential = fhValue
    const boost = sheetDataColumnX[8].value ? 0 : 1
    conf.x.focusPrio = conf.x.potential * (conf.x.dicesMatch.length / needed)
    conf.x.pickPrio = conf.x.result * 5 || 2
    conf.x.priority = (1 - 0.5 * boost) * conf.x.potential
    return conf.x;
  },
  kleineStraße(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    // const currentRow = lFObject.currentRow
    // const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const ksValue = 30
    const needed = 4
    if (rollsAnalyzed.sequence && rollsAnalyzed.sequence.maxLength >= 4) conf.x.result = ksValue;
    conf.x.dicesMatch = rollsAnalyzed.sequence.maxArray
    conf.x.dicesMatchNot = getMatchNot(rollsAsArray, rollsAnalyzed.sequence.maxArray)
    conf.x.dicesMissing = Math.max(4 - conf.x.dicesMatch.length, 0)
    conf.x.potential = ksValue
    const boost = sheetDataColumnX[8].value ? 0 : 1
    conf.x.priority = (1 - 0.5 * boost) * conf.x.potential
    conf.x.focusPrio = conf.x.potential * (conf.x.dicesMatch.length / needed) || 0
    conf.x.pickPrio = conf.x.result * 5 || 1
    return conf.x;
  },
  großeStraße(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    // const currentRow = lFObject.currentRow
    // const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const gsValue = 40
    const needed = 5
    if (rollsAnalyzed.sequence && rollsAnalyzed.sequence.maxLength >= 5) conf.x.result = gsValue;
    conf.x.dicesMatch = rollsAnalyzed.sequence.maxArray
    conf.x.dicesMatchNot = getMatchNot(rollsAsArray, rollsAnalyzed.sequence.maxArray)
    conf.x.dicesMissing = Math.max(5 - conf.x.dicesMatch.length, 0)
    conf.x.potential = gsValue
    const boost = sheetDataColumnX[8].value ? 0 : 1
    conf.x.priority = (1 - 0.5 * boost) * conf.x.potential
    conf.x.focusPrio = conf.x.potential * (conf.x.dicesMatch.length / needed)
    conf.x.pickPrio = conf.x.result * 5 || 3
    return conf.x;
  },
  Kniffel(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    const currentRow = lFObject.currentRow
    const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    const rollsAnalyzed = analyzeRolls(conf.rollsArray)
    const knfValue = 50
    const needed = 5
    if (rollsAnalyzed.pattern[0] && rollsAnalyzed.pattern[0].length >= sheetLayout[currentRow].sums) {
      conf.x.result = knfValue;
      conf.x.dicesMatch = rollsAnalyzed.pattern[0];
      conf.x.dicesMatchNot = [] // rollsAsArray.filter(x => !rollsAnalyzed.pattern[0].includes(x))
    } else if (rollsAnalyzed.pattern[0]) {
      conf.x.dicesMatch = rollsAnalyzed.pattern[0] ? rollsAnalyzed.pattern[0] : rollsAsArray;
      conf.x.dicesMatchNot = rollsAsArray.filter(x => !rollsAnalyzed.pattern[0].includes(x))
    }
    conf.x.dicesMissing = Math.max(5 - conf.x.dicesMatch.length, 0)
    conf.x.potential = knfValue
    const boost = sheetDataColumnX[8].value ? 0 : 1
    conf.x.priority = (1 - 0.5 * boost) * conf.x.potential
    conf.x.focusPrio = conf.x.potential * (conf.x.dicesMatch.length / needed)
    conf.x.pickPrio = conf.x.result * 5.1 || 4
    return conf.x;
  },
  Chance(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    // const currentRow = lFObject.currentRow
    // const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    conf.x.result = arraySum(conf.rollsArray)
    conf.x.dicesMatch = [];
    conf.x.dicesMatchNot = []
    conf.x.potential = 5.5 * rollsAsArray.length
    conf.x.dicesMissing = rollsAsArray.length - 1
    const boost = sheetDataColumnX[8].value ? 0 : 1
    conf.x.priority = (1 - 0.5 * boost) * conf.x.potential * 0.1
    conf.x.pickPrio = Math.min(conf.x.result / 10, 5)
    conf.x.focusPrio = 0
    return conf.x;
  },
  none(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    // const rollsAsArray = lFObject.rollsAsArray
    // const currentRow = lFObject.currentRow
    // const sheetLayout = lFObject.sheetLayout
    // const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const playerX = lFObject.playerX
    const notting = {
      result: "Player " + (playerX),
      dicesMatch: [],
      dicesMatchNot: [],
      potential: 0
    }
    return notting

  },
  sum_sums(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    const currentRow = lFObject.currentRow
    const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    // filtert nur fixed werte aus dem richtigen block
    const found = sheetDataColumnX.filter(
      el => ((sheetLayout[el.sheetRowDef].classBlock === sheetLayout[currentRow].sums) &&
        (el.fixed || sheetLayout[el.sheetRowDef].anklickbar === 0)));
    for (let j = 0; j < found.length; j += 1) {
      conf.x.result += (found[j].value) || 0;
    }
    return conf.x;
  },
  bonus_oben(lFObjectInput) {
    const lFObject = JSON.parse(JSON.stringify(lFObjectInput))
    const rollsAsArray = lFObject.rollsAsArray
    // const currentRow = lFObject.currentRow
    // const sheetLayout = lFObject.sheetLayout
    const sheetDataColumnX = lFObject.sheetDataColumnX
    // const rollsLeft = lFObject.rollsLeft
    const conf = getConf(rollsAsArray)
    conf.x.result = sheetDataColumnX[7].value >= 63 ? 35 : 0;
    return conf.x;
  }
};
export default lineFunctions
