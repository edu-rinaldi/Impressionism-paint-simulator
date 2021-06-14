// Initial settings
let complementary_color = false, impressionism = true
let strokeSF = 1, brushStrokesNumberDensity = 0.5

// ------ FUNCTIONS ------

/*
  CONVOLUTION MATRIXES FOR CALC. IMAGE GRADIENT
  ref1: https://www.pyimagesearch.com/2021/05/12/image-gradients-with-opencv-sobel-and-scharr/
  ref2: https://en.wikipedia.org/wiki/Sobel_operator
  ref3: https://en.wikipedia.org/wiki/Image_gradient#cite_note-dip3-2
*/
let xm = [[3,0,-3],[10,0,-10],[3,0,-3]]
let ym = [[3,10,3],[0,0,0],[-3,-10,-3]]


// abs. version of "%" operator (Used for calculating rgb2hsv)
let mod = (n, m) => ((n % m) + m) % m

//  ------ END FUNCTIONS ------ 

/* 
  Handler that deals with "Art movement" in GUI
  value: true if "Impressionism" is chosen, false otherwise
*/
let artMovementHandler = (value) =>
{
  impressionism = value
  resetSketch()
}

/*
  Handler that deals with "Color" in GUI
  value: true if "Complementary colors" is chosen, false otherwise
*/
let colorTypeHandler = (value) => 
{
  complementary_color = value
  resetSketch()
}

/*
  Handler that deals with "Stroke scaler" in GUI
  value: can range between 1.00 and 2.00 and can be used for deciding the stroke size
*/
let strokeSizeSliderHandler = (value) => 
{
  document.querySelector("#strokeSizeValue").innerHTML = value
  resetSketch()
  
  // Do whatever with "value"
  // ...
}

/*
  Handler that deals with "Brushstroke density" in GUI
  value:  can range between 0.01 and 1.00 and it represents the probability of each pixel
          to be used as starting point for a brushstroke
*/
let brushStrokesDensitySliderHandler = (value) =>
{
  document.querySelector("#strokeDensityValue").innerHTML = value
  resetSketch()
  
  // Do whatever with "value"
  // ...
}

/*
  Handler that deals with "Input file" in GUI
  loadImage will run a callback function when an image is loaded.
  loadedImg: image loaded using the input file (it is a p5.Image object)
*/
let fileSelectHandler = (e) => 
{
  loadImage(URL.createObjectURL(e.target.files[0]), loadedImg => 
  {
    resetSketch()
    // Do whatever with "loadedImg"
    // ...
  })
}

/*
  It's a function that is called whenever an input in the GUI is changed.
  Use it as a setup stage.
*/
let resetSketch = () => 
{
  if(!img) return
  
  // Setup stage here
}


function setup() 
{
  
}

/*
  Draw stage:
    - Each time draw X pixels (X is an arbitrary value)
      - alterate the color
      - calculate brush size and direction (using gradients)
      - draw
*/
function draw() 
{
  if(!img) return;
  
  // draw code here
}
