let img, gradients
// coordinates of current pixel to draw()
let xCurrent, yCurrent, index 

// pixels to draw queue
let pixelsToDraw

// Initial settings
let complementary_color = false, impressionism = true
let strokeSF = 1, brushStrokesNumberDensity = 0.5

// ------ FUNCTIONS ------

// given (x, y) coords returns true if coords are valid in an image width x height
let inside = (x, y, width, height) => (x >= 0 || x < width) && (y>=0 || y < height)

/* 
    src: image
    returns: an object containing the x|y-gradient of src
*/
let scharr = src =>
{
  // converting to gray scale
  let gray = createImage(src.width, src.height)
  gray.copy(src, 0, 0, src.width, src.height, 0, 0, src.width, src.height)
  gray.filter(GRAY)
  
  // Initialize the two gradients (on both directions)
  let xGradient = createImage(src.width, src.height)
  let yGradient = createImage(src.width, src.height)

  /*
  Initiliazing the two conv. matrix
  ref1: https://www.pyimagesearch.com/2021/05/12/image-gradients-with-opencv-sobel-and-scharr/
  ref2: https://en.wikipedia.org/wiki/Sobel_operator
  ref3: https://en.wikipedia.org/wiki/Image_gradient#cite_note-dip3-2
  */
  let xm = [[3,0,-3],[10,0,-10],[3,0,-3]]
  let ym = [[3,10,3],[0,0,0],[-3,-10,-3]]
  
  xGradient.loadPixels()
  yGradient.loadPixels()
  // Loop through pixels and calculating the two gradients using conv. matrixes
  for(let y=0; y<src.height; ++y)
  {
    for(let x=0; x<src.width; ++x)
    {
      xGradient.set(x, y, applyConvMatrix(gray, x, y, xm))
      yGradient.set(x, y, applyConvMatrix(gray, x, y, ym))
    }
  }
  xGradient.updatePixels()
  yGradient.updatePixels()
  
  // Applying some blur for a better visual effect
  let blurRadius = Math.max(img.width, img.height) / 50
  xGradient.filter(BLUR, blurRadius)
  yGradient.filter(BLUR, blurRadius)
  
  return { xDir : xGradient, yDir : yGradient };
}

/*
   src:         an image
   centerX:     x coordinate of the pixel on which we want to apply convMatrix
   centerY:     y coordinate of the pixel on which we want to apply convMatrix
   convMatrix:  convolution matrix to apply
   returns:     the result value obtained by applying the convMatrix on (x,y)'s pixel
*/
let applyConvMatrix = (src, centerX, centerY, convMatrix) =>
{
  let val = 0
  for(let offY=-1; offY<2; ++offY)
  {
    for(let offX=-1; offX<2; ++offX)
    {
      let y = centerY + offY
      let x = centerX + offX
      if(inside(x, y, src.width, src.height))
      {
        let c = src.get(x, y)
        val += c[0] * convMatrix[offY+1][offX+1]
      }
    }
  }
  return val
}

/*
   x:         x coordinate
   y:         y coordinate
   xGradient: horizontal gradient
   yGradient: vertical gradient
   returns:   the gradient direction for (x,y) pixel
*/
let gradientDirection = (x, y, xGradient, yGradient) => 
{
  let xc = xGradient.get(x, y)[0]
  let yc = yGradient.get(x, y)[0]
  
  return degrees(Math.atan2(yc,xc))+90.0
}

// given x|y.gradients it calculates the magnitude
let gradientMagnitude = (x, y, xGradient, yGradient) => Math.hypot(xGradient.get(x, y)[0], yGradient.get(x, y)[0])


/*
   r:       red channel   [0, 255]
   g:       green channel [0, 255]
   b:       blue channel  [0, 255]
   returns: a value that used on RGB channels represent the gray scale value of (r,g,b)  
*/
let rgb2gray = (r, g, b) =>  0.299 * r + 0.587 * g + 0.114 * b

// abs. version of "%" operator
let mod = (n, m) => ((n % m) + m) % m

