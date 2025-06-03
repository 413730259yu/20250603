let grid = [];
let cols, rows; let size = 10;

let handPose;
let video;
let hands = [];
let options = {flipped: true};

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
  // ml5.js handPose Model
  image(video, 0, 0, width, height);
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let indexFinger = hand.keypoints[8];
      addCoins(indexFinger.x, indexFinger.y);
    }
  }
  
  // Falling Coins
  drawRect();
  let nextGrid = [];
  for (let i=0; i<cols; i++) {
    nextGrid[i] = [];
    for (let j=0; j<rows; j++) {
      nextGrid[i][j] = 0;
    }
  }
  
  for (let i=0; i<cols; i++) {
    for (let j=0; j<rows; j++) {
      let state = grid[i][j]; 
      if (state > 0) {
        if (j + 1 < rows) {
          let below = grid[i][j+1];
          let dir; 
          if (random() < 0.5) {
            dir = 1; 
          } else {
            dir = -1;
          }
          
          let belowDiag;
          if (i + dir >= 0 && i + dir <= cols-1) {
            belowDiag = grid[i+dir][j+1];
          }
          
          
          if (below == 0) {
            nextGrid[i][j+1] = state;
          } else if (belowDiag == 0) {
            nextGrid[i+dir][j+1] = state;
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
  for (let i=0; i<cols; i++) {
    for (let j=0; j<rows; j++) {

      if (grid[i][j] > 0) {
        // noStroke();
        // fill(0, grid[i][j]);
        // rect(i*size, j*size, size, size);
        
        noStroke();
        fill(255, 223, 0, grid[i][j]);
        ellipse(i*size + size/2, j*size + size/2, size, size);
        fill(0);
        rectMode(CENTER);
        rect(i*size + size/2, j*size + size/2, size/3, size/3);
      
      } 
      
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





