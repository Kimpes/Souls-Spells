const sWidth = 1100;
const sHeight = 700;

function setup() {
  createCanvas(sWidth, sHeight);
}

window.addEventListener("load", () => {
  console.log("loaded");
});

function draw() {
  background("#181a18");
  push();
  noFill();
  rect(50, 50, 100, 75);
  pop();
}
