<template>
  <v-app>
    <div class="Kniffel">
      <div style="padding: 20px; width: 100%">
        <TransfMatrices></TransfMatrices>
      </div>
      <v-btn @click="serverGet()"> buttooon </v-btn>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex d-flex xs12 sm6 md4>
            <v-layout>
              <v-flex d-flex>
                <v-card>
                  <div class='sheet'>
                    <sheet v-model="state.rollsArray" v-on:fixedCell='fixCell' v-bind:sheetDataJSON='JSON.stringify(sheetData)' v-bind:sheetLayout='sheet'
                      v-bind:state='state'></sheet>
                    <div class='sheet'>
                      <v-btn :ripple="false" @click="undo_turn()" :disabled="(state.newTurn==0)" :class="{highlighted: state.newTurn==1}">{{undoButton}}</v-btn>
                      <v-btn :ripple="false" @click="new_game()" :class="{highlighted: state.newGame==1 }">New Game! </v-btn>
                      <v-btn :ripple="false" @click="loop_games()" :class="{highlighted: state.newGame==1 }">loop {{loop.runs}}-time(s) </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex d-flex xs12 sm6 md4>
            <v-layout row wrap>
              <v-flex d-flex>
                <div class='diceRolls'>
                  <v-btn @click="rolls_trigger()" :ripple="false" :disabled="((state.rollCounter<=0||isNaN(state.rollCounter))&&!state.newTurn||state.newGame==1)"
                    :class="{highlighted: state.newTurn, active: !state.newTurn}">
                    <span v-if="state.newGame">newGame</span>
                    <span v-else-if="state.newTurn">New turn</span>
                    <span v-else>Roll({{state.rollCounter}})</span>
                  </v-btn>
                  <diceRolls v-model="state.rollsArray" v-on:newRolls="rollsOutput" v-bind:state='state' v-bind:rollsRequest='rollsAP'></diceRolls>
                  <div v-for="(block, index) in state.allRolls" :key="index">
                    allRolls: {{index}}
                    <ul v-for="(array, arrayIndex) in block" :key="arrayIndex"> {{array}} </ul>
                    <br>
                  </div>
                </div>
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex d-flex xs12 sm6 md4>
            <v-card color="white">
              <v-tabs color="grey" slider-color="black" v-model='layout.tabsCurrentItem'>
                <v-tab v-for="(i, indexHeader) in layout.tabs" :key="indexHeader" ripple>
                  {{i.headerText}}
                </v-tab>
                <v-tab-item>
                  <v-card flat class='log'>
                    <h3>Kniffel Log</h3>
                    <v-layout row wrap>
                      <ul v-for="(column, columnIndex) in playerLog" :key="columnIndex">
                        <h4 v-if="columnIndex>0"> Player {{columnIndex}} log </h4>
                        <li v-for="(entry, entryIndex) in playerLog[columnIndex]" :key="entryIndex">
                          {{entry}}
                        </li>
                      </ul>
                    </v-layout>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                    <div class='aiEnemy'>
                      <aiEnemy v-on:fixedCell='fixCell' v-on:newRolls="rollsOutput" v-bind:newSheet='sheetData' v-bind:sheetLayout='sheet' v-bind:state='state'></aiEnemy>
                    </div>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                    <div class='results'>
                      Last run: {{this.scoreStats.last}}
                      <br> Highest run:{{this.scoreStats.highest}}
                      <br> Lowerst run: {{this.scoreStats.lowest}}
                      <br> # of runs:{{this.scoreStats.amount}}
                      <br> average: {{this.scoreStats.average}}
                      <br> time needed: {{timeFormatted().norm + timeFormatted().normUnit}}
                    </div>
                    <table>
                      <tr v-for="(row, index) in sheet" :key="index">
                        <td> {{sheet[index].name}} </td>
                        <td> {{scoreStats.sheetAvg[index]}}</td>
                        <td> {{scoreStats.sheetZeroChance[index]}}%</td>
                      </tr>
                    </table>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                    <settings v-on:newSettings='newSettings'></settings>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </v-app>
