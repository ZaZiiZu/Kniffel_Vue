<template>
  <v-app>
    <div>Sheeeeeeets:
      <br>
      <!-- <table>
      <tr v-for="(keyTable, indexTable) in normMatrix" :key="indexTable">
        <td v-for="(keyTable2, indexTable2) in keyTable" :key="indexTable2">
          {{Math.round(keyTable2.normOdds*10000)/10000}}
        </td>
      </tr>
    </table>
    <table>
      <tr v-for="(keyTable, indexTable) in corrMatrix" :key="indexTable">
        <td v-for="(keyTable2, indexTable2) in keyTable" :key="indexTable2">
          {{Math.round(keyTable2.corrOdds*10000)/10000}}
        </td>
      </tr>
    </table> -->
      <table>
        <tr v-for="(keyTable, indexTable) in transfMatrix" :key="indexTable">
          <td v-for="(keyTable2, indexTable2) in keyTable" :key="indexTable2">
            <br> {{Math.round(corrMatrix[indexTable][indexTable2].normOdds*10000)/10000}}
            <br> {{Math.round(corrMatrix[indexTable][indexTable2].corrOdds*10000)/10000}}
            <br> {{corrMatrix[indexTable][indexTable2].flag}}
            <br> {{Math.round((keyTable2.normOdds + corrMatrix[indexTable][indexTable2].corrOdds)*10000)/10000 }}
          </td>
        </tr>
      </table>
      <!-- <br> {{JSON.stringify(transfMatrix)}} -->
      <br> __________________________________
      <br>
      <!-- <li v-for="(key, index) in transfMatrix" :key="index">
      {{index}}:
      <ul v-for="(key2, index2) in key">{{index}} : {{transfMatrix[index][index2]}}</ul>
    </li> -->
      <br> __________________________________
      <br>
      <button @click="get_transM()">do it</button>
      <v-text-field id="inputAlts" v-model.number="settings.alternatives" type="number" label="Amount of alternatives:" placeholder="6"
        size='5' min="1" max="50"></v-text-field>
      <v-text-field id="inputRolls" v-model.number="settings.rolls" type="number" label="Amount of rolls:" placeholder="5" size='5'
        min="1" max="50"></v-text-field>
    </div>
  </v-app>
</template>

<script>
const math = require('mathjs')
const _ = require('lodash')

