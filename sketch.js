let grid = [];
let cols, rows;
let size = 10;

let handPose;
let video;
let hands = [];
let options = {flipped: true};

// 陷阱相關變數
let trapColumn = -1;
let trapCountdown = 0;
let trapFlashMax = 6;

function preload() {
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  handPose = ml5.handpose(video, modelReady);
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

  // 每 90 幀設定一次新的陷阱列
  if (frameCount % 90 === 0 && trapCountdown === 0) {
    trapColumn = floor(random(cols));
    trapCountdown = trapFlashMax;
  }

  // 處理陷阱 countdown
  if (trapCountdown > 0 && frameCount % 10 === 0) {
    trapCountdown--;
    if (trapCountdown === 0 && trapColumn !== -1) {
      for (let j = 0; j < rows; j++) {
        grid[trapColumn][j] = 0;
      }
      trapColumn = -1;
    }
  }

  drawRect();
  updateGrid();
}

function drawRect() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] > 0) {
        noStroke();

        // 如果是陷阱列且 countdown > 0，就用閃爍效果
        if (i === trapColumn && trapCountdown > 0 && frameCount % 20 < 10) {
          fill(255, 0, 0, 200); // 紅色閃爍
        } else {
          fill(255, 223, 0, grid[i][j]);
        }

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
