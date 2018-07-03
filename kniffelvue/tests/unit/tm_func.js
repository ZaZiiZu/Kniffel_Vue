var util = require('util')
var fs = require('fs')

function get_rollsArray(settings) {
  const length = settings.length || 5
  const min = settings.min || 1
  const max = settings.max || 6
  let rollsArray = settings.array || []
  const toRoll = max - min + 1
  for (let i = rollsArray.length || 0; i < length; i++) {
    const newRoll = Math.floor(Math.random() * toRoll + min)
    rollsArray.push(newRoll)
  }
  return rollsArray
}
//wtf?!
function get_X_of_a_kind(arr) {
  // const result = {};
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
  // let dupsToReplace = JSON.parse(JSON.stringify(temp2dArray.filter(n => n.length >= 2)));
  // for (let i = 0; i < dupsToReplace.length; i++) {
  //   dupsToReplace[i].pop(); // reduce doublets by one to mark them as "toReplace"
  // }
  // // result.pattern = temp2dArray.filter(n => n.length >= 2) //array with duplicate-blocks

  // // result.merged = [].concat.apply([], temp2dArray); //  merge that above to get  e.g. : 4 4 5 5 1
  // // result.merged = result.merged.filter(n => n !== undefined); // clean the eventual "undefined"
  // // result.sequence = getSequence(result.merged); // with maxLength and maxArray

  // dupsToReplace = dupsToReplace.reduce((acc, val) => acc.concat(val), []); // flatten the array by one level, e.g.: [[a,b,c],[d,e]] to a simple [a,b,c,d,e]
  //   result.sequence.duplicates = dupsToReplace;
  //   return result;
  if (temp2dArray[0].length > 8) {}
  return temp2dArray || []
}

// class RollsSettings {
//   constructor(lengthIn, minIn, maxIn, arrayIn) {
//     this.length = lengthIn > 0 ? lengthIn : 5;
//     this.min = minIn > 0 ? lengthIn : 1;
//     this.max = maxIn > 0 ? lengthIn : 6;
//     this.array = JSON.parse(JSON.stringify(arrayIn || [])) || [];
//     //deep-clone that shit, otherwise we get a bug-infestation!
//   }
// }
// // const rolls1_settings = new RollsSettings()
// const rolls1_settings = {}


class SampleSettings {
  constructor(turns, rollsPerTurn, c, d) {
    this.turns = turns || 10000
    this.rollsPerTurn = rollsPerTurn || 3
  }
}

const sample1_settings = new SampleSettings(10000, 3)

/* creates an array of samples, each sample is an array of several rolls
  - starts with fixed=needed length to make sure all fixed-/starting-lengths are covered
  */
function get_samples(settings) {
  const log = []
  const turns = settings.turns || 100;
  const rollsPerTurn = settings.rollsPerTurn || 3
  for (let turn = 1; turn <= turns; turn++) { //start with one because reasons
    let rolledDices = []
    let fixedDices = Array((turn - 1) % rollsPerTurn + 1).fill(1)
    for (let roll = 1; roll <= rollsPerTurn; roll++) {
      log[turn] = log[turn] ? log[turn] : []
      if (roll === 1) log[turn].push(fixedDices)
      rolls1_settings.array = JSON.parse(JSON.stringify(fixedDices))
      rolledDices = get_rollsArray(rolls1_settings)
      fixedDices = get_X_of_a_kind(rolledDices)[0] || []
      fixedDices = fixedDices.length >= 2 ? fixedDices : []
      log[turn].push(fixedDices)
    }
  }
  log.shift() // get rid of that first empty element
  return log
}

function get_emptyMatrix(size_input) {
  const size = size_input + 1 || 2 + 1
  const matrix = [];
  for (let row = 0; row < size; row++) {
    matrix[row] = []
    for (let column = 0; column < size; column++) {
      matrix[row][column] = 0
    }
  }
  return matrix
}


