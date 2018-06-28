
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

const sheetLayout = [
  {
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
    name: "Summe oben",
    classBlock: classes.blockA(),
    methode: "sum_sums",
    line: "tl7",
    sums: "block1",
    anklickbar: 0
  },
  {
    id: "8",
    name: "Bonus bei 63 oder mehr",
    classBlock: classes.blockA(),
    methode: "bonus_oben",
    line: "tl8",
    sums: "7",
    anklickbar: 0
  },
  {
    id: "9",
    name: "gesamt oberer Teil",
    classBlock: "",
    methode: "sum_sums",
    line: "tl9",
    sums: "blockA",
    anklickbar: 0
  },
  {
    id: "10",
    name: "Dreierpasch",
    classBlock: classes.block2(),
    methode: "pasch",
    line: "tl10",
    sums: "3",
    anklickbar: 1
  },
  {
    id: "11",
    name: "Viererpasch",
    classBlock: classes.block2(),
    methode: "pasch",
    line: "tl11",
    sums: "4",
    anklickbar: 1
  },
  {
    id: "12",
    name: "Full-House",
    classBlock: classes.block2(),
    methode: "fullHouse",
    line: "tl12",
    anklickbar: 1
  },
  {
    id: "13",
    name: "Kleine Straße",
    classBlock: classes.block2(),
    methode: "kleineStraße",
    line: "tl13",
    anklickbar: 1
  },
  {
    id: "14",
    name: "Große Straße",
    classBlock: classes.block2(),
    methode: "großeStraße",
    line: "tl14",
    anklickbar: 1
  },
  {
    id: "15",
    name: "Kniffel",
    classBlock: classes.block2(),
    methode: "Kniffel",
    line: "tl15",
    sums: "5",
    anklickbar: 1
  },
  {
    id: "16",
    name: "Chance1",
    classBlock: classes.block2(),
    methode: "Chance",
    line: "tl16",
    anklickbar: 1
  },
  {
    id: "17",
    name: "gesamt unterer Teil",
    classBlock: classes.blockB(),
    methode: "sum_sums",
    line: "tl17",
    sums: "block2",
    anklickbar: 0
  },
  {
    id: "18",
    name: "gesamt oberer Teil",
    classBlock: classes.blockB(),
    methode: "sum_sums",
    line: "tl99",
    sums: "blockA",
    anklickbar: 0
  },
  {
    id: "19",
    name: "Endsumme",
    classBlock: classes.blockC(),
    methode: "sum_sums",
    line: "tl19",
    sums: "blockB",
    anklickbar: 0
  }
]

module.exports.sheetLayout = sheetLayout
