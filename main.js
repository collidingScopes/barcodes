/*
To do list:
Review entire code base and look for opportunities for visual tweaks
When there are waves, can there be more randomness -- different wave directions, etc.
Allow toggle for random color or not, if not -- allow user to choose the master color
Randomize all inputs button
*/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d", {
  willReadFrequently: true,
});
var canvasWidth;
var canvasHeight;

var maxCanvasWidth = 2000;
var maxCanvasHeight = 2000;

var animationSpeed;
var animationRequest;
var playAnimationToggle = false;

var numRows;
var cellHeight;
var masterColor;
var colorArray = [];
var hueArray = [];
var powerArray = [];

var numDotsPerFrame = canvasHeight;
var counter = 0;
var xShift = 0;
var maxXShift = 0;

//add gui
var obj = {
  hueRange: 15,
  numWaves: 2,
  waveAmplitude: 20,
  drawProbability: 70,
  roundingFactor: 100,
  backgroundColor: "#000000",
  canvasWidth: 800,
  canvasHeight: 800,
};
var numWaves = obj.numWaves;
var waveAmplitude = obj.waveAmplitude / 100;
var backgroundColor = obj.backgroundColor;
var drawProbability = obj.drawProbability/100;
var roundingFactor = obj.roundingFactor;

var gui = new dat.gui.GUI( { autoPlace: false } );
gui.close();
var guiOpenToggle = false;

// Choose from accepted values
gui.addColor(obj, "backgroundColor").name("Background Color").onFinishChange(newCanvas);
gui.add(obj, "hueRange").min(0).max(100).step(1).name('Hue Range').onChange(newCanvas);
gui.add(obj, "numWaves").min(0).max(100).step(0.1).name('# Waves').onChange(refresh);
gui.add(obj, "waveAmplitude").min(0).max(100).step(1).name('Wave Amplitude').onChange(refresh);
gui.add(obj, "drawProbability").min(1).max(100).step(1).name('Draw Probability').onChange(refresh);
gui.add(obj, "roundingFactor").min(1).max(100).step(1).name('Smoothness').onChange(refresh);

obj['refreshCanvas'] = function () {
  resetCanvas();
};
gui.add(obj, 'refreshCanvas').name("Refresh Canvas (r)");

obj['newCanvas'] = function () {
  newCanvas();
};
gui.add(obj, 'newCanvas').name("New Canvas (n)");

obj['saveImage'] = function () {
saveImage();
};
gui.add(obj, 'saveImage').name("Image Export (i)");

obj['saveVideo'] = function () {
  toggleVideoRecord();
};
gui.add(obj, 'saveVideo').name("Start/Stop Video Export (v)");

gui.add(obj, "canvasWidth").max(maxCanvasWidth).name("Canvas Width").onChange(refresh);
gui.add(obj, "canvasHeight").max(maxCanvasHeight).name("Canvas Height").onChange(refresh);

customContainer = document.getElementById( 'gui' );
customContainer.appendChild(gui.domElement);

function getUserInputs(){
  
  canvasWidth = obj.canvasWidth;
  canvasHeight = obj.canvasHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  console.log("width/height: "+canvasWidth+", "+canvasHeight);

  numWaves = obj.numWaves;
  waveAmplitude = obj.waveAmplitude / 100;
  backgroundColor = obj.backgroundColor;
  drawProbability = obj.drawProbability/100;
  roundingFactor = obj.roundingFactor;
  
  animationSpeed = 500 / obj.animationSpeed;
}

function refresh(){
  getUserInputs();
  startAnimation();
}

function newCanvas(){
  getUserInputs();
  initiateBackground();
}

