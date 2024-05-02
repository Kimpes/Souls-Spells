const SCREEN_WIDTH = 1100;
const SCREEN_HEIGHT = 700;
const SCREEN_PADDING = 100;

let spells = [
  {
    name: "Aural_Decoy.png",
    H: "201",
    S: "20",
    L: "35",
    requirement: "10",
    type: "Sorcery",
  },
  {
    name: "Cast_Light.png",
    H: "49",
    S: "6",
    L: "34",
    requirement: "14",
    type: "Pyromancy",
  },
  {
    name: "Chameleon.png",
    H: "51",
    S: "14",
    L: "19",
    requirement: "14",
    type: "Sorcery",
  },
  {
    name: "Crystal_Magic_Weapon.png",
    H: "210",
    S: "27",
    L: "29",
    requirement: "25",
    type: "Sorcery",
  },
  {
    name: "Crystal_Soul_Spear.png",
    H: "207",
    S: "20",
    L: "33",
    requirement: "44",
    type: "Sorcery",
  },
  {
    name: "Dark Bead.png",
    H: "120",
    S: "4",
    L: "25",
    requirement: "16",
    type: "Sorcery",
  },
];
let maxH;
let maxS;
let maxL;
let minH;
let minS;
let minL;
let auralDecoyImg;
let castLightImg;

function preload() {
  for (let spell of spells) {
    spell.image = loadImage(`assets/spell-images/${spell.name}`);
  }
}

function setup() {
  createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener("load", () => {
  maxH = findMaxValue(spells, "H");
  maxS = findMaxValue(spells, "S");
  maxL = findMaxValue(spells, "L");

  minH = findMinValue(spells, "H");
  minS = findMinValue(spells, "S");
  minL = findMinValue(spells, "L");
  console.log("loaded");
});

function draw() {
  background("#181a18");
  for (const spell of spells) {
    renderSpell(spell);
  }
}

function findMaxValue(spellList, type) {
  let max = 0;
  for (const spell of spellList) {
    if (parseInt(spell[type]) > max) max = parseInt(spell[type]);
  }
  return max;
}
function findMinValue(spellList, type) {
  let min = 360;
  for (const spell of spellList) {
    if (parseInt(spell[type]) < min) min = parseInt(spell[type]);
  }
  return min;
}

function renderSpell(spell) {
  push();
  image(
    spell.image,
    ((parseInt(spell.H) - minH) / (maxH - minH)) *
      (SCREEN_WIDTH - SCREEN_PADDING * 2) +
      SCREEN_PADDING,
    ((parseInt(spell.S) - minS) / (maxS - minS)) *
      (SCREEN_HEIGHT - SCREEN_PADDING * 2) +
      SCREEN_PADDING,
    40,
    45
  );
  pop();
}
