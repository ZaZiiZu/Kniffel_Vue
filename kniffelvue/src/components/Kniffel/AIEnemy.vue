<template>
  <v-app>
    <v-card>
      <table>
        <tr v-for="cell in columnCopy" v-bind:key="cell.sheetRowDef">
          <td> {{sheetLayout[cell.sheetRowDef].name}}</td>
          <!-- ( prio: {{Math.round(1/((cell.data.potentialMax || cell.data.potential)-cell.value+1)*100)/100}}) -->
          <!-- {{Math.round(5 / cell.data.dicesMissing * cell.data.potential*100)/100}} {{Math.floor(cell.data.priority)}} || -->
          <td>{{Math.floor(cell.data.focusPrio*100)/100}}</td>
          <td>{{Math.floor(cell.data.pickPrio*100)/100}}</td>
          <td>{{cell.data.dicesMatch}}</td>
          <!-- <td>{{cell.data.dicesMatchNot}}</td> -->
        </tr>
      </table>
    </v-card>
  </v-app>
</template>

<script>
import axios from 'axios'

const math = require('mathjs')

export default {
  name: 'aiEnemy',
  data() {
    return {
      dicesCopy: null,
      rollCounter: null,
      lastRolls: []
    }
  },
  watch: {
    // /*
    // computers turn, triggers after new turn started (1->0)
    // doTurn() makes full turn via API, lockingDices is local solution but not updated!,
    // */
    'state.newTurn': function () {
      if (this.state.computersTurn) {
        this.rollCounter = this.state.allRolls[0].length - 1
        // eslint-disable-next-line
          this.state.reroute ? this.doTurn() : this.lockingDices();
      }
    }
  },
  computed: {
    currentPlayer() {
      return this.state.currentPlayer
    },

    /* sorts the column by value, returns first(=highest) element    */
    columnCopy() {
      // if (this.state.computersTurn) {
      let copy = []
      copy = this.newSheet[this.state.currentPlayer].slice() // slice to copy array
      copy = this.newSheet[this.state.currentPlayer].filter(
        cell =>
          !(cell.fixed || this.sheetLayout[cell.sheetRowDef].anklickbar === 0)
      ) // filters OUT fixed or anklickbar===0
      // simple bubble-sort that sorts by value within pairs of objects
      if (copy && copy.length > 1) {
        copy.sort((a, b) => {
          if (
            a.data.pickPrio >
              b.data.pickPrio
          ) {
            return -1
          }
          if (
            a.data.pickPrio <
              b.data.pickPrio
          ) {
            return 1
          }
          if (a.value > b.value) return -1
          if (a.value < b.value) return 1
          return 0
        })
      }
      return copy
      // }
      // return []
    },
    sheetColumnArr() {
      let sheetArray = []
      let transformArr = []
      let copy = JSON.parse(JSON.stringify(this.newSheet[this.state.currentPlayer]))
      copy = copy.filter((el, index) => this.sheetLayout[index].anklickbar)
      copy.forEach((el, index) => {

        sheetArray[index] = el.fixed ? el.value : null
        transformArr[index] = el.sheetRowDef
      })
      return {
        sheet: sheetArray,
        transformArr: transformArr
      }
    }
  },
  methods: {
    async doTurn(previousDices) {
      // console.log('currentRolls: ', rollsArray)
      this.$emit('newRolls', {
        rollArray: previousDices || [0],
        rollCounter: this.rollCounter,
        allRolls: this.dicesCopy,
        source: 0
      }) // emit current array (rollsArray) up to get new newSheet

      const reqObject = {
        ThrowsLeft: this.rollCounter || 0,
        DiceSet: previousDices || this.state.allRolls[0][0].slice() || [0], //take previous dices, or if none there use new batch with .slice() to copy/clone it
        SheetColumn: this.sheetColumnArr.sheet || [0]

      }
      try {
        const resObject = await axios.post(this.state.settings.compSettings[this.currentPlayer].adress +
            '/yahtzee/turn', reqObject)
        const rollsBoolArr = resObject.data.DiceLocks
        const catPickIndex = resObject.data.CategoryIndex
        if (this.rollCounter > 0) {
          const nextArray = JSON.parse(JSON.stringify(this.state.allRolls[0][this.state.allRolls[0].length - this.rollCounter]))
          reqObject.DiceSet = reqObject.DiceSet.map((el, index) => rollsBoolArr[index] ? el : nextArray.shift())
          this.rollCounter--
          this.doTurn(reqObject.DiceSet)
        } else {
          this.$emit('fixedCell', [
            this.state.currentPlayer,
            this.sheetColumnArr.transformArr[catPickIndex]
          ])

        }
      } catch (error) {
        console.log('errooooor', error)
      }
    },
    async lockingDicesServer(previousDices) {
      let rollsArray = previousDices || this.state.allRolls[0][0].slice().sort()
      // console.log('currentRolls: ', rollsArray)
      this.lastRolls = rollsArray
      this.$emit('newRolls', {
        rollArray: rollsArray,
        rollCounter: this.rollCounter,
        allRolls: this.dicesCopy,
        source: 0
      }) // emit current array (rollsArray) up to get new newSheet
      const list = JSON.parse(
        JSON.stringify(this.newSheet[this.currentPlayer])
      ) // deep-clone the needed column from newSheet
      try {
        const response = await axios.post('http://localhost:4000/pickDices', {
          rollsLeft: this.rollCounter,
          dices: rollsArray,
          sheetColumn: list
        })
        rollsArray = response.data.dices
        if (this.rollCounter > 0) {
          // console.log('checkpoint1', this.rollCounter, this.state.allRolls)
          const nextArray = this.state.allRolls[0][this.state.allRolls[0].length - this.rollCounter]
          const loopLength = nextArray.length - rollsArray.length // not to use in loop because it changes within loop
          // console.log('next array: ', nextArray, nextArray.length, rollsArray.length, loopLength)
          for (let i = 0; i < loopLength; i++) {
            // fill rollArray with elementes from nextArray
            rollsArray.unshift(nextArray[i])
          }

          this.rollCounter--
          this.lockingDicesServer(rollsArray)
        } else {
          this.dicesCopy = rollsArray
          this.do_Magic() // auto-picking my turn the shittiest rolls
        }
      } catch (error) {
        console.log('errooooor', error)
      }
    },
    /* simple locking of dices, and returning "best" result within all rolls */
    async lockingDicesServerBackup(previousDices) {
      let rollsArray = previousDices || this.state.allRolls[0][0].slice().sort()
      // console.log('currentRolls: ', rollsArray)
      this.lastRolls = rollsArray
      this.$emit('newRolls', {
        rollArray: rollsArray,
        rollCounter: this.rollCounter,
        allRolls: this.dicesCopy,
        source: 0
      }) // emit current array (rollsArray) up to get new newSheet
      const list = JSON.parse(
        JSON.stringify(this.newSheet[this.currentPlayer])
      ) // deep-clone the needed column from newSheet
      try {
        const response = await axios.post('http://localhost:4000/pickDices', {
          rollsLeft: this.rollCounter,
          dices: rollsArray,
          sheetColumn: list
        })
        rollsArray = response.data.dices
        if (this.rollCounter > 0) {
          // console.log('checkpoint1', this.rollCounter, this.state.allRolls)
          const nextArray = this.state.allRolls[0][this.state.allRolls[0].length - this.rollCounter]
          const loopLength = nextArray.length - rollsArray.length // not to use in loop because it changes within loop
          // console.log('next array: ', nextArray, nextArray.length, rollsArray.length, loopLength)
          for (let i = 0; i < loopLength; i++) {
            // fill rollArray with elementes from nextArray
            rollsArray.unshift(nextArray[i])
          }

          this.rollCounter--
          this.lockingDicesServerBackup(rollsArray)
        } else {
          this.dicesCopy = rollsArray
          this.do_Magic() // auto-picking my turn the shittiest rolls
        }
      } catch (error) {
        console.log('errooooor', error)
      }
    },
    /* simple locking of dices, and returning "best" result within all rolls */
    lockingDices() {
      // "best" currently defined as " dice <= 0 gets replaced "
      const rollsAll = this.state.allRolls[0]
      const rollsArray = rollsAll[0].slice().sort() // initial array
      const loopLengthA = this.rollCounter
      for (let j = 0; j <= loopLengthA; j++) {
        const nextArray = rollsAll[j + 1] ? JSON.parse(JSON.stringify(rollsAll[j + 1].slice())) : [] // next array
        this.lastRolls = rollsArray
        this.$emit('newRolls', {
          rollArray: rollsArray,
          rollCounter: this.rollCounter,
          allRolls: this.dicesCopy,
          source: 0
        }) // emit current array (rollsArray) up to get new newSheet
        this.rollCounter--
        let list = JSON.parse(
          JSON.stringify(this.newSheet[this.currentPlayer])
        ) // deep-clone the needed column from newSheet
        list = list.filter(
          cell =>
            !(cell.fixed || this.sheetLayout[cell.sheetRowDef].anklickbar === 0)
        ) // filter out fixed cells
        list = !(list.length > 1) ? list : list.filter(
          cell =>
            !(
              cell.data.potential === 0 || cell.data.dicesMatch.length === 0
            )
        ) // if there is more then one non-fixed cell, filter out the useless ones
        list = this.sort_list(list)
        // console.log('die liste komplett: ', list)
        // list.sort((a, b) => {
        //   if (
        //     5 / a.data.dicesMissing * a.data.potential >
        //     5 / b.data.dicesMissing * a.data.potential
        //   ) {
        //     return -1;
        //   }
        //   if (
        //     5 / a.data.dicesMissing * a.data.potential <
        //     5 / b.data.dicesMissing * a.data.potential
        //   ) {
        //     return 1;
        //   }
        //   if (a.data.potential > b.data.potential) return -1;
        //   if (a.data.potential < b.data.potential) return 1;
        //   return 0;
        // }); // Prioritize: least missing dices first, then by potential=result
        const aimedCell = list.shift()
        const arrCut = !aimedCell ? [] : aimedCell.data.dicesMatchNot || []
        if (!rollsAll[j + 1]) break
        for (let i = 0; i < rollsArray.length; i++) {
          // cut out the "matchNot" out of rollArray
          if (!arrCut || !arrCut[0]) break
          for (let k = 0; k < arrCut.length; k++) {
            if (rollsArray[i] === arrCut[k]) {
              rollsArray.splice(i, 1)
              i--
              arrCut.splice(k, 1)
              k--
            }
          }
        }
        const loopLength = [nextArray.length - rollsArray.length] // not to use in loop because it changes within loop
        for (let i = 0; i < loopLength; i++) {
          // fill rollArray with elementes from nextArray
          rollsArray.unshift(nextArray[i])
        }
      }
      this.dicesCopy = rollsArray
      this.do_Magic() // auto-picking my turn the shittiest rolls
    },
    /* emits coordinations to fix a cell, based on currentPlayer and row of highest-valued cell */
    do_Magic() {
      // console.log("doing Magic for player: ", this.currentPlayer);
      const deepCopyColumn = JSON.parse(JSON.stringify(this.columnCopy))
      const highestValuedCell = deepCopyColumn.shift()
      if (!highestValuedCell) return
      /*
                                                                                                    console.log(
                                                                                                      "locked: ",
                                                                                                      this.sheetLayout[highestValuedCell.sheetRowDef].name,
                                                                                                      highestValuedCell.value,
                                                                                                      highestValuedCell
                                                                                                    );
                                                                                                    console.log("________________"); */
      // deepCopyColumn is a sorted-by-value array, with shift it returns first element(highest value) and sheetRowDef gets its' row
      // basically: row of the highest-valued cell
      this.$emit('fixedCell', [
        this.state.currentPlayer,
        highestValuedCell.sheetRowDef
      ])
    },
    sort_list(list) {
      let copy = JSON.parse(JSON.stringify(list))
      copy = this.add_odds(copy)
      copy.sort((a, b) => {
        if (
          a.data.focusPrio >
            b.data.focusPrio
        ) {
          return -1
        }
        if (
          a.data.focusPrio <
            b.data.focusPrio
        ) {
          return 1
        }
        if (a.data.potential > b.data.potential) return -1
        if (a.data.potential < b.data.potential) return 1
        return 0
      }) // Prioritize: least missing dices first, then by potential=result
      // console.log(copy.map(x => [x.data.potential, x.data.odds]  ))
      return copy
    },
    add_odds(list) {
      const copy = JSON.parse(JSON.stringify(list))
      // eslint-disable-next-line no-param-reassign, no-return-assign
      copy.map(x => x.data.odds = this.get_odds(x))
      // console.log('that damn copy: ', copy)
      return copy
    },
    get_odds(element) {
      const cellData = JSON.parse(JSON.stringify(element))
      const matchingDices = this.state.rollsArray.length - cellData.data.dicesMissing
      const answerToEverything = [
        [120 / 1296, 900 / 1296, 250 / 1296, 25 / 1296, 1 / 1296],
        [0, 120 / 216, 80 / 216, 15 / 216, 1 / 216],
        [0, 0, 25 / 36, 10 / 36, 1 / 36],
        [0, 0, 0, 5 / 6, 1 / 6],
        [0, 0, 0, 0, 1]
      ]
      const bla = math.pow(answerToEverything, this.state.rollCounter + 1)
      // console.log('the cell: ', this.sheetLayout[cellData.sheetRowDef].name)
      // console.log('rolls used: ', this.state.rollCounter + 1)
      const blub = bla[Math.max(matchingDices - 1, 0)][Math.max(matchingDices - 1, 0)]
      // console.log(bla[Math.max(matchingDices - 1, 0)])
      // console.log(this.state.rollsArray, blub)
      return blub
    }
  },

  props: ['newSheet', 'sheetLayout', 'state']
}
</script>

<style>
  ul {
    list-style-type: none;
  }
</style>
