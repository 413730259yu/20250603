let grid = [];
let cols, rows;
let size = 10;

let handPose;
let video;
let hands = [];
let options = {flipped: true};

function preload() {
  handPose = ml5.handPose(options); // 注意：這部分實際應該在 setup 裡初始化
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  handPose = ml5.handpose(video, modelReady); // 建議使用這個方式初始化
  handPose.on("predict", gotHands);

  cols = floor(width / size);
  rows = floor(height / size);
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }
}

function modelReady() {
  console.log("Handpose model ready!");
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let indexFinger = hand.keypoints[8];
    if (indexFinger) {
      addCoins(indexFinger.x, indexFinger.y);
    }
  }

  // 地板消失陷阱（每 60 幀一次）
  if (frameCount % 60 === 0) {
    disappearTrap();
  }

  drawRect();
  updateGrid();
}

function drawRect() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] > 0) {
        noStroke();
        fill(255, 223, 0, grid[i][j]);
        ellipse(i * size + size / 2, j * size + size / 2, size, size);
        fill(0);
        rectMode(CENTER);
        rect(i * size + size / 2, j * size + size / 2, size / 3, size / 3);
      }
    }
  }
}

function addCoins(fingerX, fingerY) {
  let x = floor(fingerX / size);
  let y = floor(fingerY / size);
  x = constrain(x, 0, cols - 1);
  y = constrain(y, 0, rows - 1);
  grid[x][y] = (frameCount % 205) + 50;
}

function gotHands(results) {
  hands = results;
}

function updateGrid() {
  let nextGrid = [];
  for (let i = 0; i < cols; i++) {
    nextGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      nextGrid[i][j] = 0;
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      if (state > 0) {
        if (j + 1 < rows) {
          let below = grid[i][j + 1];
          let dir = random() < 0.5 ? 1 : -1;
          let belowDiag = undefined;
          if (i + dir >= 0 && i + dir < cols) {
            belowDiag = grid[i + dir][j + 1];
          }

          if (below == 0) {
            nextGrid[i][j + 1] = state;
          } else if (belowDiag == 0) {
            nextGrid[i + dir][j + 1] = state;
          } else {
            nextGrid[i][j] = state;
          }
        } else {
          nextGrid[i][j] = state;
        }
      }
    }
  }

  grid = nextGrid;
}

function disappearTrap() {
  let trapX = floor(random(cols));
  for (let j = 0; j < rows; j++) {
    grid[trapX][j] = 0;
  }
}
