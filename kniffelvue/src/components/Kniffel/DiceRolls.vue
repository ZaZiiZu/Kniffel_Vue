<template>
  <v-app class="diceRolls">
    <v-container fluid class='diceContainer'>
      <v-layout row wrap>
        <v-flex xs4 v-for="(item, key) in dices" :key='key' class='dice-container v-flex'>
          <div v-on:click='fix_dice(key)' class='unicode' :class="{dicesFixed: item.fixed}">{{dice_unicodes[item.value]}}</div>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>
<script>
export default {
  name: 'DiceRolls',
  data () {
    return {
      size: '5px',
      rollCounter: 3,
      dices: {
      },
      allRolls: null,
      dice_unicodes: {
        0: '-',
        1: '\u2680',
        2: '\u2681',
        3: '\u2682',
        4: '\u2683',
        5: '\u2684',
        6: '\u2685'
      }
    }
  },

  props: ['state', 'rollsRequest'],

  watch: {
    // watched object in "" so it watches deep
    'state.newTurn': function resetRolls_deleteDices () {
      if (this.state.newTurn === 1) {
        this.rollCounter = this.settingsCmptd.maxRolls
        this.dices = {}
      }
      return this.state
    },
    'rollsRequest.getDices': function rollAndEmitDices () {
      const newRolls = this.generate_dices()
      // eslint-disable-next-line no-unused-vars
      const cheatz = this.dices
      this.$emit('newRolls', newRolls)
      return this.override
    }
  },
  computed: {
    settingsCmptd () {
      const settings = {}
      settings.diceAmount = this.state.settings.diceAmount || 5
      settings.maxRolls = this.state.settings.maxRolls || 3
      return settings
    }
  },
  methods: {
    // On first roll, generate dices for all rolls. then replace un-fixed dices with pushed out elements from next sub-array
    generate_dices (asdf) {
      if (this.state.newTurn === 1 || this.state.newGame) {
        this.allRolls = this.generate_rolls(this.settingsCmptd.diceAmount, this.settingsCmptd.maxRolls)
      }
      // the nr. of the sub-arrays, starting with zero
      const ArrayNr = [this.settingsCmptd.maxRolls - this.rollCounter]
      // prioritize direct input over saved arrays of rolls over individual random rolls
      const cheatedDices = asdf || this.allRolls[ArrayNr].slice() || [0]
      for (let i = 1; i <= this.settingsCmptd.diceAmount; i += 1) {
        if (
          !this.dices['d'.concat(i)] || // initiate, in case dices are empty (new game or turn)
            (this.dices['d'.concat(i)] &&
              this.dices['d'.concat(i)].fixed === false) // only the not-fixed elements get re-rolled
        ) {
          this.dices['d'.concat(i)] = {
            value: cheatedDices.shift() || Math.floor(Math.random() * 6) + 1,
            key: 'dice' + i,
            fixed: false
          }
        }
      }
      const dicesClean = []
      let id
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (id in this.dices) {
        dicesClean.push(this.dices[id].value)
      }
      //  adjust the counter
      const counterCopy = this.rollCounter
      switch (this.rollCounter) {
        case 'turn end':
          this.rollCounter = this.settingsCmptd.maxRolls - 1
          break
        case '1':
          this.rollCounter = 'turn end'
          break
        default:
          this.rollCounter -= 1
      }
      this.$forceUpdate() // otherwise dices will not be displayed

      //  emmit to parent
      return {
        rollArray: dicesClean,
        rollCounter: counterCopy,
        allRolls: this.allRolls,
        source: 1 // 0 für AI, 1 wäre Knopfdruck(manuell)
      }
    },

    // generates ALL rolls
    generate_rolls (dicesPerRoll_param, amountRolls_param) {
      let newAllRolls = 0
      newAllRolls = []
      const dicesPerRoll = dicesPerRoll_param || 5
      const amountRolls = amountRolls_param || 3
      for (let i = 0; i < amountRolls; i += 1) {
        newAllRolls[i] = []
        for (let j = 0; j < dicesPerRoll; j += 1) {
          newAllRolls[i].push(Math.floor(Math.random() * 6) + 1)
        }
      }
      return newAllRolls
    },

    // toggles the fix on dices via @click, refresh dices to trigger template reload
    fix_dice (itemid) {
      this.dices[itemid].fixed = !this.dices[itemid].fixed
      this.dices = Object.assign({}, this.dices)
    }
  },
  mounted () {
    // this.generate_dices();
  }
}
</script>

<style scoped>
  p {
    color: red;
  }

  .unicode {
    font-size: 36px;
  }

  .dicesFixed {
    background: rgba(155, 0, 0, 0.5);
  }

  .highlighted {
    box-shadow: 0 0 25px rgb(100, 0, 0);
  }

  .active {
    box-shadow: 0 0 25px rgb(0, 100, 0);
  }

  .diceContainer {
    min-height: 300px;
    min-width: 250px;
  }
</style>
