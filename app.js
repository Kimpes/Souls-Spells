const SCREEN_WIDTH = 1100;
const SCREEN_HEIGHT = 700;
const SCREEN_PADDING = 100;
const GRAPH_THICKNESS = 2;
const EASING_FACTOR = 0.1;

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
let imagesLoaded = 0;

let maxH;
let maxS;
let maxL;
let maxRequirement;

let minH;
let minS;
let minL;
let minRequirement;

let showSpells = {
  sorcery: true,
  miracle: true,
  pyromancy: true,
};

let highlightSpells = {
  sorcery: false,
  miracle: false,
  pyromancy: false,
};

// ---------------------------------------------------------------- Setup Functions

function preload() {
  jsonData = loadJSON("assets/spells.json", (jsonData) => {
    // Convert the object into an array
    dataArray = Object.values(jsonData);
    console.log(dataArray);
    spells = dataArray;
    for (let spell of spells) {
      spell.image = loadImage(`assets/spell-images/${spell.name}`, () => {
        imagesLoaded++;
        if (imagesLoaded === spells.length) {
          generateSpellShadows(spells);
        }
      });
    }
    findLimits(spells);
    calculatePositions(spells);
  });
}

function setup() {
  createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener("load", () => {
  console.log("loaded");
  let sideButtons = document.getElementsByClassName("side-button");
  let bottomButtons = document.getElementsByClassName("bottom-button");
  let categoryButtons = document.getElementsByClassName("category-button");
  for (let button of sideButtons) {
    button.addEventListener("click", () => {
      yAxisType = button.value;
      for (let button of sideButtons) {
        button.classList.remove("active");
      }
      button.classList.add("active");
      calculatePositions(spells);
    });
  }
  for (let button of bottomButtons) {
    button.addEventListener("click", () => {
      xAxisType = button.value;
      for (let button of bottomButtons) {
        button.classList.remove("active");
      }
      button.classList.add("active");
      calculatePositions(spells);
    });
  }
  for (let button of categoryButtons) {
    button.addEventListener("mouseover", () => {
      highlightSpells[button.value] = true;
    });
    button.addEventListener("mouseout", () => {
      highlightSpells[button.value] = false;
    });
    button.addEventListener("click", () => {
      if (showSpells[button.value.toLowerCase()] === true) {
        showSpells[button.value.toLowerCase()] = false;
        button.classList.remove("active");
      } else {
        showSpells[button.value.toLowerCase()] = true;
        button.classList.add("active");
      }
      findLimits(spells);
      calculatePositions(spells);
    });
  }
});

// ---------------------------------------------------------------- Rendering functions

function renderGraph() {
  push();
  strokeWeight(0);
  fill(247, 171, 94);
  rect(0, 0, GRAPH_THICKNESS, SCREEN_HEIGHT);
  rect(0, SCREEN_HEIGHT - GRAPH_THICKNESS, SCREEN_WIDTH, GRAPH_THICKNESS);

  // for (
  //   let i = 0;
  //   i <= SCREEN_WIDTH - GRAPH_THICKNESS;
  //   i += (SCREEN_WIDTH - GRAPH_THICKNESS) / 10
  // ) {
  //   rect(
  //     i,
  //     SCREEN_HEIGHT - 2 * GRAPH_THICKNESS,
  //     GRAPH_THICKNESS,
  //     GRAPH_THICKNESS
  //   );
  // }
  // for (
  //   let i = 0;
  //   i <= SCREEN_HEIGHT - GRAPH_THICKNESS;
  //   i += (SCREEN_HEIGHT - GRAPH_THICKNESS) / 10
  // ) {
  //   rect(GRAPH_THICKNESS, i, GRAPH_THICKNESS, GRAPH_THICKNESS);
  // }
  pop();

  push();
  fill(247, 171, 94);
  textFont("Crimson Pro");
  textSize(20);
  textAlign(RIGHT);
  textStyle(ITALIC);
  let xText;
  let yText;
  switch (xAxisType) {
    case "H":
      xText = "Hue";
      break;
    case "S":
      xText = "Saturation";
      break;
    case "L":
      xText = "Lightness";
      break;
    case "requirement":
      xText = "Requirement";
      break;
    default:
      xText = xAxisType;
  }
  text(xText, SCREEN_WIDTH - 15, SCREEN_HEIGHT - 15);
  textAlign(LEFT);
  switch (yAxisType) {
    case "H":
      yText = "Hue";
      break;
    case "S":
      yText = "Saturation";
      break;
    case "L":
      yText = "Lightness";
      break;
    case "requirement":
      yText = "Requirement";
      break;
    default:
      yText = yAxisType;
  }
  text(yText, 15, 15);
  pop();
}

function renderSpell(spell, highlight) {
  if (spell.position != spell.positionGoal) {
    moveSpell(spell);
  }
  push();
  if (highlight) {
    image(spell.shadow, spell.position.x - 2, spell.position.y - 2, 44, 49);
  }
  image(spell.image, spell.position.x, spell.position.y, 40, 45);
  pop();
}

// ---------------------------------------------------------------- Draw Function

function draw() {
  background(40, 40, 45);
  if ((graphType = "Compare Spells")) {
    renderGraph();
    for (const spell of spells) {
      if (showSpells[spell.type.toLowerCase()]) {
        let highlight = highlightSpells[spell.type.toLocaleLowerCase()];
        renderSpell(spell, highlight);
      }
    }
  }
}

// ---------------------------------------------------------------- Misc Functions

function findLimits(spellList) {
  maxH = findMaxValue(spellList, "H");
  maxS = findMaxValue(spellList, "S");
  maxL = findMaxValue(spellList, "L");
  maxRequirement = findMaxValue(spellList, "requirement");

  minH = findMinValue(spellList, "H");
  minS = findMinValue(spellList, "S");
  minL = findMinValue(spellList, "L");
  minRequirement = findMinValue(spellList, "requirement");
}
function findMaxValue(spellList, type) {
  let max = 0;
  for (const spell of spellList) {
    if (
      parseInt(spell[type]) > max &&
      showSpells[spell.type.toLowerCase()] === true
    )
      max = parseInt(spell[type]);
  }
  return max;
}
function findMinValue(spellList, type) {
  let min = 360;
  for (const spell of spellList) {
    if (
      parseInt(spell[type]) < min &&
      showSpells[spell.type.toLowerCase()] === true
    )
      min = parseInt(spell[type]);
  }
  return min;
}
function calculatePositions(spellList) {
  for (let spell of spellList) {
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

    if (!spell.positionGoal) {
      spell.position = createVector(
        xValue * (SCREEN_WIDTH - SCREEN_PADDING * 2) + SCREEN_PADDING,
        yValue * (SCREEN_HEIGHT - SCREEN_PADDING * 2) + SCREEN_PADDING
      );
    }

    spell.positionGoal = createVector(
      xValue * (SCREEN_WIDTH - SCREEN_PADDING * 2) + SCREEN_PADDING,
      yValue * (SCREEN_HEIGHT - SCREEN_PADDING * 2) + SCREEN_PADDING
    );
  }
}
function moveSpell(spell) {
  // Calculate the difference between current position and goal position
  const dx = spell.positionGoal.x - spell.position.x;
  const dy = spell.positionGoal.y - spell.position.y;

  // Calculate the increment for each axis
  const stepX = dx * EASING_FACTOR;
  const stepY = dy * EASING_FACTOR;

  // Update the position
  spell.position.x += stepX;
  spell.position.y += stepY;

  // Check if we reached the goal position
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
    spell.position = spell.positionGoal;
  }
}
//cited from https://editor.p5js.org/davepagurek/sketches/IJwk16Mel
function generateSpellShadows(spellList) {
  for (let spell of spellList) {
    const newW = spell.image.width;
    const newH = spell.image.height;
    const g = createGraphics(newW, newH);

    g.imageMode(CENTER);
    g.translate(newW / 2, newH / 2);
    g.image(spell.image, 0, 0);

    const shadow = g.get();
    const c = color("ff0000");
    shadow.loadPixels();
    const numVals = 4 * shadow.width * shadow.height;
    for (let i = 0; i < numVals; i += 4) {
      shadow.pixels[i + 0] = c.levels[0];
      // shadow.pixels[i + 1] = c.levels[1];
      // shadow.pixels[i + 2] = c.levels[2];
    }
    shadow.updatePixels();

    g.remove();
    spell.shadow = shadow;
  }
}

//TODO
// Make second graph with simple bars
// Make slides
// Add more explainations
