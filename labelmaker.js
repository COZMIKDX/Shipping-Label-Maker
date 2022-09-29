'use strict'

/** @type {HTMLCanvasElement} */
let mainCanvas = document.getElementById("main-canvas");
let mainctx = mainCanvas.getContext("2d");
mainCanvas.style.display = "none";

/** @type {HTMLCanvasElement} */
let fontCanvas = document.getElementById("font-canvas");
let fontctx = fontCanvas.getContext("2d");
fontCanvas.style.display = "none";
fontctx.font = "10px Helvetica";

/** @type {HTMLCanvasElement} */
let displayCanvas = document.getElementById("display-canvas");
let displayctx = displayCanvas.getContext("2d");

let imageInput = document.getElementById("image-upload");
let textInput = document.getElementById("text-input");
//let addressButton = document.getElementById("add-address");

function updateDisplayCanvas() {
    displayctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    displayctx.drawImage(mainCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
    displayctx.drawImage(fontCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
}

function resizeEditingCanvases(width, height) {
    mainCanvas.height = height;
    mainCanvas.width  = width;
    fontCanvas.height = height;
    fontCanvas.width  = width;
}

// May not be needed later when I make the display canvas fixed in size.
function resizeDisplayCanvas(width, height) {
    displayCanvas.height = height / 2;
    displayCanvas.width = width / 2;
}

// Create an Image object and use the imageFile uploaded to create a URL
// that the Image object can use.
function imageHelper(imageFile) {
    let imageURL = URL.createObjectURL(imageFile);

    let image = new Image();
    image.src = imageURL;
    // Add an event handler property for this image object
    image.onload = () => {
        // Resizing the canvas clears it but for this project that's fine.
        resizeEditingCanvases(image.width, image.height);
        mainctx.drawImage(image, 0, 0);

        // Another canvas for displaying images in reduced size. Main canvas is used for editing.
        resizeDisplayCanvas(mainCanvas.width, mainCanvas.height);
        updateDisplayCanvas();
    }
}

function canvasBGChange(event) {
    imageHelper(event.target.files[0]);
}

function clearFontCanvas() {

}

function addAddress(event) {
    
    
}

let fontSlider = document.getElementById("font-slider");
function getFontSize() {
    return fontSlider.value;
}

let fontSliderLabel = document.getElementById("font-slider-label");
function setFontLabel() {
    fontSliderLabel.innerHTML = `${getFontSize()}px`;
}

function fontSizeUpdate() {
    setFontLabel();
    fontctx.font = `${getFontSize()}px Helvetica`;
}

function textUpdate() {
    fontctx.clearRect(0, 0, fontCanvas.width, fontCanvas.height);

    let tokenizedInput = textInput.value.split("\n");
    let fontSize = getFontSize();
    for (let i = 0; i < tokenizedInput.length; i++) {
        fontctx.fillText(tokenizedInput[i], 100, 100 + (i * fontSize));
    }

    updateDisplayCanvas();
}

function saveImage(type) {
    // convert the canvas into a data url that is the image encoded as base64.
    // Then create an html element (an <a> specifically)
}

// This app only needs one image uploaded at a time to be used as a background.
// So changing
imageInput.addEventListener("change", canvasBGChange, false);
//addressButton.addEventListener("input", addAddress, false);
fontSlider.addEventListener("input", fontSizeUpdate, false);

textInput.addEventListener("input", textUpdate, false);

/* Notes:
- Because the display canvas is a smaller version of the main canvas, the text drawn will visually be smaller
    than what is on the main canvas. Currently, if you tried one background image and then a larger one,
    the text would *look* bigger on screen because the canvas isn't scaled down to fixed dimensions.
    Having the display canvas be one size and scaling the image of the main canvas to fit the largest
    dimension would fix this.

- I want to be able to adjust the position of the text visually, probably using sliders but dragging a box
    would be even cooler. There are some problems though. Displaying anything on the canvas means drawing
    pixels onto it. That means I can't just draw text and readjust the position without redrawing the
    background image and anything else on canvas.
    A solution is to have two canvases to edit on, each acting as a layer. I then draw the farthest back
    layer, the background image, onto the display canvas. Next, draw the text layer onto the display canvas.
    Saving the image will now require a new canvas in which the same process done to the display canvas will
    be done. However, this canvas will be the same size as the main canvas (the background image canvas).
*/