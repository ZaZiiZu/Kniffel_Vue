const _ = require('lodash')

const Turn = require('./Turn.js')

class SampleCreator {
  constructor(settings_in) {
    this.settingsDefault = {
      incrementInitArray: true,
      length: 100,
      turn: {
        length: 3,
        initArray: [],
        diceSettings: {
          length: 8,
          min: 1,
          max: 3,
          initArray: []
        },
        pickerSettings: {
          array: [],
          target: 'xoak'
        }
      }
    }
    this.settings = _.defaultsDeep(settings_in, this.settingsDefault)
    this.data = this.data || this.get_data(this.settings)

  }
  get_data(settings_in) {
    const settings = settings_in || this.settings
    const data = {}
    for (let loopIndex = 0; loopIndex <= settings.length; loopIndex++) {
      if (settings.incrementInitArray) {
        settings.turn.diceSettings.initArray = Array((loopIndex) % settings.turn.diceSettings.length + 1).fill(settings.turn.diceSettings.min)
      }
      let currentTurn = new Turn(settings.turn)
      data[loopIndex] = currentTurn.turnResults
    }
    return data
  }
}

module.exports = SampleCreator