function initiateBackground(){

  numRows = Math.max(1,Math.ceil(Math.random()*10));
  cellHeight = Math.ceil(canvasHeight / numRows);

  var saturation = randomWithinRange(0.5,0.3);
  var lightness = randomWithinRange(0.55,0.2);
  var saturationRange = 0.3;
  var masterHue = Math.random()*360;
  masterColor = "hsl("+masterHue+","+saturation*100+"%,"+lightness*100+"%)";
  
  var hueRange = Math.random()*obj.hueRange;
  var hueStep = Math.random()*obj.hueRange;

  colorArray = [];
  hueArray = [];
  powerArray = [];

  for(var row=0; row<numRows; row++){

    var numCols = Math.max(1,Math.ceil(Math.random()*10));
    var cellWidth = Math.ceil(canvasWidth / numCols);
    colorArray[row] = [];
    hueArray[row] = [];
    powerArray[row] = [];

    for(var col=0; col<numCols; col++){

      var hue1;
      var color1;
      
      var hue2;
      var color2;

      if(col==0){
        hue1 = randomWithinRange(masterHue,hueStep);
        color1 = "hsl("+hue1+","+(randomWithinRange(saturation,saturationRange))*100+"%,"+(randomWithinRange(lightness,saturationRange))*100+"%)";
      } else {
        hue1 = hueArray[row][col-1];
        color1 = colorArray[row][col-1];
      }

      hue2 = randomWithinRange(hue1,hueRange);
      color2 = "hsl("+hue2+","+(randomWithinRange(saturation,saturationRange))*100+"%,"+(randomWithinRange(lightness,saturationRange))*100+"%)";

      hueArray[row].push(hue2);
      colorArray[row].push(color2);
      powerArray[row].push(Math.random()*100+10);
      
    }

  }

  console.log(colorArray);

  startAnimation();

}

function animationLoop() {
  if(playAnimationToggle==true){
    counter++;
    maxXShift = canvasWidth*0 + (canvasWidth * waveAmplitude * Math.random());
    
    for(i=0; i<numDotsPerFrame; i++){
      var currentX = counter % canvasWidth;
      var currentY = i % canvasHeight;

      if(Math.random() < (1-drawProbability)){
        continue;
      }
      
      xShift = Math.round(Math.sin(i/canvasHeight * Math.PI * numWaves)*roundingFactor)/roundingFactor * maxXShift;

      var currentRow = Math.min(numRows-1, Math.max(0, Math.floor( (currentY/canvasHeight) * numRows)));
      var numCols = colorArray[currentRow].length;
      var currentCol = Math.min(numCols-1, Math.floor( (currentX / canvasWidth) * numCols));

      var cellHeight = Math.ceil(canvasHeight / numRows);
      var cellWidth = Math.ceil(canvasWidth / numCols);

      var currentColor = colorArray[currentRow][currentCol];
      var currentPower = powerArray[currentRow][currentCol];

      var actualX = currentCol*cellWidth + Math.pow(Math.random(),currentPower) * cellWidth;
      var actualY = currentY;

      ctx.fillStyle = currentColor;
      ctx.fillRect(actualX + xShift,actualY,1,1);
    }

    animationRequest = requestAnimationFrame(animationLoop);      
  } else {
    cancelAnimationFrame(animationRequest);
    console.log("animation paused");
  }
}

function startAnimation(){
  console.log("start generative animation");

  if(playAnimationToggle==true){
    playAnimationToggle = false;
    cancelAnimationFrame(animationRequest);
    console.log("cancel animation");
  }//cancel any existing animation loops 
  
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0,0,canvasWidth,canvasHeight);

  numDotsPerFrame = canvasHeight;
  counter = 0;
  xShift = 0;
  maxXShift = 0;
  
  playAnimationToggle = true;
  animationRequest = requestAnimationFrame(animationLoop);
}

//HELPER FUNCTIONS BELOW

function resetCanvas() {
  if(playAnimationToggle==true){
    playAnimationToggle = false;
    cancelAnimationFrame(animationRequest);
    console.log("cancel animation");
  } 
  startAnimation();
}

function toggleGUI(){
  if(guiOpenToggle == false){
      gui.open();
      guiOpenToggle = true;
  } else {
      gui.close();
      guiOpenToggle = false;
  }
}

//shortcut hotkey presses
document.addEventListener('keydown', function(event) {
  
  if (event.key === 'r') {
      resetCanvas();
  } else if (event.key === 'i') {
      saveImage();
  } else if (event.key === 'v') {
      toggleVideoRecord();
  } else if (event.key === 'o') {
      toggleGUI();
  } else if(event.key === 'p'){
      pausePlayAnimation();
  } else if(event.key === 'n'){
      newCanvas();
  } else if(event.key === ' '){
      togglePlayPause();
  } 
 
});

function togglePlayPause(){
  console.log("pause/play animation");
  if(playAnimationToggle==true){
    playAnimationToggle = false;
    cancelAnimationFrame(animationRequest);
    console.log("animation paused");
  } else {
    playAnimationToggle = true;
    animationRequest = requestAnimationFrame(animationLoop);
    console.log("animation resumed");
  }
}

//MAIN METHOD
getUserInputs();
initiateBackground();