/*
   r:       red channel   [0, 255]
   g:       green channel [0, 255]
   b:       blue channel  [0, 255]
   returns: a list of three elements [h,s,v] s.t. h,s,v in [0,1]
*/
let rgb2hsv = (r, g, b) =>
{
  // map to [0,1] range the three channels: r,g,b
  r /= 255, g /= 255, b /= 255
  // find max and min channels
  let max = Math.max(r,g,b)
  let min = Math.min(r,g,b)
  
  // (v)alue is equal to max
  let v = max
  // delta value
  let d = max-min
  // (s)aturation value
  let s = max == 0 ? 0 : d/max
   
  // (h)ue
  let h
  // handling delta = 0 case
  if (d==0) h = 0 
  else 
  {
    switch(max) 
    {
      case r: h = mod((g-b)/d, 6); break;
      case g: h = (b-r)/d+2; break;
      case b: h = (r-g)/d+4; break;
    }
    // map to [0,1]
    h /= 6;
  }
  return [h,s,v]
}

/*
   h:       hue channel         [0, 1]
   s:       saturation channel  [0, 1]
   v:       value channel       [0, 1]
   returns: a list of three elements [r,g,b] s.t. r,g,b in [0,255]
*/
let hsv2rgb = (h, s, v) =>
{
  let r, g, b
  let i = Math.floor(h*6)
  let f = h*6-i
  let p = v*(1-s)
  let q = v*(1-f*s)
  let t = v*(1-(1-f)*s)

  switch (i%6) 
  {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [r*255, g*255, b*255]
}


let getPixelsToDraw = (img, list) => 
{
  // Selecting pixels to draw
  for(let y=0; y<img.height; y++)
    for(let x=0; x<img.width; x++)
      if(random() < brushStrokesNumberDensity) list.push([x,y])
  
  shuffle(list, true)
}

//  ------ END FUNCTIONS ------ 


//  ------ GUI HANDLERS ------

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
  
  strokeSF = value
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
  
  brushStrokesNumberDensity = value
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
    img = loadedImg
    resetSketch()
    createCanvas(img.width, img.height)
    gradients = scharr(img)
    })
}

//  ------ END GUI HANDLERS ------

/*
  It's a function that is called whenever an input in the GUI is changed.
  Use it as a setup stage.
*/
let resetSketch = () => 
{
  if(!img) return
  xCurrent = yCurrent = 0
  pixelsToDraw = []
  getPixelsToDraw(img, pixelsToDraw)
  
  clear()
  background(255)
}


function setup() 
{
}

/*
  Draw stage:
    - Each time draw 1000 pixels
      - alterate the color
      - calculate brush size and direction (using gradients)
      - draw
*/
function draw() 
{
  if(!img) return;
  index = 0
  while(pixelsToDraw.length > 0 && index < 1000)
  {
    index++
    
    let pixel = pixelsToDraw.pop()
    xCurrent = pixel[0], yCurrent = pixel[1]
    
    // We translate the center to (x,y) coordinates, so that rotation will be centered on (x,y)
    translate(xCurrent, yCurrent)
    if(impressionism)
      rotate(gradientDirection(xCurrent, yCurrent, gradients.xDir, gradients.yDir))
    
    // Take the pixel color at (x,y) coordinates
    let col = img.get(xCurrent, yCurrent)
    
    // Convert it to hsv (In hsv is easy to modify "hue", "saturation" and "brightness")
    let colHSV = rgb2hsv(col[0], col[1], col[2])
    
    
    // Change the Value (similar to brightness)
    colHSV[2] = min(1, colHSV[2]*random(1.35,1.65)) 

    // Pure color
    colHSV[1] = min(1, colHSV[1]*random(1.15,1.35)) 
    
    
    if(complementary_color)
      colHSV[0] = mod(colHSV[0]+random(0.4,0.6), 1)
    else colHSV[0] = random() < 0.35 ? min(colHSV[0]+randomGaussian(0.05,0.05), 1) : colHSV[0]
    
    
    // Convert the new color to rgb
    col = hsv2rgb(colHSV[0], colHSV[1], colHSV[2])
    // Create p5.Color object
    col = color(col[0],col[1], col[2])
    // Set this color
    fill(col)
    noStroke()
    
    // stroke size
    let stroke_scale = Math.max(img.width, img.height) / 900
    stroke_scale *= strokeSF
    let length = stroke_scale + stroke_scale * Math.sqrt(gradientMagnitude(xCurrent, yCurrent, gradients.xDir, gradients.yDir))
    // draw
    if(impressionism)
      ellipse(0, 0, length, stroke_scale)
    else ellipse(0,0, 4*strokeSF, 4*strokeSF)
    
    // Reset the transformation matrix (for translate() and rotate() functions)
    resetMatrix()
  }
}
