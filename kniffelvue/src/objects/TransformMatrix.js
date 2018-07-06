const _ = require('lodash')
var util = require('util')

const SampleCreator = require('./SampleCreator.js')

class TransformMatrix {
  constructor(settings_in) {
    this.settingsDefault = {
      roundAccuracy: 100000,

      sample: {
        incrementInitArray: true,
        length: 100000,
        turn: {
          length: 3,
          initArray: [],
          diceSettings: {
            length: 16,
            min: 1,
            max: 5,
            initArray: []
          },
          pickerSettings: {
            array: [],
            target: 'xoak'
          }
        }
      }
    }
    this.settings = _.defaultsDeep(settings_in, this.settingsDefault)
    this.samples = this.samples || this.get_Samples(this.settings.sample).data;
    this.absMatrix = this.absMatrix || this.get_absMatrix(this.samples);
    this.trMatrix = this.relMatrix || this.trMatrix(this.absMatrix);
  }
  get_Samples(config) {
    return new SampleCreator(config);
  };
  get_absMatrix(samples_input) {
    const matrixSize = this.settings.sample.turn.diceSettings.length
    let absMatrix = this.get_emptyMatrix(matrixSize)

    const samples = samples_input || this.samples.data
    for (let loopI = 0; loopI < this.settings.sample.length; loopI++) {
      const currentSample = JSON.parse(JSON.stringify(samples[loopI]))
      let lastFixed = currentSample[0].length
      let currentFixed = 1
      for (let loopJ = 1; loopJ < this.settings.sample.turn.length; loopJ++) {
        lastFixed = lastFixed || 1
        currentFixed = currentSample[loopJ].length || 1
        absMatrix[lastFixed][currentFixed]++
        lastFixed = currentFixed
      }
    }
    return absMatrix;
  };
  trMatrix(absMatrix) {
    const transfMatrix = JSON.parse(JSON.stringify(absMatrix))
    for (let loopA = 0; loopA < absMatrix.length; loopA++) {
      const rowSum = this.arraySum(absMatrix[loopA]) || 1
      for (let loopB = 0; loopB < absMatrix[0].length; loopB++) {
        transfMatrix[loopA][loopB] = Math.round(absMatrix[loopA][loopB] / rowSum * this.settings.roundAccuracy) / this.settings.roundAccuracy
      }
    }
    return transfMatrix;
  };
  get_emptyMatrix(size_input) {
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
  arraySum(array) {
    if (!array.length) {
      return 0;
    }
    let sum = 0;
    for (let i = array.length; i--;) {
      sum += array[i];
    }
    return sum;
  }
}

const myTransitM = new TransformMatrix()
console.log(myTransitM.trMatrix)
require('child_process').spawn('clip').stdin.end(util.inspect((JSON.stringify(myTransitM.trMatrix))));

module.exports = TransformMatrix
