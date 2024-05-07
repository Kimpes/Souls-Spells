const SCREEN_WIDTH = 1100;
const SCREEN_HEIGHT = 700;
const SCREEN_PADDING = 100;
const GRAPH_THICKNESS = 5;

//can be set to the following values: H, S, L, requirement
let xAxisType = "H";
let yAxisType = "L";

let spells = [
  {
    name: "Aural_Decoy.png",
    H: "201",
    S: "20",
    L: "35",
    requirement: "10",
    type: "Sorcery",
  },
];
let graphType = "Compare Spells";

let maxH;
let maxS;
let maxL;
let maxRequirement;

let minH;
let minS;
let minL;
let minRequirement;

// ---------------------------------------------------------------- Setup Functions

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
  let sideButtons = document.getElementsByClassName("side-button");
  let bottomButtons = document.getElementsByClassName("bottom-button");
  for (let button of sideButtons) {
    button.addEventListener("click", () => {
      yAxisType = button.value;
      for (let button of sideButtons) {
        button.classList.remove("active");
      }
      button.classList.add("active");
    });
  }
  for (let button of bottomButtons) {
    button.addEventListener("click", () => {
      xAxisType = button.value;
      for (let button of bottomButtons) {
        button.classList.remove("active");
      }
      button.classList.add("active");
    });
  }
});

// ---------------------------------------------------------------- Rendering functions

function renderGraph() {
  push();
  strokeWeight(0);
  fill("#fff");
  rect(0, 0, GRAPH_THICKNESS, SCREEN_HEIGHT);
  rect(0, SCREEN_HEIGHT - GRAPH_THICKNESS, SCREEN_WIDTH, GRAPH_THICKNESS);

  for (
    let i = 0;
    i <= SCREEN_WIDTH - GRAPH_THICKNESS;
    i += (SCREEN_WIDTH - GRAPH_THICKNESS) / 10
  ) {
    rect(
      i,
      SCREEN_HEIGHT - 2 * GRAPH_THICKNESS,
      GRAPH_THICKNESS,
      GRAPH_THICKNESS
    );
  }
  for (
    let i = 0;
    i <= SCREEN_HEIGHT - GRAPH_THICKNESS;
    i += (SCREEN_HEIGHT - GRAPH_THICKNESS) / 10
  ) {
    rect(GRAPH_THICKNESS, i, GRAPH_THICKNESS, GRAPH_THICKNESS);
  }
  pop();

  push();
  fill("#fff");
  textSize(20);
  textAlign(RIGHT);
  switch (xAxisType) {
    case "H":
      text("Hue", SCREEN_WIDTH - 30, SCREEN_HEIGHT - 30);
      break;
    case "S":
      text("Saturation", SCREEN_WIDTH - 30, SCREEN_HEIGHT - 30);
      break;
    case "L":
      text("Lightness", SCREEN_WIDTH - 30, SCREEN_HEIGHT - 30);
      break;
    default:
      text(xAxisType, SCREEN_WIDTH - 30, SCREEN_HEIGHT - 30);
  }
  textAlign(LEFT);
  switch (yAxisType) {
    case "H":
      text("Hue", 30, 30);
      break;
    case "S":
      text("Saturation", 30, 30);
      break;
    case "L":
      text("Lightness", 30, 30);
      break;
    default:
      text(yAxisType, 30, 30);
  }
  pop();
}

function renderSpell(spell) {
  let xValue;
  let yValue;

  switch (xAxisType) {
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

  switch (yAxisType) {
    case "H":
      yValue = ((parseInt(spell.H) - minH) / (maxH - minH)) * -1 + 1;
      break;
    case "S":
      yValue = ((parseInt(spell.S) - minS) / (maxS - minS)) * -1 + 1;
      break;
    case "L":
      yValue = ((parseInt(spell.L) - minL) / (maxL - minL)) * -1 + 1;
      break;
    case "requirement":
      yValue =
        ((parseInt(spell.requirement) - minRequirement) /
          (maxRequirement - minRequirement)) *
          -1 +
        1;
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

// ---------------------------------------------------------------- Draw Function

function draw() {
  background("#33343A");
  if ((graphType = "Compare Spells")) {
    renderGraph();
    for (const spell of spells) {
      renderSpell(spell);
    }
  }
}

// ---------------------------------------------------------------- Misc Functions

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

let a = 0;
let b = 100;