export default {
  name: 'TransfMatrices',
  data() {
    return {
      settings: {
        alternatives: 3,
        rolls: 15
      },
      transfMatrix: {},
      normMatrix: {},
      corrMatrix: {}

    }
  },
  watch: {},
  computed: {

  },
  methods: {
    get_transM(alts_override, size_override) {
      const alternatives = alts_override || this.settings.alternatives
      const size = size_override || this.settings.rolls
      this.normMatrix = this.get_normMatrix(alternatives, size)
      this.corrMatrix = this.get_corrMatrix(alternatives, size, this.normMatrix)
      this.transfMatrix = this.normMatrix
      console.log('transmatrix: ', this.transfMatrix)
      return this.transfMatrix
    },
    get_normMatrix(alternatives, size) {
      const sheet = {}
      const cellDef = {
        value: 0,
        normOdds: 0,
        corrOdds: 0,
        flags: {
          existsNot: false,
          tooBig: false,
          noChanceFlag: false,
          negateFlag: false,
          fixOdds: true
        }
      }
      const chanceOnly = 1 / alternatives
      const chanceExcept = (alternatives - 1) / alternatives
      // // console.log('chances: ', chanceOnly, chanceExcept)
      for (let fixed = size; fixed >= 1; fixed--) {
        sheet[fixed] = {}
        for (let need = size; need >= 1; need--) {
          // // console.log('------------------')
          // // console.log('id: ', fixed, need)
          let lowerRight = null
          let lowerLeft = null
          const cell = JSON.parse(JSON.stringify(cellDef))
          if (sheet && sheet[fixed + 1] && sheet[fixed + 1][need + 1]) {
            lowerRight = math.clone(sheet[fixed + 1][need + 1])
          } else lowerRight = math.clone(cellDef)
          if (sheet && sheet[fixed + 1] && sheet[fixed + 1][need]) {
            lowerLeft = math.clone(sheet[fixed + 1][need])
          } else lowerLeft = math.clone(cellDef)
          // // console.log('lower right',
          //   [fixed + 1] + " " + [need + 1] + " = " + JSON.stringify(lowerRight))
          // // console.log('lower left: ',
          //   [fixed + 1] + " " + [need] + " = " + JSON.stringify(lowerLeft))
          cell.normOdds = (fixed === size) && (need === size) ? 1
              : lowerLeft.normOdds * chanceOnly + lowerRight.normOdds *
              chanceExcept
          cell.id = [fixed, need]
          // cell.value = math.combinations(size - fixed, need) || 0
          sheet[fixed][need] = cell
        }
      }
      return sheet
    },
    get_corrMatrix(alternatives, size, normMatrix_input) {
      const normMatrix = JSON.parse(JSON.stringify(normMatrix_input))
      let sheet = {}
      const cellDef = {
        value: 0,
        normOdds: 0,
        corrOdds: 0,
        flags: {
          existsNot: true,
          tooBig: false,
          noChanceFlag: false,
          negateFlag: false,
          evenOutFlag: false,
          fixOdds: false,
          default: true
        },
        flag: null
      }
      for (let fixed = size; fixed >= 1; fixed--) {
        sheet[fixed] = {}
        for (let need = size; need >= 1; need--) {
          const cell = JSON.parse(JSON.stringify(cellDef))
          cell.id = [fixed, need]
          sheet[fixed][need] = cell
          cell.flags = this.get_flags(normMatrix, sheet, [fixed, need], cell)
          cell.flag = _.invertBy(cell.flags)[true][0]
          const asdfasdf = Object.keys(sheet[fixed][need].flags)
          const filtered = asdfasdf.filter(x => sheet[fixed][need].flags[x] == true)
          cell.normOdds = normMatrix[fixed][need].normOdds
          switch (filtered[0]) {
            case 'existsNot':
              cell.corrOdds = 0;
              break
            case 'tooBig':
              cell.corrOdds = 0;
              break
            case 'noChanceFlag':
              cell.corrOdds = (-1) * normMatrix[fixed][need].normOdds;
              break
            case 'negateFlag':
              cell.corrOdds = this.negate(Object.values(sheet[fixed]), need);
              break
            case 'evenOutFlag':
              cell.corrOdds = this.even_out(Object.values(normMatrix[fixed]),
                Object.values(sheet[fixed]), need);
              break
            case 'fixOdds':
              cell.corrOdds = this.corrections(alternatives, fixed, need, size);
              break
            case 'default':
              cell.corrOdds = 0;
              break
            default:
              cell.corrOdds = 0
          }
          sheet = Object.assign({}, sheet)
          this.corrMatrix = sheet
        }
      }
      sheet = Object.assign({}, sheet)
      this.transfMatrix = sheet
      return sheet
    },
    get_flags(normMatrix, sheet, idArray, cell) {
      const flags = JSON.parse(JSON.stringify(cell.flags))
      const fixed = idArray[0]
      const need = idArray[1]
      const size = Object.keys(normMatrix[fixed]).length
      const alternatives = this.settings.alternatives
      // // console.log('setting flags, fixed-need-size: ', fixed, need, size)
      if (normMatrix[fixed][need].normOdds <= 0) {
        flags.existsNot = true
        return flags
      }
      flags.existsNot = false

      if (fixed + need > size) {
        flags.tooBig = true
        return flags
      }
      flags.tooBig = false

      if (need * alternatives < size) {
        flags.noChanceFlag = true
        return flags
      }
      flags.noChanceFlag = false

      if (fixed == need) {
        flags.negateFlag = true
        return flags
      }
      flags.negateFlag = false

      if ((alternatives - 1) * (need - 1) + (need - fixed) < (size - fixed) + 1) {
        flags.evenOutFlag = true
        return flags
      }
      flags.evenOutFlag = false

      if (need + fixed <= (size) && (need > fixed)) {
        flags.fixOdds = true
        return flags
      }
      flags.fixOdds = false

      flags.default = true
      return flags
    },
    negate(row_array, trim_start) {
      let row = JSON.parse(JSON.stringify(row_array))
      row = row.filter(el => el.id[1] > trim_start)
      // console.log('row: ', row)
      const sum = this.sumArrayKey(row, 'corrOdds')
      // console.log('row_sum: ', sum)
      return (-1) * sum
    },
    even_out(row_norm_array, row_corr_array, trim_start) {
      let rowN = JSON.parse(JSON.stringify(row_norm_array))
      let rowC = JSON.parse(JSON.stringify(row_corr_array))
      // console.log('rows: ', rowN, rowC)
      rowN = rowN.filter(el => el.id[1] > trim_start - 1)
      rowC = rowC.filter(el => el.id[1] > trim_start)
      // console.log('rows: ', rowN, rowC)
      const sumN = this.sumArrayKey(rowN, 'normOdds')
      const sumC = this.sumArrayKey(rowC, 'corrOdds')
      // console.log('row_sums: ', sumN, sumC)
      const result = 1 - sumN - sumC
      return result
    },
    corrections(alt_i, fixed_i, need_i, size_i) {
      const alts = alt_i
      const fixed = fixed_i
      const need = need_i
      const size = size_i
      const combinations = math.combinations(size - fixed, need)
      const factorX = math.min(math.floor((size - fixed) / need), alts - 1)
      const correction = (alts - 1) / alts * (1 / alts) ** (need - 1) * ((alts - factorX) / alts) ** (size -
          fixed -
          need) * (combinations - factorX + 1)
      return correction
    },
    sumArrayKey(array_of_objects, key_string, negative_include) {
      const choice = key_string || 'value'
      let row = JSON.parse(JSON.stringify(array_of_objects))
      if (!negative_include) {
        row = row.filter(el => el[choice] > 0)
      }
      let sum = 0
      // console.log('row for key: ', row, key_string)
      for (const el in row) {
        // console.log('element', el)
        if (row[el][choice] > 0) {
          sum += parseFloat(row[el][choice])
        }
      }
      // console.log('row_sum: ', sum)
      return sum
    }
  }
}
</script>

<style scoped>
  td {
    padding: 10px 4px
  }
</style>