function sample_to_transfMatrix(samples_input, settings_input) {
  if (!samples_input) {
    console.log('get me some samples!');
    return
  }
  const matrixSize = settings_input.length
  const turns = samples_input.length || get_samples(sample1_settings).length
  const turnLength = samples_input[0].length
  let resultsMatrix = get_emptyMatrix(matrixSize)
  /* getting the results-matrix, e.g.
    [ [ 0, 0, 0, 0, 0, 0 ],
    [ 0, 40, 681, 280, 39, 0 ],
    [ 0, 0, 465, 420, 90, 9 ],
    [ 0, 0, 0, 486, 224, 31 ],
    [ 0, 0, 0, 0, 168, 40 ],
    [ 0, 0, 0, 0, 0, 27 ] ] */
  for (let loopI = 0; loopI < turns; loopI++) {
    const currentSample = JSON.parse(JSON.stringify(samples_input[loopI]))
    let lastFixed = currentSample[0].length
    let currentFixed = 1
    for (let loopJ = 1; loopJ < turnLength; loopJ++) {
      lastFixed = lastFixed || 1
      currentFixed = currentSample[loopJ].length || 1
      resultsMatrix[lastFixed][currentFixed]++
      lastFixed = currentFixed
    }
  }
  /* getting the transformation-matrix, e.g.
    [ [ 0, 0, 0, 0, 0, 0 ],
    [ 0, 0.038, 0.672, 0.256, 0.032, 0.002 ],
    [ 0, 0, 0.479, 0.417, 0.096, 0.008 ],
    [ 0, 0, 0, 0.64, 0.32, 0.04 ],
    [ 0, 0, 0, 0, 0.8, 0.2 ],
    [ 0, 0, 0, 0, 0, 1 ] ] */
  const transfMatrix = JSON.parse(JSON.stringify(resultsMatrix))
  for (let loopA = 0; loopA < resultsMatrix.length; loopA++) {
    const rowSum = arraySum(resultsMatrix[loopA]) || 1
    for (let loopB = 0; loopB < resultsMatrix[0].length; loopB++) {
      transfMatrix[loopA][loopB] = Math.round(resultsMatrix[loopA][loopB] / rowSum * 1000) / 1000
    }
  }
  return transfMatrix
}

function get_transfMatrix(settings) {
  const alts = settings.alts || 6
  const min = settings.min || 1
  const max = settings.max || 6
  const length = settings.length || 5
  const turns = settings.turns || 10000
  const rollsPerTurn = settings.rollsPerTurn || 3


  const samples = get_samples({
    turns: turns,
    rollsPerTurn: rollsPerTurn
  })
  const result = sample_to_transfMatrix(samples, {
    length: rollsPerTurn
  })
  return result
}
const storage = {}
const altsStart = 2
const altsMax = 6
const rollsStart = 1
const rollsMax = 10
for (let alts = altsStart; alts <= altsMax; alts++) {
  storage[alts] = {}
  for (let rolls = rollsStart; rolls <= rollsMax; rolls++) {
    sample1_settings.turns = 100
    sample1_settings.rollsPerTurn = rolls
    rolls1_settings.length = rolls
    rolls1_settings.max = alts
    rolls1_settings.array = []
    rolls1_settings.min = 1
    const samples = get_samples(sample1_settings)
    const result = sample_to_transfMatrix(samples, rolls1_settings)
    storage[alts][rolls] = result
    console.log(`progress:  ${((rolls - rollsStart + 1) + rollsMax * (alts - altsStart))}/${(altsMax - altsStart + 1) * (rollsMax - rollsStart + 1)}`)
  }
}
require('child_process').spawn('clip').stdin.end(util.inspect((storage)));

fs.writeFile('testfile123.txt', JSON.stringify(storage), function (err, file) {
  if (err) throw err;
  console.log('Saved!');
})

// to test the "randomness" of floor+random. seems fine
// function get_random(settings_input) {
//   const length = 100000
//   const array = []
//   const min = 1
//   const max = 6
//   const span = max - min
//   for (let i = 0; i < length; i++) {
//     array.push(Math.floor(Math.random() * span + min))
//     // array.push(random.die(6))

//   }
//   const groupedArray = get_X_of_a_kind(array)
//   const resultsArray = []
//   for (let i = 0; i < groupedArray.length; i++) {
//     resultsArray[i] = groupedArray[i].length
//   }
//   console.log(resultsArray)
// }
// get_random()



