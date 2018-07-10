const classes = {
  blockAll: "",
  block1: function block1() {
    return this.blockAll + "block1";
  },
  block2: function block2() {
    return this.blockAll + "block2";
  },
  blockA: function blockA() {
    return this.blockAll + "blockA";
  },
  blockB: function blockB() {
    return this.blockAll + "blockB";
  },
  blockC: function blockC() {
    return this.blockAll + "blockC";
  }
};

const sheet = [{
  id: "0",
  name: "-",
  classBlock: classes.blockAll + " header",
  methode: "none",
  line: "tl0",
  weight: "0.5",
  anklickbar: 0
},
{
  id: "1",
  name: "Einer",
  classBlock: classes.block1(),
  methode: "matching",
  line: "tl1",
  sums: 1,
  anklickbar: 1
},
{
  id: "2",
  name: "Zweier",
  classBlock: classes.block1(),
  methode: "matching",
  line: "tl2",
  sums: 2,
  anklickbar: 1
},
{
  id: "3",
  name: "Dreier",
  classBlock: classes.block1(),
  methode: "matching",
  line: "tl3",
  sums: 3,
  anklickbar: 1
},
{
  id: "4",
  name: "Vierer",
  classBlock: classes.block1(),
  methode: "matching",
  line: "tl4",
  sums: 4,
  anklickbar: 1
},
{
  id: "5",
  name: "Fünfer",
  classBlock: classes.block1(),
  methode: "matching",
  line: "tl5",
  sums: 5,
  anklickbar: 1
},
{
  id: "6",
  name: "Sechser",
  classBlock: classes.block1(),
  methode: "matching",
  line: "tl6",
  sums: 6,
  anklickbar: 1
},
{
  id: "7",
  name: "Dreierpasch",
  classBlock: classes.block2(),
  methode: "pasch",
  line: "tl7",
  sums: "3",
  anklickbar: 1
},
{
  id: "8",
  name: "Viererpasch",
  classBlock: classes.block2(),
  methode: "pasch",
  line: "tl8",
  sums: "4",
  anklickbar: 1
},
{
  id: "9",
  name: "Full-House",
  classBlock: classes.block2(),
  methode: "fullHouse",
  line: "tl9",
  anklickbar: 1
},
{
  id: "10",
  name: "Kleine Straße",
  classBlock: classes.block2(),
  methode: "kleineStraße",
  line: "tl10",
  anklickbar: 1
},
{
  id: "11",
  name: "Große Straße",
  classBlock: classes.block2(),
  methode: "großeStraße",
  line: "tl11",
  anklickbar: 1
},
{
  id: "12",
  name: "Kniffel",
  classBlock: classes.block2(),
  methode: "Kniffel",
  line: "tl12",
  sums: "5",
  anklickbar: 1
},
{
  id: "13",
  name: "Chance1",
  classBlock: classes.block2(),
  methode: "Chance",
  line: "tl13",
  anklickbar: 1
}
]
module.exports = sheet
