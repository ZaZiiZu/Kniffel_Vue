var synaptic = require('synaptic'); // this line is not needed in the browser
var DiceGenerator = require('../../src/objects/DiceGenerator')
var Neuron = synaptic.Neuron
var Layer = synaptic.Layer
var Network = synaptic.Network
var Trainer = synaptic.Trainer
var Architect = synaptic.Architect
const colors = require('colors')
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

var myNet = new Architect.Perceptron(6, 5, 5, 5, 1);
var trainer = new Trainer(myNet)

const data1 = [{
  "rollsArr": [1, 2, 3, 4, 5, 8, 9, 10],
  "isLS": true
}, {
  "rollsArr": [1, 2, 4, 5, 8, 9, 10, 12],
  "isLS": false
}, {
  "rollsArr": [2, 3, 4, 5, 6, 8, 9, 10],
  "isLS": true
}, {
  "rollsArr": [3, 4, 5, 8, 9, 10, 11, 12],
  "isLS": true
}, {
  "rollsArr": [1, 2, 4, 5, 8, 10, 12, 12],
  "isLS": false
}, {
  "rollsArr": [1, 3, 4, 5, 8, 9, 10, 10],
  "isLS": false
}, {
  "rollsArr": [1, 2, 8, 9, 10, 10, 10, 10],
  "isLS": false
}, {
  "rollsArr": [1, 2, 3, 4, 8, 9, 10, 12],
  "isLS": false
}]

class SampleGenerator extends DiceGenerator {
  constructor(lineType) {
    const settingsDefault = {
      length: 5,
      min: 1,
      max: 6,
      initArray: []
    }
    super(settingsDefault);
    this.isType = this.isType || this.LS()
  }

  LS() {
    const arrToCheck = JSON.parse(JSON.stringify(this.arrayDice))
    const diffArray = Array.from(new Set(arrToCheck)).sort().map((n, index) => n - index)
    const maxVal = Math.max(...diffArray)
    let diffSums = Array(maxVal + 1).fill(0).map((x, index) => diffArray.filter(n => n == index).length)
    const highestSum = Math.max(...diffSums)
    return highestSum >= 5 ? 1 : 0

  }
}

function getSamples() {
  const amount = 100000;
  let sampleArr = Array(amount).fill({})
  sampleArr.map((el, index) => {
    const newSample = new SampleGenerator()
    sampleArr[index] = {
      'rollsArr': newSample.arrayDice,
      'isLS': [newSample.isType]
    }
    // if (sampleArr[index]['isLS'] == 1) {
    //   console.log(' got one: ', newSample.arrayDice.sort((a, b) => a - b), newSample.isType)
    // }
  })
  console.log('sample-length: ', sampleArr.length)
  return sampleArr
}


function arrToBinary(rollsArr) {
  const data1Set = new Set(rollsArr)
  const data1Binary = Array(Math.max(...data1Set, 6) + 1).fill(0).map((x, index) => data1Set.has(index) ? 1 : 0)
  data1Binary.shift()
  return data1Binary
}