// {"2":{"1":[[0,0],[0,1]],"2":[[0,0,0],[0,0.5,0.5],[0,0,1]],"3":[[0,0,0,0],[0,0,0.752,0.248],[0,0,0.504,0.496],[0,0,0,1]],"4":[[0,0,0,0,0],[0,0,0.371,0.506,0.123],[0,0,0.249,0.501,0.25],[0,0,0,0.503,0.497],[0,0,0,0,1]],"5":[[0,0,0,0,0,0],[0,0,0,0.625,0.311,0.064],[0,0,0,0.496,0.381,0.123],[0,0,0,0.25,0.498,0.252],[0,0,0,0,0.498,0.502],[0,0,0,0,0,1]],"6":[[0,0,0,0,0,0,0],[0,0,0,0.307,0.473,0.189,0.03],[0,0,0,0.254,0.432,0.253,0.061],[0,0,0,0.122,0.379,0.377,0.122],[0,0,0,0,0.249,0.501,0.25],[0,0,0,0,0,0.501,0.499],[0,0,0,0,0,0,1]],"7":[[0,0,0,0,0,0,0,0],[0,0,0,0,0.547,0.327,0.112,0.014],[0,0,0,0,0.474,0.343,0.153,0.03],[0,0,0,0,0.31,0.373,0.252,0.065],[0,0,0,0,0.127,0.373,0.375,0.125],[0,0,0,0,0,0.251,0.501,0.248],[0,0,0,0,0,0,0.498,0.502],[0,0,0,0,0,0,0,1]],"8":[[0,0,0,0,0,0,0,0,0],[0,0,0,0,0.273,0.442,0.218,0.059,0.008],[0,0,0,0,0.237,0.404,0.254,0.09,0.016],[0,0,0,0,0.16,0.349,0.304,0.157,0.03],[0,0,0,0,0.063,0.251,0.375,0.248,0.063],[0,0,0,0,0,0.123,0.376,0.377,0.124],[0,0,0,0,0,0,0.252,0.498,0.25],[0,0,0,0,0,0,0,0.499,0.501],[0,0,0,0,0,0,0,0,1]],"9":[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0.498,0.324,0.138,0.035,0.004],[0,0,0,0,0,0.444,0.323,0.173,0.053,0.008],[0,0,0,0,0,0.325,0.326,0.234,0.097,0.019],[0,0,0,0,0,0.186,0.319,0.309,0.152,0.032],[0,0,0,0,0,0.063,0.247,0.376,0.252,0.062],[0,0,0,0,0,0,0.126,0.373,0.374,0.127],[0,0,0,0,0,0,0,0.251,0.498,0.251],[0,0,0,0,0,0,0,0,0.498,0.502],[0,0,0,0,0,0,0,0,0,1]],"10":[[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0.244,0.416,0.233,0.085,0.02,0.001],[0,0,0,0,0,0.219,0.378,0.25,0.116,0.033,0.004],[0,0,0,0,0,0.164,0.319,0.287,0.167,0.055,0.008],[0,0,0,0,0,0.091,0.255,0.316,0.235,0.09,0.014],[0,0,0,0,0,0.031,0.153,0.311,0.314,0.161,0.031],[0,0,0,0,0,0,0.06,0.251,0.38,0.247,0.061],[0,0,0,0,0,0,0,0.124,0.379,0.374,0.123],[0,0,0,0,0,0,0,0,0.251,0.499,0.25],[0,0,0,0,0,0,0,0,0,0.501,0.499],[0,0,0,0,0,0,0,0,0,0,1]]},"3":{"1":[[0,0],[0,1]],"2":[[0,0,0],[0,0.668,0.332],[0,0,1]],"3":[[0,0,0,0],[0,0.222,0.67,0.109],[0,0,0.667,0.333],[0,0,0,1]],"4":[[0,0,0,0,0],[0,0,0.674,0.291,0.035],[0,0,0.444,0.445,0.111],[0,0,0,0.667,0.333],[0,0,0,0,1]],"5":[[0,0,0,0,0,0],[0,0,0.371,0.491,0.125,0.013],[0,0,0.22,0.521,0.222,0.038],[0,0,0,0.443,0.445,0.112],[0,0,0,0,0.667,0.333],[0,0,0,0,0,1]],"6":[[0,0,0,0,0,0,0],[0,0,0.123,0.575,0.248,0.05,0.004],[0,0,0.073,0.493,0.324,0.098,0.011],[0,0,0,0.298,0.44,0.226,0.036],[0,0,0,0,0.443,0.446,0.111],[0,0,0,0,0,0.665,0.335],[0,0,0,0,0,0,1]],"7":[[0,0,0,0,0,0,0,0],[0,0,0,0.476,0.387,0.118,0.019,0.001],[0,0,0,0.377,0.409,0.169,0.04,0.004],[0,0,0,0.171,0.418,0.3,0.098,0.013],[0,0,0,0,0.295,0.446,0.224,0.035],[0,0,0,0,0,0.445,0.446,0.11],[0,0,0,0,0,0,0.667,0.333],[0,0,0,0,0,0,0,1]],"8":[[0,0,0,0,0,0,0,0,0],[0,0,0,0.26,0.481,0.201,0.05,0.007,0.001],[0,0,0,0.198,0.449,0.251,0.084,0.016,0.002],[0,0,0,0.083,0.365,0.345,0.162,0.041,0.004],[0,0,0,0,0.196,0.397,0.297,0.099,0.012],[0,0,0,0,0,0.295,0.444,0.224,0.037],[0,0,0,0,0,0,0.446,0.443,0.111],[0,0,0,0,0,0,0,0.665,0.335],[0,0,0,0,0,0,0,0,1]],"9":[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0.083,0.484,0.308,0.099,0.022,0.004,0],[0,0,0,0.067,0.416,0.33,0.141,0.039,0.007,0],[0,0,0,0.028,0.293,0.356,0.225,0.081,0.016,0.001],[0,0,0,0,0.125,0.331,0.328,0.169,0.041,0.004],[0,0,0,0,0,0.195,0.399,0.298,0.097,0.012],[0,0,0,0,0,0,0.295,0.445,0.223,0.037],[0,0,0,0,0,0,0,0.445,0.446,0.109],[0,0,0,0,0,0,0,0,0.665,0.335],[0,0,0,0,0,0,0,0,0,1]],"10":[[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0.376,0.398,0.168,0.048,0.009,0.001,0],[0,0,0,0,0.311,0.388,0.209,0.072,0.018,0.001,0],[0,0,0,0,0.187,0.365,0.269,0.135,0.038,0.007,0],[0,0,0,0,0.071,0.275,0.332,0.219,0.085,0.016,0.001],[0,0,0,0,0,0.134,0.333,0.328,0.161,0.041,0.004],[0,0,0,0,0,0,0.197,0.395,0.3,0.096,0.013],[0,0,0,0,0,0,0,0.295,0.445,0.223,0.037],[0,0,0,0,0,0,0,0,0.446,0.442,0.112],[0,0,0,0,0,0,0,0,0,0.667,0.333],[0,0,0,0,0,0,0,0,0,0,1]]},"4":{"1":[[0,0],[0,1]],"2":[[0,0,0],[0,0.751,0.249],[0,0,1]],"3":[[0,0,0,0],[0,0.374,0.564,0.061],[0,0,0.75,0.25],[0,0,0,1]],"4":[[0,0,0,0,0],[0,0.095,0.702,0.187,0.016],[0,0,0.56,0.377,0.063],[0,0,0,0.749,0.251],[0,0,0,0,1]],"5":[[0,0,0,0,0,0],[0,0,0.586,0.351,0.06,0.004],[0,0,0.378,0.47,0.136,0.015],[0,0,0,0.561,0.376,0.062],[0,0,0,0,0.752,0.248],[0,0,0,0,0,1]],"6":[[0,0,0,0,0,0,0],[0,0,0.346,0.501,0.132,0.019,0.001],[0,0,0.213,0.518,0.22,0.046,0.004],[0,0,0,0.423,0.422,0.14,0.016],[0,0,0,0,0.561,0.377,0.063],[0,0,0,0,0,0.75,0.25],[0,0,0,0,0,0,1]],"7":[[0,0,0,0,0,0,0,0],[0,0,0.154,0.564,0.232,0.045,0.005,0],[0,0,0.089,0.497,0.306,0.093,0.015,0.001],[0,0,0,0.305,0.432,0.214,0.046,0.004],[0,0,0,0,0.421,0.424,0.14,0.016],[0,0,0,0,0,0.56,0.377,0.063],[0,0,0,0,0,0,0.75,0.25],[0,0,0,0,0,0,0,1]],"8":[[0,0,0,0,0,0,0,0,0],[0,0,0.04,0.512,0.336,0.096,0.016,0.001,0],[0,0,0.021,0.408,0.391,0.142,0.033,0.004,0],[0,0,0,0.204,0.428,0.262,0.089,0.015,0.001],[0,0,0,0,0.316,0.423,0.211,0.046,0.004],[0,0,0,0,0,0.423,0.422,0.14,0.015],[0,0,0,0,0,0,0.565,0.374,0.061],[0,0,0,0,0,0,0,0.75,0.25],[0,0,0,0,0,0,0,0,1]],"9":[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0.374,0.433,0.153,0.033,0.006,0,0],[0,0,0,0.287,0.433,0.206,0.06,0.013,0.001,0],[0,0,0,0.123,0.396,0.312,0.133,0.033,0.004,0],[0,0,0,0,0.232,0.398,0.267,0.087,0.015,0.001],[0,0,0,0,0,0.316,0.423,0.212,0.045,0.004],[0,0,0,0,0,0,0.424,0.419,0.142,0.016],[0,0,0,0,0,0,0,0.564,0.373,0.063],[0,0,0,0,0,0,0,0,0.751,0.249],[0,0,0,0,0,0,0,0,0,1]],"10":[[0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0.212,0.484,0.227,0.064,0.012,0.001,0,0],[0,0,0,0.155,0.441,0.276,0.101,0.024,0.003,0.001,0],[0,0,0,0.066,0.345,0.343,0.175,0.057,0.012,0.002,0],[0,0,0,0,0.168,0.365,0.299,0.131,0.032,0.005,0],[0,0,0,0,0,0.235,0.399,0.264,0.087,0.014,0.001],[0,0,0,0,0,0,0.319,0.42,0.209,0.047,0.004],[0,0,0,0,0,0,0,0.422,0.419,0.141,0.017],[0,0,0,0,0,0,0,0,0.561,0.377,0.062],[0,0,0,0,0,0,0,0,0,0.75,0.25],[0,0,0,0,0,0,0,0,0,0,1]]},"5":{"1":[[0,0],[0,1]],"2":[[0,0,0],[0,0.802,0.198],[0,0,1]],"3":[[0,0,0,0],[0,0.482,0.477,0.041],[0,0,0.802,0.198],[0,0,0,1]],"4":[[0,0,0,0,0],[0,0.192,0.671,0.129,0.008],[0,0,0.638,0.322,0.04],[0,0,0,0.801,0.199],[0,0,0,0,1]],"5":[[0,0,0,0,0,0],[0,0.038,0.681,0.248,0.032,0.002],[0,0,0.479,0.416,0.098,0.008],[0,0,0,0.638,0.322,0.04],[0,0,0,0,0.8,0.2],[0,0,0,0,0,1]],"6":[[0,0,0,0,0,0,0],[0,0,0.516,0.403,0.073,0.008,0],[0,0,0.329,0.486,0.159,0.026,0.001],[0,0,0,0.51,0.386,0.096,0.008],[0,0,0,0,0.639,0.321,0.039],[0,0,0,0,0,0.8,0.2],[0,0,0,0,0,0,1]],"7":[[0,0,0,0,0,0,0,0],[0,0,0.326,0.505,0.145,0.021,0.002,0],[0,0,0.195,0.51,0.237,0.052,0.006,0],[0,0,0,0.406,0.413,0.153,0.026,0.002],[0,0,0,0,0.512,0.383,0.097,0.008],[0,0,0,0,0,0.638,0.321,0.041],[0,0,0,0,0,0,0.8,0.2],[0,0,0,0,0,0,0,1]],"8":[[0,0,0,0,0,0,0,0,0],[0,0,0.163,0.557,0.227,0.046,0.007,0,0],[0,0,0.091,0.497,0.305,0.09,0.016,0.002,0],[0,0,0,0.312,0.428,0.204,0.05,0.006,0],[0,0,0,0,0.404,0.412,0.155,0.027,0.002],[0,0,0,0,0,0.512,0.383,0.096,0.009],[0,0,0,0,0,0,0.64,0.321,0.04],[0,0,0,0,0,0,0,0.799,0.201],[0,0,0,0,0,0,0,0,1]],"9":[[0,0,0,0,0,0,0,0,0,0],[0,0,0.057,0.526,0.323,0.079,0.014,0.002,0,0],[0,0,0.032,0.438,0.37,0.129,0.026,0.005,0,0],[0,0,0,0.218,0.429,0.254,0.081,0.017,0.001,0],[0,0,0,0,0.323,0.415,0.205,0.05,0.006,0],[0,0,0,0,0,0.406,0.413,0.154,0.026,0.002],[0,0,0,0,0,0,0.511,0.385,0.095,0.008],[0,0,0,0,0,0,0,0.639,0.32,0.041],[0,0,0,0,0,0,0,0,0.799,0.201],[0,0,0,0,0,0,0,0,0,1]],"10":[[0,0,0,0,0,0,0,0,0,0,0],[0,0,0.011,0.417,0.41,0.13,0.027,0.004,0.001,0,0],[0,0,0.006,0.321,0.425,0.186,0.051,0.01,0.001,0,0],[0,0,0,0.151,0.409,0.29,0.117,0.028,0.005,0,0],[0,0,0,0,0.26,0.401,0.242,0.081,0.015,0.001,0],[0,0,0,0,0,0.329,0.41,0.204,0.051,0.006,0],[0,0,0,0,0,0,0.408,0.41,0.154,0.026,0.002],[0,0,0,0,0,0,0,0.512,0.382,0.097,0.008],[0,0,0,0,0,0,0,0,0.64,0.319,0.04],[0,0,0,0,0,0,0,0,0,0.798,0.202],[0,0,0,0,0,0,0,0,0,0,1]]},"6":{"1":[[0,0],[0,1]],"2":[[0,0,0],[0,0.832,0.168],[0,0,1]],"3":[[0,0,0,0],[0,0.556,0.417,0.027],[0,0,0.832,0.168],[0,0,0,1]],"4":[[0,0,0,0,0],[0,0.277,0.624,0.094,0.005],[0,0,0.694,0.278,0.028],[0,0,0,0.832,0.168],[0,0,0,0,1]],"5":[[0,0,0,0,0,0],[0,0.092,0.692,0.195,0.02,0.001],[0,0,0.56,0.369,0.068,0.004],[0,0,0,0.696,0.277,0.027],[0,0,0,0,0.833,0.167],[0,0,0,0,0,1]],"6":[[0,0,0,0,0,0,0],[0,0.013,0.618,0.314,0.05,0.004,0],[0,0,0.414,0.45,0.119,0.016,0.001],[0,0,0,0.58,0.347,0.068,0.005],[0,0,0,0,0.694,0.278,0.029],[0,0,0,0,0,0.834,0.166],[0,0,0,0,0,0,1]],"7":[[0,0,0,0,0,0,0,0],[0,0,0.462,0.434,0.093,0.011,0,0],[0,0,0.284,0.505,0.175,0.033,0.003,0],[0,0,0,0.481,0.387,0.116,0.014,0.001],[0,0,0,0,0.578,0.349,0.069,0.005],[0,0,0,0,0,0.696,0.276,0.028],[0,0,0,0,0,0,0.832,0.168],[0,0,0,0,0,0,0,1]],"8":[[0,0,0,0,0,0,0,0,0],[0,0,0.287,0.531,0.156,0.023,0.002,0,0],[0,0,0.173,0.521,0.238,0.059,0.008,0.001,0],[0,0,0,0.391,0.414,0.159,0.034,0.003,0],[0,0,0,0,0.482,0.386,0.116,0.015,0.001],[0,0,0,0,0,0.58,0.347,0.068,0.005],[0,0,0,0,0,0,0.695,0.277,0.028],[0,0,0,0,0,0,0,0.833,0.167],[0,0,0,0,0,0,0,0,1]],"9":[[0,0,0,0,0,0,0,0,0,0],[0,0,0.156,0.562,0.228,0.046,0.007,0.001,0,0],[0,0,0.086,0.496,0.314,0.085,0.018,0.002,0,0],[0,0,0,0.307,0.425,0.205,0.053,0.008,0.001,0],[0,0,0,0,0.398,0.406,0.161,0.032,0.003,0],[0,0,0,0,0,0.481,0.387,0.115,0.016,0.001],[0,0,0,0,0,0,0.579,0.347,0.069,0.005],[0,0,0,0,0,0,0,0.694,0.277,0.029],[0,0,0,0,0,0,0,0,0.833,0.167],[0,0,0,0,0,0,0,0,0,1]],"10":[[0,0,0,0,0,0,0,0,0,0,0],[0,0,0.069,0.532,0.31,0.076,0.012,0.002,0,0,0],[0,0,0.039,0.442,0.367,0.117,0.03,0.004,0,0,0],[0,0,0,0.235,0.432,0.237,0.079,0.015,0.002,0,0],[0,0,0,0,0.334,0.404,0.198,0.055,0.008,0.001,0],[0,0,0,0,0,0.403,0.402,0.16,0.031,0.003,0],[0,0,0,0,0,0,0.483,0.386,0.115,0.016,0.001],[0,0,0,0,0,0,0,0.577,0.348,0.069,0.005],[0,0,0,0,0,0,0,0,0.696,0.276,0.028],[0,0,0,0,0,0,0,0,0,0.832,0.168],[0,0,0,0,0,0,0,0,0,0,1]]}}