</template>

<script>
import lineFunctions from '@/lineFunctions'
import sheetDef from '@/sheetDef'
import diceRolls from '@/components/Kniffel/DiceRolls'
import sheet from '@/components/Kniffel/Sheet'
import aiEnemy from '@/components/Kniffel/AIEnemy'
import settings from '@/components/Kniffel/Settings'
import TransfMatrices from '@/components/TransfMatrices'

const math = require('mathjs')

export default {
  name: 'Kniffel',
  data() {
    return {
      sheet: sheetDef,
      layout: {
        tabsCurrentItem: '3',
        tabs: {
          log: {
            headerText: 'Log',
            contentType: 'local',
            content: 'playerLog'
          },
          prio: {
            headerText: 'Priority',
            contentType: 'component',
            content: 'aiEnemy'
          },
          results: {
            headerText: 'Results',
            contentType: 'local',
            content: 'loop.scoreTracker'
          },
          settings: {
            headerText: 'settings',
            contentType: 'component',
            content: 'settings'

          }
        }
      },
      sheetData: {},
      loop: {
        lastScore: 0,
        scoreTracker: [],
        arrayStorage: [],
        runs: 0,
        currentRun: 0
      },
      rollsAP: {
        getDices: 0,
        override: {
          trigger: 0,
          data: [6, 6, 6, 6, 6]
        }
      },
      state: {
        reroute: true,
        currentPlayer: 1,
        computerOpponentSet: new Set([0, 2]),
        newTurn: 1, // fängt mit 1 an, sonst gibt's unlustige fehler
        oldTurn: {
          player: null,
          rolls: null,
          rollAmount: null
        },
        computersTurn: 0,
        newGame: 0,
        rollsArray: null,
        allRolls: [],

        settings: {
          playerAmount: null,
          activeAI: null,
          startingPlayer: null,
          diceAmount: null,
          maxRolls: null

        }
      },
      playerLog: null,
      rollsOverride: {
        rollsAmount: null,
        rolls: []
      },
      time: {
        start: 0,
        end: 0
      }
    }
  },

  watch: {
    'state.newTurn': function check_computersTurn() {
      const aiSet = new Set(this.state.settings.activeAI)
      if (this.state.newTurn === 1) this.sheetDataFunc() // re-fresh the sheet, mainly with zero-padding
      if (
        this.state.newTurn === 0 && aiSet.has(this.state.currentPlayer)
      ) {
        console.log('for real? ', aiSet, this.state.currentPlayer, aiSet.has(this.state.currentPlayer), JSON.stringify(
          aiSet))
        console.log('computers turn')
        this.state.computersTurn = true
      } else {
        console.log('NOOOOT computers turn')
        this.state.computersTurn = false
      }
      // if (this.state.newTurn === 1 && aiSet.has(this.state.currentPlayer)) {
      //   this.$nextTick(function () {
      //     this.rolls_trigger()
      //   })
      // }
      return 0
    },
    'state.newGame': function finish_log_with_sums() {
      if (this.state.newGame === 1) {
        for (let i = 1; i <= this.settingsCmptd.playerAmount; i += 1) {
          const score = this.sheetData[i][this.sheetData[i].length - 1].value
          this.writeLogAdd(i, 'Total score: ' + score)
        }
      }
    }
  },

  computed: {
    timeRaw() {
      const end = this.time.end || 1
      const start = this.time.start || 1
      const time = end - start
      console.log('timeRaw: ', time)
      return time
    },
    settingsCmptd() {
      const settings1 = {}
      settings1.playerAmount = this.state.settings.playerAmount || 2
      settings1.activeAI = new Set(this.state.settings.activeAI || [0])
      settings1.startingPlayer = this.state.settings.startingPlayer || 1

      return settings1
    },
    undoButton() {
      return this.state.newTurn === 1 ? 'Undo turn!' : 'Undo turn!'
    },
    scoreStats() {
      const lulz = {}
      lulz.last = this.loop.scoreTracker[this.loop.scoreTracker.length - 1]
      lulz.highest = this.loop.scoreTracker.length ? Math.max(...this.loop.scoreTracker) : 0
      lulz.lowest = this.loop.scoreTracker.length ? Math.min(...this.loop.scoreTracker) : 0
      lulz.amount = this.loop.scoreTracker.length
      lulz.average = this.loop.scoreTracker.length >= 2
          ? this.loop.scoreTracker.reduce((a, b) => a + b) / lulz.amount
          : this.loop.scoreTracker[0]
      lulz.average = Math.round((lulz.average || 0) * 100) / 100
      lulz.sheetAvg = this.loop.arrayStorage.length >= 2
          ? this.loop.arrayStorage.reduce((x, y) => math.add(x, y))
          : this.loop.arrayStorage[0]
      lulz.sheetAvg = lulz.amount ? math.divide(lulz.sheetAvg, lulz.amount) : [0]
      lulz.sheetAvg = lulz.sheetAvg.map(x => Math.round((x || 0) * 100) / 100)

      lulz.sheetZeroChance = this.loop.arrayStorage.length >= 2
          ? this.loop.arrayStorage.reduce((x, y) => math.add(x, y.map(z => (z !== 0 ? 0 : 1))), 0)
          : this.loop.arrayStorage[0]
      lulz.sheetZeroChance = lulz.amount ? math.divide(lulz.sheetZeroChance, lulz.amount) : [0]
      lulz.sheetZeroChance = lulz.sheetZeroChance.map(a => (Math.round(a * 10000) / 100))

      return lulz
    }
  },

  methods: {
    timeFormatted(initialTime, initialUnit) {
      // returns: {raw: initialTime,
      //   rawUnit: initialUnit,
      //   norm: lowest time > 1normUnit,
      //   normUnit: the unit for lowest time}
      const timeUnits = {
        ms: 1000,
        s: 60,
        min: 60,
        h: 24,
        d: 1,
        default: 99999999
      }
      const time = {
        raw: initialTime || this.timeRaw || 0,
        rawUnit: initialUnit && (initialUnit in timeUnits) ? initialUnit : 'ms',
        norm: 0,
        normUnit: 'ms'
      }

      function lulzasdf(dafuq) {
        let wheeeee = dafuq.number || 0
        let hohoho = dafuq.unit || 'ms'
        if (wheeeee / timeUnits[hohoho] < 1) {
          return {
            number: Math.ceil(wheeeee * 100) / 100,
            unit: hohoho
          }
        }
        wheeeee /= timeUnits[hohoho]
        hohoho = hohoho === 'ms' ? 's'
            : hohoho === 's' ? 'min'
            : hohoho === 'min' ? 'h'
            : hohoho === 'h' ? 'd'
            : hohoho === 'd' ? 'd' : 'default'
        return lulzasdf({
          number: wheeeee,
          unit: hohoho
        })
      }
      const arg = {
        number: time.raw,
        unit: time.rawUnit
      }
      const response = lulzasdf(arg)
      time.norm = response.number || 0
      time.normUnit = response.unit || 'ms'
      return time
    },
    serverGet() {
      // this.$axios.post('http://localhost:4000/rolls', {
      //   dices: [1, 2, 3, 4, 5],
      //   numbers: '1568'
      // })
      //   .then((response) => {
      //     console.log('response: ', response);
      //   })
      //   .catch((error) => {
      //     console.log('error: ', error);
      //   });
    },
    newSettings(settingsBundle) {
      // applying new settings
      const settingsS = this.state.settings
      settingsS.playerAmount = settingsBundle.playerAmount
      settingsS.activeAI = settingsBundle.activeAI
      settingsS.diceAmount = settingsBundle.diceAmountNew
      settingsS.maxRolls = settingsBundle.maxRollsNew
      this.loop.runs = settingsBundle.loopMax
      console.log('loops: ', settingsBundle.loopMax)
      this.new_game()
    },
    sheetDataFunc() {
      let x // x = {result: integer, dicesMatch: [], dicesMatchNot: [] }
      let j
      let rollsArray = []
      if (this.state.newTurn) {
        rollsArray = [0]
      } else {
        rollsArray = this.state.rollsArray
      }
      for (j = 0; j < this.sheet.length; j += 1) {
        x = lineFunctions[this.sheet[j].methode]({
          rollsAsArray: rollsArray,
          currentRow: j,
          sheetLayout: this.sheet,
          sheetDataColumnX: this.sheetData[this.state.currentPlayer],
          playerX: this.state.currentPlayer,
          rollsLeft: this.state.rollCounter,
          turnsLeft: this.sheetData ? this.sheetData[this.state.currentPlayer].filter(n => !n.fixed).length : this
            .sheetLayout.length
        })
        const cell = this.sheetData[this.state.currentPlayer][j]
        if (!cell.fixed) {
          cell.value = x.result
          cell.data = x
        }
      }
      return Object.assign({}, this.sheetData)
    },
    rollsOutput(rollsObject) {
      if (!rollsObject.rollArray) {
        alert('no new rolls found')
        return
      }
      this.state.rollsArray = rollsObject.rollArray
      this.state.rollCounter = rollsObject.rollCounter - 1 // comes delayed? thats why the -1
      if (
        this.state.allRolls !== rollsObject.allRolls &&
          rollsObject.source === 1 &&
          this.state.newTurn === 1
      ) {
        // saves&logs only rolls from button, not via emit from AI
        this.state.allRolls.unshift(rollsObject.allRolls)
        if (this.state.allRolls.length >= 4) {
          this.state.allRolls.pop()
        }
      }
      this.state.oldTurn.rollAmount = rollsObject.rollCounter
      this.state.newTurn = 0
      this.writeLogAdd(
        this.state.currentPlayer,
        'rolled: ' + this.state.rollsArray
      )
      // eslint-disable-next-line no-unused-vars
      const cheatz2 = this.sheetDataFunc() // makeshift glue... without this line, everything is fcked up!
    },
    writeLogAdd(currentPlayer, message) {
      const array = this.playerLog[currentPlayer]
      const pointer = array.length
      array[pointer] = array.unshift(message)
    },
    writeLogRemoveLast(player, asdf) {
      const column = player || this.state.currentPlayer
      const amount = asdf || 1
      const array = this.playerLog[column]
      for (let i = 0; i < amount; i += 1) {
        array.shift()
      }
    },
    fixCell(cellColAndRow) {
      if (!(
        this.sheet[this.sheetData[cellColAndRow[0]][cellColAndRow[1]].sheetRowDef].anklickbar === 0 ||
            this.sheetData[cellColAndRow[0]][cellColAndRow[1]].fixed ||
            cellColAndRow[0] !== this.state.currentPlayer ||
            this.state.newTurn
      )) {
        this.state.oldTurn.player = this.state.currentPlayer
        this.state.oldTurn.fixedCell = [
          this.sheetData[cellColAndRow[0]][cellColAndRow[1]]
        ]
        this.sheetData[cellColAndRow[0]][cellColAndRow[1]].fixed = true
        this.sheetData = Object.assign({}, this.sheetData)
        this.writeLogAdd(
          this.state.currentPlayer,
          ' +' + this.sheetData[cellColAndRow[0]][cellColAndRow[1]].value + ' ' + this.sheet[cellColAndRow[1]].name
        )
        // eslint-disable-next-line no-unused-vars
        const cheatz = this.sheetDataFunc() // forcing a re-fresh of sheetData before changing player
        this.state.currentPlayer =
            this.state.currentPlayer % this.settingsCmptd.playerAmount + 1
        this.state.newTurn = 1
        const availableCells = this.sheetData[this.state.currentPlayer].filter(
          cell => !(cell.fixed || this.sheet[cell.sheetRowDef].anklickbar === 0)
        )
        this.state.newGame = availableCells.length === 0 ? 1 : 0
        if (this.loop.currentRun < this.loop.runs) {
          this.time.start = this.loop.currentRun === 1 ? performance.now() : this.time.start
          // if (this.state.newGame !== 0) {
          this.$nextTick(function () {
            this.$forceUpdate()
            this.rolls_trigger()
            this.$forceUpdate()
          })
          // }
          if (this.state.newGame === 1) {
            let cleanColumn = JSON.parse(JSON.stringify(this.sheetData[1]))
            cleanColumn[0].value = 0
            cleanColumn = cleanColumn.map(x => x.value)
            this.loop.arrayStorage.push(JSON.parse(JSON.stringify(cleanColumn)))
            this.loop.scoreTracker.push(
              this.sheetData[1][this.sheetData[1].length - 1].value
            )
            this.loop.currentRun++
            this.$nextTick(function () {
              this.$forceUpdate()
              if (this.loop.currentRun < this.loop.runs) {
                this.new_game()
              } else {
                this.time.end = performance.now()
                console.log('End, time needed: ' + (this.time.end - this.time.start) + 'ms')
                console.log(
                  'end?',
                  this.loop.currentRun,
                  this.loop.runs,
                  this.loop.scoreTracker
                )
                if (this.layout && this.layout.tabsCurrentItem) this.layout.tabsCurrentItem = '2'
              }
              this.$forceUpdate()
            })
          }
        }
      }
    },
    generate_sheetData() {
      this.sheetData = {}
      for (let i = 1; i <= this.settingsCmptd.playerAmount; i += 1) {
        this.sheetData[i] = []
        for (let j = 0; j < this.sheet.length; j += 1) {
          this.sheetData[i].push({
            value: '',
            fixed: false,
            sheetRowDef: j // zum Nachschlagen von line-spezifischen properties
          })
        }
      }
    },
    generate_playerLog() {
      this.playerLog = []
      for (let i = 1; i <= this.settingsCmptd.playerAmount; i += 1) {
        this.playerLog[i] = []
      }
    },
    undo_turn() {
      this.state.currentPlayer = this.state.oldTurn.player
      this.state.oldTurn.fixedCell['0'].fixed = false
      this.rollsOverride = !this.rollsOverride
      this.writeLogRemoveLast(this.state.currentPlayer, 2)
    },
    new_game() {
      this.generate_sheetData()
      this.generate_playerLog()
      this.state.currentPlayer = this.playerNr || 1
      this.state.newTurn = 1
      this.state.newGame = 0
      this.sheetDataFunc()
      if (this.loop.currentRun < this.loop.runs) {
        console.log(
          'currentRun, maxRuns: ',
          this.loop.currentRun,
          this.loop.runs
        )
        this.rolls_trigger()
        this.$nextTick(() => {
          console.log(
            'afterTimeout, current, maxRuns: ',
            this.loop.currentRun,
            this.loop.runs
          )
          this.rolls_trigger()
        }, 0)

        // } else if (this.loop.currentRun >= this.loop.runs - 1) {
        //   console.log(
        //     "end?",
        //     this.loop.currentRun,
        //     this.loop.runs,
        //     this.loop.scoreTracker
        //   );
      }
    },
    rolls_trigger() {
      this.rollsAP.getDices = !this.rollsAP.getDices
    },
    loop_games() {
      this.loop.currentRun = 0
      this.loop.runs = 50
      this.new_game()
    }
  },
  created() {
    this.new_game()
  },
  // -----------------------------------------------------
  components: {
    diceRolls,
    sheet,
    aiEnemy,
    settings,
    TransfMatrices
  }
  // ------------------------------------------------------
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .Kniffel {
    max-width: 1000px;
    max-height: 500px;
  }

  p {
    color: green;
    text-align: center;
  }

  .diceRolls {
    text-align: center;
    left: 50px;
    max-width: 300px;
    width: 300px;
    padding: 20px;
  }

  .log {
    border-style: double;
    text-align: left;
    font-size: 80%;
    padding: 10px;
  }

  .highlighted {
    box-shadow: 0 0 25px rgb(100, 0, 0);
  }

  .active {
    box-shadow: 0 0 25px rgb(0, 100, 0);
  }
</style>