function arrOfArrNormalize(arr2d, keyInput, keyOutput) {
  let arr2dClone = JSON.parse(JSON.stringify(arr2d))
  let arrResult = []
  arr2dClone.forEach(el => arrResult.push({
    input: arrToBinary(el[keyInput]),
    output: el[keyOutput] // ? [1] : [0]
  }))
  // arrResult.forEach((el, index) => {
  //   if (el.input.length != 8) {
  //     console.log('length?!', index, el)
  //   }
  // })
  return arrResult
}
for (let i = 0; i <= 0; i++) {
  var trainingSet = arrOfArrNormalize(getSamples(), 'rollsArr', 'isLS')
  var trainingOptions = {
    rate: 0.01,
    iterations: 10000,
    error: 0.005

  }
  const results = trainer.train(trainingSet, trainingOptions)
  console.log(' results?!', results)
  const arraysToCheck = [{
    input: [1, 2, 2, 3, 4, 4, 4, 4, 5, 2, 2, 5],
    output: 1
  },
    // [1, 2, 2, 3, 4, 4, 4, 4, 5, 2, 2, 5],
  {
    input: [1, 2, 3, 4, 5],
    output: 1
  },
  {
    input: [1, 1, 3, 4, 5],
    output: 0
  },
  {
    input: [1, 1, 1, 1, 1],
    output: 0
  },
  {
    input: [2, 3, 4, 5, 6],
    output: 1
  },
  {
    input: [5, 4, 6, 2, 9],
    output: 0
  },
  {
    input: [7, 8, 2, 1, 11],
    output: 0
  },
  {
    input: [21, 22, 23, 24, 25],
    output: 1
  }
    // [1, 2, 3, 4, 5],
    // [1, 1, 3, 4, 5],
    // [1, 1, 1, 1, 1],
    // [2, 3, 4, 5, 6],
    // [5, 4, 6, 2, 9],
    // [7, 8, 2, 1, 11],
    // [21, 22, 23, 24, 25]
  ]
  for (let l = 0; l <= 10000; l++) {
    arraysToCheck.forEach((el, index) => {
      const binArr = arrToBinary(el.input)
      // console.log('el, binArr: ', el, binArr)
      let result = Math.round(myNet.activate(binArr)[0] * 10000) / 10000
      // console.log('result: ', ('' + result).yellow)
      myNet.propagate(0.001, [el.output])
      console.log('Array '.red, (el.input + "").green, ' is LS ? ', (result + "").green, (result - el.output))
    })
  }
  const arraysToCheckAfter = [{
    input: [21, 22, 23, 24, 25],
    output: 1
  },
  {
    input: [23, 24, 26, 25, 27],
    output: 1
  },
  {
    input: [31, 31, 33, 34, 35],
    output: 0
  },
  {
    input: [7, 8, 6, 5, 9],
    output: 1
  },
  {
    input: [31, 32, 33, 34, 35],
    output: 1
  },
  {
    input: [7, 1, 6, 5, 9],
    output: 0
  }
  ]
  console.log('______________________________________________________'.purple)

  for (let l = 0; l <= 0; l++) {
    arraysToCheckAfter.forEach((el, index) => {
      const binArr = arrToBinary(el.input)
      // console.log('el, binArr: ', el, binArr)
      let result = Math.round(myNet.activate(binArr)[0] * 10000) / 10000
      // console.log('result: ', ('' + result).yellow)
      // myNet.propagate(0.01, [el.output])
      console.log('Array '.red, (el.input + "").green, ' is LS ? ', (result + "").green, (result - el.output))
    })
  }
}
// const someSampleSet = getSamples()


// console.log('arrOfArrNormalize: ', arrOfArrNormalize(data1, "rollsArr", "isLS"))

// // function getSequence(arr) {
// //   const noDublicates = removeDuplicate(arr).sort() || [1, 2, 3, 6]
// //   // let currentLength = 1;
// //   let maxLength = 1;
// //   let currentArray = [noDublicates[0]];
// //   let maxArray = [noDublicates[0]]; //***NEEEDS FIX at some point***: default-value, only triggers when there are NO 2+ sequences. Bad if it also starts with 1 while there are 2-5 available
// //   let newArray = [];
// //   // run through sorted array and slice after every sequence
// //   for (let i = 0; i < noDublicates.length - 1; i++) {
// //     if (noDublicates[i] === noDublicates[i + 1] - 1) {
// //       currentArray.push(noDublicates[i + 1])
// //     } else {
// //       newArray.push(currentArray.slice())
// //       currentArray = []
// //       currentArray.push(noDublicates[i + 1])
// //     }
// //   }
// //   newArray.push(currentArray.slice())
// //   newArray = newArray.filter(x => x.length >= 2) // filter all sequences length 2+
// //   if (newArray && newArray[0]) { // if there is anything left in ^, override maxArray and maxLength
// //     // sort below is for special cases like [1,2,4,5]: two doublets -> two options: keep 1,2 or 4,5? It now prefers 4,5 (because of sorting)
// //     if (newArray && newArray.length >= 2) {
// //       newArray.sort((a, b) => {
// //         if (a.length !== b.length) return (b.length - a.length) // sort by length(descending)
// //         return (Math.min(...a) === 1 || Math.max(...a) === 6) ? 1 : -1 //having same length, prioritize "open" pairs over "cornered" ones
// //       })
// //     }
// //     maxLength = newArray ? newArray[0].length : 1
// //     maxArray = newArray ? newArray[0] : []
// //   }
// //   return {
// //     maxLength,
// //     maxArray
// //   }
// // }
// function analyzeRolls(arr) {
//   const result = {};
//   //   const maxVal = Math.max(...arr)
//   //   let patternArr = Array(maxVal).fill(0)
//   //   patternArr.forEach((val, index) => {
//   //     patternArr[index] = arr.filter(n => n == index + 1).length
//   //   })
//   //   const maxBlock = Math.max(...patternArr)
//   //   let blockPatternArr = Array(maxBlock).fill(0)
//   //   blockPatternArr.forEach((val, index) => {
//   //     blockPatternArr[index] = patternArr.filter(n => n == index + 1).length
//   //   })
//   const maxVal = Math.max(...arr)
//   let patternArr = Array(maxVal + 1).fill(0).map((x, index) => arr.filter(n => n == index).length)
//   let blockPatternArr = Array(Math.max(...patternArr) + 1).fill(0).map((x, index) => patternArr.filter(n => n == index).length)
//   //   console.log('patternArr: ', patternArr)
//   //   console.log('blockPatternArr: ', blockPatternArr)
//   return blockPatternArr;
// }

