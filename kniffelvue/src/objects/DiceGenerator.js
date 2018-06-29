const _ = require('lodash')
class DiceGenerator {
  constructor(settings_in) {
    this.settingsDefault = {
      length: 5,
      min: 1,
      max: 6,
      initArray: []
    }
    this.create(settings_in)
  }
  create(settings_in) {
    this.settings = _.defaultsDeep(settings_in, this.settingsDefault)
    this.data = this.get_data()
    this.arrayDice = []
    this.arrayFixed = []
    _.values(this.data).map(obj => {
      this.arrayDice.push(obj.value)
      this.arrayFixed.push(obj.fixed)
    })
  }
  get_data() {
    const dataBlock = {}
    for (let rollNr = 0; rollNr < this.settings.length; rollNr++) {
      dataBlock[rollNr] = {
        value: this.settings.initArray[rollNr] ||
                    Math.floor(Math.random() * (this.settings.max - this.settings.min + 1)) + this.settings.min,
        fixed: false
      }
    }
    return dataBlock
  }
}

module.exports = DiceGenerator
