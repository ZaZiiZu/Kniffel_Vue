<template>
  <v-app>
    <v-container>
      <v-container fluid>
        <v-subheader>Select players:</v-subheader>
        <v-text-field id="inputPlayerAmount" v-model.number="playerAmount" type="number" label="Players" placeholder="2" size='5'
          min='1' max="5"></v-text-field>
        <v-layout row wrap>
          <v-flex v-for="i in playerAmount" :key='i' xs12 sm12 md12>
            <v-switch :label="compSettings[i].isActive ? `Player ${i}: computer` : `Player ${i}: player`" v-model="compSettings[i].isActive"
              hide-details></v-switch>
            <v-text-field v-if="compSettings[i].isActive" v-model="compSettings[i].adress" label="Adress" placeholder="http://localhost:62100"></v-text-field>
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
  data() {
    return {
      playerAmount: 1,
      compSettings: {
        1: {
          isActive: true,
          adress: "http://localhost:62100"
        },
        2: {
          isActive: true,
          adress: "http://localhost:62100"
        }
      },
      defaultAdress: "http://localhost:62100",
      diceAmountNew: 5,
      maxRollsNew: 3,
      loopMax: 0
    }
  },

  props: [],

  watch: {
    playerAmount() { // expand the compSettings when playerAmount changes
      for (let i = 0; i <= this.playerAmount; i++) {
        if (!this.compSettings[i]) {
          this.$set(this.compSettings, i, { // this.$set to add Reactivity to new sub-objects of compSettings. Reactivity, babyyyyyy!
            adress: this.defaultAdress
          })
        }
      }
    }
  },
  computed: {},
  methods: {
    apply_settings() {
      this.$emit('newSettings', {
        playerAmount: this.playerAmount,
        compSettings: this.compSettings,
        diceAmountNew: this.diceAmountNew,
        maxRollsNew: this.maxRollsNew,
        loopMax: this.loopMax
      })
    }
  },
  mounted() {
    this.apply_settings()
  }
}
</script>

<style scoped>
</style>
