const _ = require('lodash')

class DicePicker {
  constructor(input_obj) {
    this.inputArray = input_obj.array
    this.data = this.get_groupedArr(this.inputArray)
    this.best = this.get_best(this.data)
    this.picked = Array(this.best.amount).fill(this.best.number)
  }
  get_groupedArr(arr) {
    if (!arr || !arr.length) {
      return {}
    }
    const arrCopy = arr
    let temp2dArray = {};
    arrCopy.map(el => {
      temp2dArray[el] = temp2dArray[el] ? temp2dArray[el] + 1 : 1
    })
    console.log('dasfuq', temp2dArray)

    return temp2dArray || {}
  }
  get_best(data) {
    const highestVal = Object.values(data).sort().pop()
    const highestValKey = _.findKey(data, el => el === highestVal)
    return {
      number: highestValKey,
      amount: highestVal
    }
  }
}


module.exports = DicePicker
