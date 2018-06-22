<template>
  <v-app class="sheet">
    <table id='table1'>
      <tr v-for="(sheetRow, indexRow) in sheetLayout" :key='sheetRow.id' class='dice-container v-flex'>
        <td v-bind:id='sheetRow.id' heetRow.line class="xyz" :class="{sums : sheetLayout[indexRow].anklickbar==0}"> {{sheetRow.name}} </td>
        <td v-for="playerNr in Object.keys(sheetData).length" :key='playerNr' @click='refresh_row(playerNr, indexRow)' :id="sheetRow.line.concat('_'+playerNr)"
          :class="{xyz : sheetData[playerNr][indexRow].fixed || sheetLayout[sheetData[playerNr][indexRow].sheetRowDef].anklickbar==0,
          sums : sheetLayout[sheetData[playerNr][indexRow].sheetRowDef].anklickbar==0,
          highlighted: playerNr == state.currentPlayer  && !(sheetData[playerNr][indexRow].fixed || sheetLayout[sheetData[playerNr][indexRow].sheetRowDef].anklickbar==0),
          bold: playerNr == state.currentPlayer  && sheetData[playerNr][indexRow].value > 0,
          invisible: playerNr != state.currentPlayer  && !(sheetData[playerNr][indexRow].fixed || sheetLayout[sheetData[playerNr][indexRow].sheetRowDef].anklickbar==0)}">
          {{sheetData[playerNr][indexRow].value}}
        </td>
      </tr>
    </table>
  </v-app>
</template>

<script>
export default {
  name: 'Sheet',
  data () {
    return {
    }
  },
  watch: {
  },
  computed: {
    sheetData: function () {
      return JSON.parse(this.sheetDataJSON)
    }
  },
  methods: {
    refresh_row (playerNr, indexRow) {
      this.$emit('fixedCell', [playerNr, indexRow]) // ins Parent-Element hochschieben
    }
  },

  props: ['sheetDataJSON', 'sheetLayout', 'state']
}
</script>

<style scoped>
  p {
    color: red;
  }

  .unicode {
    font-size: 36px;
  }

  #table1 {
    border-style: solid;
    border-width: 1px;
    box-shadow: rgb(50, 50, 50) 5px 5px 15px;
    margin: 5px 10px 5px 10px;
  }

  #table1 td {
    border-radius: 5px 5px 5px 5px;
    border-style: solid;
    border-top-width: 0px;
    border-right-width: 1px;
    border-bottom-width: 0px;
    border-left-width: 1px;
    padding: 2px 5px 2px 5px;
    min-width: 57px;
    text-shadow: 0 0 1px white;
  }

  .xyz {
    background: rgba(255, 255, 255, 1);
    font-weight: bold;
  }

  .sums {
    background: rgba(225, 225, 225, 1);
    font-weight: bold;
  }

  .highlighted {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 10px rgb(0, 100, 0) inset;
  }

  .bold {
    font-weight: bold;
  }

  .invisible {
    color: rgba(255, 255, 255, 0);
  }
</style>
