const SCREEN_WIDTH = 1100;
const SCREEN_HEIGHT = 700;
const SCREEN_PADDING = 100;

//can be set to the following values: H, S, L, requirement
const X_AXIS_TYPE = "H";
const Y_AXIS_TYPE = "requirement";

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
let maxRequirement;

let minH;
let minS;
let minL;
let minRequirement;

function preload() {
  jsonData = loadJSON("assets/spells.json", (jsonData) => {
    // Convert the object into an array
    dataArray = Object.values(jsonData);
    console.log(dataArray);
    spells = dataArray;
    for (let spell of spells) {
      spell.image = loadImage(`assets/spell-images/${spell.name}`);
    }
    maxH = findMaxValue(spells, "H");
    maxS = findMaxValue(spells, "S");
    maxL = findMaxValue(spells, "L");
    maxRequirement = findMaxValue(spells, "requirement");

    minH = findMinValue(spells, "H");
    minS = findMinValue(spells, "S");
    minL = findMinValue(spells, "L");
    minRequirement = findMinValue(spells, "requirement");
  });
}

function setup() {
  createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener("load", () => {
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
  let xValue;
  let yValue;

  switch (X_AXIS_TYPE) {
    case "H":
      xValue = (parseInt(spell.H) - minH) / (maxH - minH);
      break;
    case "S":
      xValue = (parseInt(spell.S) - minS) / (maxS - minS);
      break;
    case "L":
      xValue = (parseInt(spell.L) - minL) / (maxL - minL);
      break;
    case "requirement":
      xValue =
        (parseInt(spell.requirement) - minRequirement) /
        (maxRequirement - minRequirement);
      break;
    default:
      xValue = 500;
  }

  switch (Y_AXIS_TYPE) {
    case "H":
      yValue = (parseInt(spell.H) - minH) / (maxH - minH);
      break;
    case "S":
      yValue = (parseInt(spell.S) - minS) / (maxS - minS);
      break;
    case "L":
      yValue = (parseInt(spell.L) - minL) / (maxL - minL);
      break;
    case "requirement":
      yValue =
        (parseInt(spell.requirement) - minRequirement) /
        (maxRequirement - minRequirement);
      break;
    default:
      yValue = 500;
  }

  push();
  image(
    spell.image,
    xValue * (SCREEN_WIDTH - SCREEN_PADDING * 2) + SCREEN_PADDING,
    yValue * (SCREEN_HEIGHT - SCREEN_PADDING * 2) + SCREEN_PADDING,
    40,
    45
  );
  pop();
}
