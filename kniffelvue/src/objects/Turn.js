const _ = require('lodash')
const DicePicker = require('./DicePicker.js')
const DiceGenerator = require('./DiceGenerator.js')
class Turn {
  constructor(settings_in) {
    this.settingsDefault = {
      length: 3,
      initArray: [],
      diceSettings: {
        length: 5,
        min: 1,
        max: 6,
        initArray: []
      },
      pickerSettings: {
        array: [],
        target: 'xoak'
      }
    }
    this.settings = _.cloneDeep(_.defaultsDeep(settings_in, this.settingsDefault))
    this.turnResults = this.run()
  }
  run() {
    let runData = {}
    for (let loopIndex = 0; loopIndex < this.settings.length; loopIndex++) {
      if (loopIndex === 0) {
        runData[loopIndex] = this.settings.diceSettings.initArray
      }
      const newDice = new DiceGenerator(this.settings.diceSettings) || []
      this.settings.pickerSettings.array = newDice.arrayDice
      const fixedDice = new DicePicker(this.settings.pickerSettings) || []
      this.settings.diceSettings.initArray = fixedDice.picked
      runData[loopIndex + 1] = fixedDice.picked
    }
    return runData
  }
}

module.exports = Turn
