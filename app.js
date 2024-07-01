const JSON_FILENAME = "spells";
const SCREEN_WIDTH = 1100;
const SCREEN_HEIGHT = 700;
const SCREEN_PADDING = 100;
const GRAPH_THICKNESS = 2;
const EASING_FACTOR = 0.1;

//the following attribute types are expected to be in the JSON file
//only name breaks the application if it's empty.
// - Hue
// - Saturation
// - Lightness
// - name
// - description
// - filepath (there's a generic image if filepath is empty or doesn't exist)

let xAxisType;
let yAxisType;

//an example of a proper item in the JSON file
let spells = [
  {
    name: "Aural Decoy",
    filepath: "Aural_Decoy.png",
    Hue: "201",
    Saturation: "20",
    Lightness: "35",
    requirement: "10",
    type: "Sorcery",
    uses: "10",
    description: "An aural effect that makes the target's voice deafened.",
  },
];

// arrays and array-like collections
let graphItems = [];
const attributes = new Map();
const categories = new Map();
const allNumberAttributes = new Set();
let xButtons = [];
let yButtons = [];

let graphMode = "Compare Items";
let showcasedItem;
let imagesLoaded = 0;
let mousePosition;
let font;
let showcasedItemOldPosition;

let colorYellow = [247, 171, 94];
let colorWhite = [255, 236, 217];

// ---------------------------------------------------------------- Setup Functions

function preload() {
  jsonData = loadJSON(`assets/${JSON_FILENAME}.json`, (jsonData) => {
    // Convert the object into an array
    dataArray = Object.values(jsonData);
    spells = dataArray;
    graphItems = loadItemImagesAndCreateObjects(spells);
    console.log(graphItems);
    createAttributesAndCategories(graphItems);
    findLimits(graphItems, attributes);
    calculatePositions(graphItems);
    addCategoryButtons(categories);
    addXYButtons(allNumberAttributes);
  });
  font = loadFont("./assets/CrimsonPro.ttf");
}

function loadItemImagesAndCreateObjects(itemList) {
  if (!itemList) {
    throw new Error("itemList is null or undefined");
  }
  const objectList = [];
  for (let item of itemList) {
    if (!item) {
      throw new Error("item is null or undefined");
    }
    if (!item.name) {
      throw new Error("item.name is null or undefined");
    }
    const newItem = new GraphItem(item);
    if (newItem.filepath) {
      newItem.image = loadImage(
        `assets/spell-images/${item.filepath}`,
        () => {
          imagesLoaded++;
          if (imagesLoaded === itemList.length) {
            generateItemImageShadows(graphItems);
          }
        },
        (error) => {
          console.error("error loading image:", error);
          newItem.image = loadImage("assets/spell-images/Generic.png", () => {
            console.log("loaded generic image");
            imagesLoaded++;
            if (imagesLoaded === itemList.length) {
              generateItemImageShadows(graphItems);
            }
          });
        }
      );
    } else {
      newItem.image = loadImage(`assets/spell-images/Generic.png`, () => {
        imagesLoaded++;
        if (imagesLoaded === itemList.length) {
          generateItemImageShadows(graphItems);
        }
      });
    }

    objectList.push(newItem);
  }
  return objectList;
}