// const test = analyzeRolls([1, 1, 1, 1, 2, 3, 5])

// // console.log('test: '.green, test)


// function whatAmI(blockpatternarr) {
//   console.log('Yahtzee', blockpatternarr.lastIndexOf(1) >= 5)
//   console.log('FoaK', blockpatternarr.lastIndexOf(1) >= 4)
//   console.log('ToaK ', blockpatternarr.lastIndexOf(1) >= 3)
//   console.log('LS', blockpatternarr.slice(1).reduce((prevV, currV) => prevV + currV) >= 5)
//   console.log('SS', blockpatternarr.slice(1).reduce((prevV, currV) => prevV + currV) >= 4)
//   console.log('FH', blockpatternarr[2] === 1 && blockpatternarr[3] === 1)
//   return 1
// }

// console.log('whatAmI', whatAmI(test))
// const arrToCheck123 = [0, 9, 8, 8, 1, 1, 2, 5, 6, 6, 6, 6, 6, 6, 7, 7, 7, 9]
// const diffArray = Array.from(new Set(arrToCheck123)).sort().map((n, index) => n - index)
// const maxVal = Math.max(...diffArray)
// let diffSums = Array(maxVal + 1).fill(0).map((x, index) => diffArray.filter(n => n == index).length)
// console.log('changing it', diffSums)
// console.log('changing it', Math.max(...diffSums))

// class Identifier {
//   constructor(rollsArr, pattern) {
//     this.rollsArr = rollsArr
//     this.pattern = pattern
//     this.isYahtzee = this.isYahtzee || this.checkYahtzee()
//     this.isFoaK = this.isFoaK || this.checkFoaK()
//     this.isToaK = this.isToaK || this.checkToaK()
//     this.isLS = this.isLS || this.checkLS()
//     this.isSS = this.isSS || this.checkSS()
//     this.isFH = this.isFH || this.checkFH()
//     this.isMatching = this.isMatching || this.checkMatching()
//   }
//   checkYahtzee() {
//     return this.pattern.lastIndexOf(1) >= 5
//   }
//   checkFoaK() {
//     return this.pattern.lastIndexOf(1) >= 4
//   }
//   checkToaK() {
//     return this.pattern.lastIndexOf(1) >= 3
//   }
//   checkLS() {
//     const lengthCheck = this.pattern.slice(1).reduce((prevV, currV) => prevV + currV) >= 5
//     const detailsCheck = 1
//     return this.pattern.lastIndexOf(1) >= 5
//   }
//   checkSS() {
//     return this.pattern.lastIndexOf(1) >= 5
//   }
//   checkFH() {
//     return this.pattern.lastIndexOf(1) >= 5
//   }
//   checkMatching() {
//     return this.pattern.lastIndexOf(1) >= 5
//   }
// }

// const asdf123 = [null, 1, 6, null, 235, null, 2222, 3462345, null, null, null, null, null, null, null]
// console.log('array?', asdf123.map(n => !n ? 1 : 0))
