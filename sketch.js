let grid = [];
let cols, rows; let size = 10;

let handPose;
let video;
let hands = [];
let options = {flipped: true};

let trapColumn = -1; // 用於記錄陷阱欄位
let trapTimer = 0; // 計時器
let trapBlinkCount = 0; // 閃爍次數
let trapActive = false; // 是否正在閃爍

function preload() {
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  cols = floor(width/size);
  rows = floor(height/size);
  for (let i=0; i<cols; i++) {
    grid[i] = [];
    for (let j=0; j<rows; j++) {
      grid[i][j] = 0;
    }
  }
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  // 更新手勢
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let indexFinger = hand.keypoints[8];
      addCoins(indexFinger.x, indexFinger.y);
    }
  }

  // 地板陷阱邏輯
  handleTrap();

  // 繪製 Falling Coins
  drawRect();
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
          let dir;
          if (random() < 0.5) {
            dir = 1;
          } else {
            dir = -1;
          }

          let belowDiag;
          if (i + dir >= 0 && i + dir <= cols - 1) {
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

function drawRect() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] > 0) {
        noStroke();
        if (trapActive && i === trapColumn) {
          fill(255, 0, 0, grid[i][j]); // 閃爍紅色
        } else {
          fill(255, 223, 0, grid[i][j]); // 正常顏色
        }
        ellipse(i * size + size / 2, j * size + size / 2, size, size);
        fill(0);
        rectMode(CENTER);
        rect(i * size + size / 2, j * size + size / 2, size / 3, size / 3);
      }
    }
  }
}

function handleTrap() {
  trapTimer++;
  if (trapTimer % 90 === 0 && !trapActive) {
    trapColumn = floor(random(cols)); // 隨機選擇一欄
    trapBlinkCount = 0;
    trapActive = true;
  }

  if (trapActive) {
    trapBlinkCount++;
    if (trapBlinkCount > 6) { // 閃爍 3 次後清除
      for (let j = 0; j < rows; j++) {
        grid[trapColumn][j] = 0; // 清除整欄
      }
      trapActive = false;
      trapTimer = 0;
    }
  }
}

function addCoins(fingerX, fingerY) {
  let x = floor(fingerX / size);
  let y = floor(fingerY / size);
  x = constrain(x, 0, cols-1);
  y = constrain(y, 0, rows-1);
  grid[x][y] = (frameCount % 205) + 50;
}

function gotHands(results) {
  hands = results;
}





