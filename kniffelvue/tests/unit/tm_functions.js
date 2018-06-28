const _ = require('lodash')
const settingsDefault = {
  elementSettings: {
    minValue: 1,
    maxValue: 6,
    alts: this.maxValue - this.minValue + 1
  },
  arraySettings: {
    arrAmount: 3,
    elementsPerArray: 5,
    presetArray: []
  },
  sampleSettings: {
    sampleAmount: 100
  }
}

function get_transfMatrix(settingsOverride) {

  const settings = _.defaultsDeep(settingsOverride, settingsDefault)

  const elementSettings = settingsOverride.elementSettings
  const alts = settingsOverride.alts || settingsDefault.elementsettingsOverride.alts
  const minValue = settingsOverride.min || settingsDefault.elementsettingsOverride.min
  const maxValue = settingsOverride.max || settingsDefault.elementsettingsOverride.max
  const elementsPerArray = settingsOverride.elementsPerArray || settingsDefault.arraysettingsOverride.elementsPerArray
  const sampleAmount = settingsOverride.sampleAmount || settingsDefault.samplesettingsOverride.sampleAmount
  const rollsPerTurn = settingsOverride.rollsPerTurn || settingsDefault.arraysettingsOverride.arrAmount


  const samples = get_samples({
    sampleAmount: sampleAmount,
    rollsPerTurn: rollsPerTurn,
    elementSettings: elementSettings
  })
  const result = sample_to_transfMatrix(samples, {
    length: rollsPerTurn
  })
  return result
}

/* creates an array of samples, each sample is an array of several rolls
  - starts with fixed=needed length to make sure all fixed-/starting-lengths are covered
  */
function get_samples(settings) {
  const log = []
  const sampleAmount = settings.sampleAmount || 100;
  const rollsPerTurn = settings.rollsPerTurn || 3
  for (let sampleNr = 1; sampleNr <= sampleAmount; sampleNr++) { //start with one because reasons
    let rolledDices = []
    let fixedDices = Array((sampleNr - 1) % rollsPerTurn + 1).fill(settings.minValue)
    for (let roll = 1; roll <= rollsPerTurn; roll++) {
      log[sampleNr] = log[sampleNr] ? log[sampleNr] : []
      if (roll === 1) log[sampleNr].push(fixedDices) // initialize with the starting-array
      rolls1_settings.array = JSON.parse(JSON.stringify(fixedDices))
      rolledDices = get_rollsArray(rolls1_settings)
      fixedDices = get_X_of_a_kind(rolledDices)[0] || []
      fixedDices = fixedDices.length >= 2 ? fixedDices : []
      log[sampleNr].push(fixedDices)
    }
  }
  log.shift() // get rid of that first empty element
  return log
}

function get_rollsArray(settings) {
  const amountOfElements = settings.amount || 5
  const lowestRoll = settings.minVal || 1
  const highestRoll = settings.maxVal || 6
  const rollsArray = settings.rollsPreset || []
  const toRoll = highestRoll - lowestRoll + 1
  for (let i = rollsArray.length || 0; i < amountOfElements; i++) {
    const newRoll = Math.floor(Math.random() * toRoll + lowestRoll)
    rollsArray.push(newRoll)
  }
  return rollsArray
}


function get_XoakArray(arr) {
  const rollsArrayCopy = arr.slice() || [0, 0, 0, 0, 0]
  let XoakArray = [];
  /*  basically, create a new array to count all the individual elements, e.g. 1x1, 0x2, 0x3, 2x4, 2x5, 0x6 */
  for (let index = 0; index < rollsArrayCopy.length; index++) {
    const val = rollsArrayCopy[index]
    XoakArray[val] = (XoakArray[val]) ? XoakArray[val] : []
    XoakArray[val].push(val)
  }
  XoakArray = XoakArray.filter(n => n !== undefined); // clean the eventual "unidefined"
  XoakArray.sort((a, b) => { // sort by length(descending), then by value(descending)
    if (a.length !== b.length) return (b.length - a.length)
    if (a[0] !== b[0]) return (b[0] - a[0])
    return 0
  })
  return XoakArray || []
}

// function get_merged(o1, o2) {
//   let obj1 = JSON.parse(JSON.stringify(o1))
//   let obj2 = JSON.parse(JSON.stringify(o2))
//   Object.keys(obj2).forEach(subElement => {
//     if (!Object.keys(obj1).includes(subElement)) {
//       obj1[subElement] = JSON.parse(JSON.stringify(obj2[subElement]))
//       return
//     }
//     if (typeof obj2[subElement] === "object" && Object.prototype.toString.call(obj1[subElement]) === Object.prototype.toString.call(obj2[subElement])) {
//       obj1[subElement] = get_merged(obj1[subElement], obj2[subElement])
//     }
//   })
//   return obj1
// }
// const theMatrixINeed = new TransformMatrix(settingsObject)
// console.log(theMatrixINeed.matrix)

class Dices {
  constructor(settings) {
    this.array = this.array || this.get_rolls(settings)
  }
  get_rolls(settings) {
    const rollsArray = {}
    for (let rollNr = 0; rollNr < settings.rollsPerRun; rollNr++) {
      rollsArray[rollNr] = {
        value: Math.floor(Math.random() * settings.inputconst1) + settings.inputconst3123,
        fixed: false
      }
    }
    return rollsArray
  }
}

class Turn {
  constructor(settings) {
    this.array = this.run(settings)
    this.roll = function () {

    }
  }
  run(settings) {
    let runData = {}
    for (let loopIndex = settings.var1; loopIndex <= settings.varMax; loopIndex++) {
      let newDices = new Dices(settings)
      runData = newDices.array
    }
    return runData
  }
}
class Samples {
  constructor(settings) {
    this.data = this.data || this.get_data(settings)

  }
  get_data(settings) {
    console.log('lllll')
    const initialValues = 123
    const data = {}
    for (let loopIndex = 0; loopIndex <= settings.length; loopIndex++) {
      let currentTurn = new Turn(settings)
      data[loopIndex] = currentTurn.array
    }
    return data
  }
}

class TransformMatrix {
  constructor(settings) {
    this.settings = _.defaultsDeep(settings, this.settingsDefault);
    this.samples = this.samples || this.get_Samples();
    this.absMatrix = this.absMatrix || this.get_absMatrix();
    this.get_rabsMatrix = function () {
      const blabla = functionINeverDeclared(settings.matrixStuff);
      return blabla * 123;
    };
    this.matrix = this.matrix || this.get_matrix();
    this.get_matrix = function () {
      return theFunctionToGetHere(settings);
    };
    this.get_Samples = function (config) {
      return new Samples(config);
    };
  }
  settingsDefault = {
    elementSettings: {
      minValue: 1,
      maxValue: 6,
      alts: this.maxValue - this.minValue + 1
    },
    arraySettings: {
      arrAmount: 3,
      elementsPerArray: 5,
      presetArray: []
    },
    sampleSettings: {
      sampleAmount: 100
    }
  }
}

const newSample = new Samples({
  length: 4,
  var1: 0,
  varMax: 5,
  rollsPerRun: 5,
  inputconst1: 6,
  inputconst3123: 1
})
console.log('do it: ', newSample.data)