function setup() {
  createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener("load", () => {
  console.log("window loaded");
  let sideButtons = document.getElementsByClassName("side-button");
  let bottomButtons = document.getElementsByClassName("bottom-button");
  for (let button of sideButtons) {
    button.addEventListener("click", () => {
      yAxisType = button.value;
      for (let button of yButtons) {
        button.classList.remove("active");
      }
      button.classList.add("active");
      calculatePositions(graphItems);
    });
  }
  for (let button of xButtons) {
    button.addEventListener("click", () => {
      xAxisType = button.value;
      for (let button of bottomButtons) {
        button.classList.remove("active");
      }
      button.classList.add("active");
      calculatePositions(graphItems);
    });
  }
});

function createAttributesAndCategories(itemList) {
  let allNumberAttributesCounter = 0;
  for (const [key, value] of Object.entries(itemList[0])) {
    if (key != "image" && key != "filepath") {
      const newAttribute = new ItemAttribute(key, value);
      newAttribute.findAllUniqueValues(itemList);
      if (newAttribute.allUniqueValues) {
        for (let value of newAttribute.allUniqueValues) {
          let category = new Category(value);
          categories.set(value, category);
        }
      }
      if (newAttribute.type == "number") {
        allNumberAttributes.add(newAttribute);
        if (allNumberAttributesCounter === 0) {
          xAxisType = newAttribute.name;
          yAxisType = newAttribute.name;
          allNumberAttributesCounter++;
        } else if (allNumberAttributesCounter === 1) {
          yAxisType = newAttribute.name;
          allNumberAttributesCounter++;
        }
      }
      attributes.set(key, newAttribute);
    }
  }
}

function addXYButtons(attributeList) {
  // creates the x and y buttons based on the number-type attributes it finds in the JSON file
  const xButtonContainer = document.getElementById("x-buttons-container");
  const yButtonContainer = document.getElementById("y-buttons-container");

  function createButton(text, className, activeValue) {
    // this function would only work if it was inside this other function.
    // it's strange, but it works
    const button = document.createElement("button");
    button.value = text;
    button.innerText = text.charAt(0).toUpperCase() + text.slice(1);
    button.classList.add(className);
    if (text === activeValue) {
      button.classList.add("active");
    }
    return button;
  }

  for (let attribute of attributeList) {
    const yAttributeButton = createButton(
      attribute.name,
      "side-button",
      yAxisType
    );
    yAttributeButton.addEventListener("click", () => {
      yAxisType = attribute.name;
      updateButtonState(yAttributeButton, yButtons);
      calculatePositions(graphItems);
    });

    const xAttributeButton = createButton(
      attribute.name,
      "bottom-button",
      xAxisType
    );
    xAttributeButton.addEventListener("click", () => {
      xAxisType = attribute.name;
      updateButtonState(xAttributeButton, xButtons);
      calculatePositions(graphItems);
    });

    yButtonContainer.appendChild(yAttributeButton);
    xButtonContainer.appendChild(xAttributeButton);
    yButtons.push(yAttributeButton);
    xButtons.push(xAttributeButton);
  }
}

function updateButtonState(activeButton, buttons) {
  for (let button of buttons) {
    button.classList.remove("active");
  }
  activeButton.classList.add("active");
}

function addCategoryButtons(categories) {
  // creates the category buttons based on the categories it finds in the JSON file
  let categoryButtonContainer = document.getElementById(
    "category-button-container"
  );
  for (const [key, category] of categories) {
    let categoryElement = document.createElement("button");
    categoryElement.value = category.name;
    categoryElement.innerText = category.name;
    categoryElement.classList.add("category-button", "active");
    categoryElement.addEventListener("mouseover", () => {
      category.highlight = true;
    });
    categoryElement.addEventListener("mouseout", () => {
      category.highlight = false;
    });
    categoryElement.addEventListener("click", () => {
      if (category.show === true) {
        category.show = false;
        categoryElement.classList.remove("active");
      } else {
        category.show = true;
        categoryElement.classList.add("active");
      }
      findLimits(graphItems, attributes);
      calculatePositions(graphItems);
    });
    categoryButtonContainer.append(categoryElement);
  }
}

// ---------------------------------------------------------------- Classes
class Category {
  constructor(name) {
    this.name = name;
    this.show = true;
    this.highlight = false;
  }
}

class GraphItem {
  constructor(jsonItem) {
    for (const [key, value] of Object.entries(jsonItem)) {
      if (!isNaN(value)) {
        this[key] = parseFloat(value);
      } else {
        this[key] = value;
      }
    }
  }
  draw(highlight, showcase, sizeMultiplier) {
    if (this.position != this.positionGoal) {
      this.move();
    }
    push();
    if (highlight) {
      image(this.shadow, this.position.x - 2, this.position.y - 2, 44, 49);
    }

    if (Math.abs(this.size - sizeMultiplier) > 0.01) {
      // Small threshold to avoid perpetual small adjustments
      this.size = lerp(this.size, sizeMultiplier, EASING_FACTOR * 2);
    } else {
      this.size = sizeMultiplier; // Snap to the target size when close enough
    }

    translate(this.position.x, this.position.y);
    push();
    translate(((this.size - 1) * -40) / 2, ((this.size - 1) * -45) / 2);
    scale(this.size);
    image(this.image, 0, 0, 40, 45);
    pop();

    if (!showcase) {
      cursor(ARROW);
    } else {
      cursor(HAND);

      push();
      let textBackground = font.textBounds(this.name, 20, 75, 18);
      rectMode(CENTER);
      strokeWeight(0);
      fill("#000");
      rect(
        textBackground.x,
        textBackground.y + 7,
        textBackground.w + 12,
        textBackground.h + 5
      );
      pop();

      textAlign(CENTER);
      textFont("Crimson Pro");
      textSize(18);
      fill(colorYellow);
      text(this.name, 20, 75);
    }
    pop();
  }
  calculatePosition(xAttribute, yAttribute) {
    let xValue = this.calculateXAxisPosition(xAttribute);
    let yValue = this.calculateYAxisPosition(yAttribute);

    if (!this.positionGoal) {
      this.position = createVector(
        xValue * (SCREEN_WIDTH - SCREEN_PADDING * 2) + SCREEN_PADDING,
        yValue * (SCREEN_HEIGHT - SCREEN_PADDING * 2) + SCREEN_PADDING
      );
    }

    this.positionGoal = createVector(
      xValue * (SCREEN_WIDTH - SCREEN_PADDING * 2) + SCREEN_PADDING,
      yValue * (SCREEN_HEIGHT - SCREEN_PADDING * 2) + SCREEN_PADDING
    );

    this.size = 1;
  }
  calculateXAxisPosition(attribute) {
    if (attribute.type == "number") {
      return (
        (parseInt(this[attribute.name]) - attribute.minValue) /
        (attribute.maxValue - attribute.minValue)
      );
    }
  }
  calculateYAxisPosition(attribute) {
    if (attribute.type == "number") {
      return (
        ((parseInt(this[attribute.name]) - attribute.minValue) /
          (attribute.maxValue - attribute.minValue)) *
          -1 +
        1
      );
    }
  }
  move() {
    // Calculate the difference between current position and goal position
    const dx = this.positionGoal.x - this.position.x;
    const dy = this.positionGoal.y - this.position.y;

    // Calculate the increment for each axis
    const stepX = dx * EASING_FACTOR;
    const stepY = dy * EASING_FACTOR;

    // Update the position
    this.position.x += stepX;
    this.position.y += stepY;

    // Check if we reached the goal position
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      this.position = this.positionGoal;
    }
  }
  renderHighlight() {}
  renderShadow() {}
  renderSingleItemInfo() {
    const hslCodeText = `${this.Hue}, ${this.Saturation}, ${this.Lightness}`;
    let informationTexts = [];
    for (let [key, attribute] of attributes) {
      if (attribute.type == "number" || attribute.type == "category") {
        informationTexts.push(`${attribute.name}: ${this[attribute.name]}`);
      }
    }

    push();
    translate(380, SCREEN_HEIGHT / 2 - 50);

    push();
    textFont("Inknut Antiqua");
    textStyle(BOLD);
    textSize(40);
    fill(colorYellow);
    text(this.name, -2, -95);
    pop();

    push();
    textFont("Crimson Pro");
    textSize(20);
    fill(colorYellow);
    textStyle(ITALIC);
    for (let i = 0; i < informationTexts.length; i++) {
      text(informationTexts[i], 0, -65 + i * 21);
      if (i == informationTexts.length - 1 && this.description != null) {
        textStyle(NORMAL);
        textLeading(22);
        fill(colorWhite);
        text(this.description, 0, -65 + (i + 1) * 21, 500, 500);
      }
    }

    if (this.Hue != null && this.Saturation != null && this.Lightness != null) {
      push();
      textSize(20);
      textFont("Crimson Pro");
      fill(colorYellow);
      text("Average HSL", -160, 145);
      text(hslCodeText, -160, 167);
      pop();

      push();
      colorMode(HSL);
      fill(this.Hue, this.Saturation, this.Lightness);
      strokeWeight(0);
      rect(-160, 15, 100, 110);
      pop();

      pop();
    }
  }
  checkIfVisible() {
    let itemValues = Object.values(this);
    for (const value of itemValues) {
      if (categories.get(value) && categories.get(value).show) return true;
    }
    return false;
  }
  checkIfHighlighted() {
    let itemValues = Object.values(this);
    for (const value of itemValues) {
      if (categories.get(value) && categories.get(value).highlight) return true;
    }
    return false;
  }
}

