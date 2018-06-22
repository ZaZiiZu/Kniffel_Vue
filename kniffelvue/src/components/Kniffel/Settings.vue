<template>
  <v-app>
    <v-container>
      <v-text-field id="inputPlayerAmount" v-model.number="playerAmount" type="number" label="Players" placeholder="2" size='5'
        min='1' max="5"></v-text-field>
      <v-container fluid>
        <v-subheader>enable AI for players</v-subheader>
        <v-layout wrap row>
          <v-flex v-for="i in playerAmount" :key='i' xs12 sm6 md6>
            <v-switch :label="'Player '+i" v-model="activeAIObj[i]" hide-details></v-switch>
          </v-flex>
        </v-layout>
      </v-container>
      <v-text-field id="inputDiceAmount" v-model.number="diceAmountNew" type="number" label="Amount of dices" placeholder="5" size='5'
        min="1" max="20"> </v-text-field>
      <v-text-field id="inputMaxRolls" v-model.number="maxRollsNew" type="number" label="Amount of max. rolls:" placeholder="5"
        size='5' min="1" max="200"></v-text-field>
      <v-text-field id="inputLoopMax" v-model.number="loopMax" type="number" label="Amount of loops:" placeholder="0" size='5'
        min="0" max="500"></v-text-field>
      <v-btn round light block @click="apply_settings()">apply!*</v-btn>
      *: this starts a new game
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'Settings',
  data () {
    return {
      playerAmount: 1,
      activeAIObj: { 0: false, 1: true, 2: true },
      diceAmountNew: 5,
      maxRollsNew: 3,
      loopMax: 0
    }
  },

  props: [],

  watch: {},
  computed: {
    // filters active AI out of possible players and returns them as numbers in array
    activeAIArray () {
      let array = []
      array = Object.keys(this.activeAIObj)
        .filter(x => this.activeAIObj[x] && parseInt(x, 10) <= this.playerAmount)
        .map(x => parseInt(x, 10))
      return array
    }
  },
  methods: {
    apply_settings () {
      this.$emit('newSettings',
        {
          playerAmount: this.playerAmount,
          activeAI: this.activeAIArray,
          diceAmountNew: this.diceAmountNew,
          maxRollsNew: this.maxRollsNew,
          loopMax: this.loopMax
        })
    }
  },
  mounted () {
    this.apply_settings()
  }
}
</script>

<style scoped>
</style>
