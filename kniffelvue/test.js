const math = require('mathjs');

// const matrixInfo = {
//   width: 5,
//   height: 5
// }
// const z = Array(matrixInfo.height).fill().map(() => (Array(matrixInfo.width).fill()))
// const potentialArray = Array(6).fill().map((x, i) => (i * 6))
// let i = 0;
// let j = 0;
// for (i = 0; i < matrixInfo.width; i++) {
//   for (j = 0; j < matrixInfo.height; j++) {
//     z[i][j] = i.toString() + j.toString()
//   }
// }
// // console.log(z)

// // const answerToEverything = [
// //   [120 / 1296, 900 / 1296, 250 / 1296, 25 / 1296, 1 / 1296],
// //   [0, 120 / 216, 80 / 216, 15 / 216, 1 / 216],
// //   [0, 0, 25 / 36, 10 / 36, 1 / 36],
// //   [0, 0, 0, 5 / 6, 1 / 6],
// //   [0, 0, 0, 0, 1]
// // ]

// const answerToEverything = {
// }
// function generateAnswersToEverything() {
//   const base = [
//     [120 / 1296, 900 / 1296, 250 / 1296, 25 / 1296, 1 / 1296],
//     [0, 120 / 216, 80 / 216, 15 / 216, 1 / 216],
//     [0, 0, 25 / 36, 10 / 36, 1 / 36],
//     [0, 0, 0, 5 / 6, 1 / 6],
//     [0, 0, 0, 0, 1]
//   ]
//   for (let k = 0; k <= 5; k++) {
//     answerToEverything[k] = add_padding_Matrix(round_matrix(math.pow(base, k), 3))
//   }

// }
// generateAnswersToEverything();
// // console.log(answerToEverything)

// // // the mathematics
// // const array2 = answerToEverything[2][3]
// // const array1 = potentialArray.slice(0, answerToEverything[2][3].length)
// // const asdffasdf = math.dotMultiply(array1, array2)
// // console.log(array1)
// // console.log(array2)
// // console.log(asdffasdf)

// // // the mathematics
// // const rollsLeft = 2
// // const startingSize = 3
// // console.log('____________', answerToEverything[rollsLeft][startingSize], "--------------")
// // const array2b = answerToEverything[rollsLeft][startingSize].slice(startingSize, answerToEverything[rollsLeft][startingSize].length)
// // const array1b = potentialArray.slice(startingSize, startingSize + array2b.length)
// // const asdffasdfb = math.dotMultiply(array1b, array2b)
// // console.log(array1b)
// // console.log(array2b)
// // console.log(asdffasdfb)


// // function add_padding_Matrix(goodMatrix) {
// //   const crap = JSON.parse(JSON.stringify(goodMatrix))
// //   crap.map(x => x.unshift(0))
// //   crap.unshift(Array(crap[0].length).fill(0))
// //   return crap
// // }

// // function round_matrix(endlessFloating, potInput) {
// //   const pot = potInput || 2
// //   const copyEndlessFloating = JSON.parse(JSON.stringify(endlessFloating))
// //   const bla = copyEndlessFloating.map(x => x.map(y => Math.round(y * (10 ** pot)) / (10 ** pot)))
// //   return bla
// // }

// // console.log(typeof answerToEverything, typeof answerToEverythingArrays)
// // console.log(answerToEverythingArrays[1][5])
// // console.log(answerToEverything)
// // answerToEverything.map(x => console.log(x, x.length))
// // console.log(answerToEverything.length, answerToEverything[1].length)
// // console.log(math.pow(answerToEverything, 1))
// // console.log(math.pow(answerToEverything, 2))
// // const answer2 = math.pow(answerToEverything, 2)
// // console.log(answer2)
// // console.log(round_matrix(answer2))
// // const array1 = [1, 2, 3, 4]
// // const array2 = [0, 5, 3, 5]
// // const result = math.add(array1, array2)
// // console.log('result: ', result)
// // const result2 = math.pow(answerToEverything, 1)
// // console.log('result2: ', result2)


// // function timeFormatted(initialTime, initialUnit) {
// //   const timeUnits = {
// //     ms: 1000,
// //     s: 60,
// //     m: 60,
// //     h: 24,
// //     d: 1,
// //     default: 99999999
// //   }
// //   const time = {
// //     raw: initialTime || 1,
// //     rawUnit: initialUnit && (initialUnit in timeUnits) ? initialUnit : "ms",
// //     norm: 0,
// //     normUnit: 'ms'
// //   }
// //   console.log('prelulzasdf: ', time)
// //   function lulzasdf(dafuq) {
// //     console.log('in lulzasdf: ', dafuq, typeof (dafuq.number), typeof (dafuq.unit))
// //     let wheeeee = dafuq.number || 1
// //     let hohoho = dafuq.unit || 'ms'
// //     if (wheeeee / timeUnits[hohoho] < 1) return dafuq
// //     wheeeee /= timeUnits[hohoho]
// //     hohoho = hohoho === 'ms' ? 's' :
// //       hohoho === 's' ? 'm' :
// //         hohoho === 'm' ? 'h' :
// //           hohoho === 'h' ? 'd' :
// //             hohoho === 'd' ? 'd' : 'default';
// //     return lulzasdf({ number: wheeeee, unit: hohoho })
// //   }
// //   const arg = {
// //     number: time.raw,
// //     unit: time.rawUnit
// //   }
// //   const response = lulzasdf(arg)
// //   console.log('response: ', response)
// //   time.norm = response.number
// //   time.normUnit = response.unit
// //   console.log('time: ', time)
// //   return time
// // }

// // const bla = timeFormatted(12345, 'potatoes')
// // console.log('time: ', bla)
console.log('____________________________________')
console.log('____________________________________')
const oddsArray = [0, 0, 0.171, 0.436, 0.316, 0.077, 1470123]
const possibleResultsArray = [0, 2, 4, 6, 8, 10]
const sharedLength = Math.min(possibleResultsArray.length, oddsArray.length)
console.log('shared length: ', sharedLength)
const array1 = possibleResultsArray.slice(0, sharedLength)
const array2 = oddsArray.slice(0, sharedLength)
console.log('arrays: ', array1, array2)

const datObject = {}
for (let i = 0; i < sharedLength; i++) {
  const subObject = { value: array1[i] || 0, odds: array2[i] || 0 }
  datObject[i] = subObject
}
console.log('dat object: ', datObject)
const factoredArray = math.dotMultiply(array1, array2)
const average = arraySum(factoredArray)
const keys = Object.keys(datObject)
console.log('keys: ', keys)
const filtered = keys.filter(keyIndex => datObject[keyIndex].odds > 0)
console.log('filtered: ', filtered)
const minValue = datObject[filtered[0]].value || 0
const minOdds = datObject[filtered[0]].odds
const maxValue = datObject[filtered[filtered.length - 1]].value || 0
const maxOdds = datObject[filtered[filtered.length - 1]].odds || 0
const likelyOdds = Math.max(...array2)
const likelyValue = datObject[keys.filter(keyIndex => datObject[keyIndex].odds == likelyOdds)].value

const elObjecte = {
  valuesArray: possibleResultsArray,
  oddsArray: oddsArray,
  data: datObject,
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

console.log('result?!', elObjecte)


function arraySum(array) {
  if (!array.length) {
    return 0;
  }
  const add = (a, b) => parseInt(a, 10) + parseInt(b, 10);
  const sum = array.reduce(add);
  return sum;
};