class ItemAttribute {
  constructor(key, value) {
    this.setType(key, value);
    this.name = key;
  }
  setType(key, value) {
    if (key.toLowerCase() === "name") {
      this.type = "name";
    } else if (!isNaN(value)) {
      this.type = "number";
    } else if (typeof value === "string") {
      this.type = value.length > 50 ? "description" : "category";
    } else {
      this.type = "unknown";
    }
  }
  findMinValue(list) {
    if (this.type == "number") {
      let min = 360;
      for (const item of list) {
        if (parseInt(item[this.name]) < min && item.checkIfVisible())
          min = parseInt(item[this.name]);
      }
      this.minValue = min;
    }
  }
  findMaxValue(list) {
    if (this.type == "number") {
      let max = 0;
      for (const item of list) {
        if (parseInt(item[this.name]) > max && item.checkIfVisible())
          max = parseInt(item[this.name]);
      }
      this.maxValue = max;
    }
  }
  findAllUniqueValues(list) {
    if (this.type == "category") {
      this.allUniqueValues = new Set();
      for (let item of list) {
        this.allUniqueValues.add(item[this.name]);
      }
    }
  }
}

// ---------------------------------------------------------------- Rendering functions

function renderGraph(showText) {
  push();
  strokeWeight(0);
  fill(colorYellow);
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

  if (showText) {
    push();
    fill(colorYellow);
    textFont("Crimson Pro");
    textSize(20);
    textAlign(RIGHT);
    textStyle(ITALIC);
    text(
      xAxisType.charAt(0).toUpperCase() + xAxisType.slice(1),
      SCREEN_WIDTH - 15,
      SCREEN_HEIGHT - 15
    );
    textAlign(LEFT);
    text(yAxisType.charAt(0).toUpperCase() + yAxisType.slice(1), 15, 15);
    pop();
  }
}

// ---------------------------------------------------------------- Draw Function

function draw() {
  background(40, 40, 45);
  mousePosition = createVector(mouseX, mouseY);
  if (graphMode == "Compare Items") {
    renderGraph(true);
    showcasedItem = findShowcasedItem(graphItems);
    for (const item of graphItems) {
      if (item.checkIfVisible()) {
        let isHighlighted = item.checkIfHighlighted();
        item.draw(isHighlighted, false, 1);
        if (showcasedItem) showcasedItem.draw(false, true, 1.5);
      }
    }
  } else if (graphMode == "Single Item") {
    renderGraph(false);
    showcasedItem.draw(false, false, 3);
    showcasedItem.renderSingleItemInfo();
  }
}

// ---------------------------------------------------------------- Misc Functions

function findLimits(itemList, attributeList) {
  for (const [key, attribute] of attributeList) {
    attribute.findMaxValue(itemList);
    attribute.findMinValue(itemList);
  }
}

function calculatePositions(itemList) {
  for (let item of itemList) {
    item.calculatePosition(
      attributes.get(xAxisType),
      attributes.get(yAxisType)
    );
  }
}

function generateItemImageShadows(itemList) {
  for (let item of itemList) {
    const newW = item.image.width;
    const newH = item.image.height;
    const g = createGraphics(newW, newH);

    g.imageMode(CENTER);
    g.translate(newW / 2, newH / 2);
    g.image(item.image, 0, 0);

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
    item.shadow = shadow;
  }
}
function findShowcasedItem(itemList) {
  let hoveredOverItems = [];
  for (let item of itemList) {
    if (
      item.position.x < mousePosition.x &&
      item.position.x + 40 > mousePosition.x &&
      item.position.y < mousePosition.y &&
      item.position.y + 45 > mousePosition.y &&
      item.checkIfVisible()
    ) {
      hoveredOverItems.push(item);
    }
  }
  if (hoveredOverItems.length == 0) {
    return null;
  } else if (hoveredOverItems.length == 1) {
    return hoveredOverItems[0];
  } else {
    let closestDistance = 100;
    let closestItem;
    for (let i = 0; i < hoveredOverItems.length; i++) {
      let itemCenter = hoveredOverItems[i].position.copy();
      itemCenter.add(20, 25);
      let distance = itemCenter.dist(mousePosition);
      if (distance < closestDistance) {
        closestItem = hoveredOverItems[i];
        closestDistance = distance;
      }
    }
    return closestItem;
  }
}
function mouseClicked() {
  if (showcasedItem && graphMode == "Compare Items") {
    graphMode = "Single Item";
    showcasedItem.positionGoal = createVector(250, SCREEN_HEIGHT / 2 - 140);
    showcasedItemOldPosition = createVector(
      showcasedItem.position.x,
      showcasedItem.position.y
    );
  } else if (graphMode == "Single Item") {
    showcasedItem.positionGoal = showcasedItemOldPosition;
    graphMode = "Compare Items";
  }
}
function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

// TODOs
// fix generic image loading
// use local storage to avoid redoing calculation work

// Ambitious TODOs
// remove need for hard baked HSL values; calculate on load
// allow for uploading of own JSON file
// make single item showcase into an HTML element instead of p5
