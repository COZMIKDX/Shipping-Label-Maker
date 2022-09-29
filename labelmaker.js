'use strict'

/** @type {HTMLCanvasElement} */
let mainCanvas = document.getElementById("main-canvas");
let mainctx = mainCanvas.getContext("2d");
mainCanvas.style.display = "none";

/** @type {HTMLCanvasElement} */
let displayCanvas = document.getElementById("display-canvas");
let displayctx = displayCanvas.getContext("2d");

let imageInput = document.getElementById("image-upload");
let imageInput2 = document.getElementById("image-upload2");
let tempbutton = document.getElementById("tempbutton");

// Create an Image object and use the imageFile uploaded to create a URL
// that the Image object can use.
function imageHelper(imageFile) {
    let imageURL = URL.createObjectURL(imageFile);

    let image = new Image();
    image.src = imageURL;
    // Add an event handler property for this image object
    image.onload = () => {
        // Resizing the canvas clears it but for this project that's fine.
        mainCanvas.height = image.height;
        mainCanvas.width = image.width;
        console.log(image.height);
        mainctx.drawImage(image, 0, 0);

        // Another canvas for displaying images in reduced size. Main canvas is used for editing.
        displayCanvas.height = mainCanvas.height / 2;
        displayCanvas.width  = mainCanvas.width  / 2;
        displayctx.drawImage(mainCanvas, 0, 0, image.width / 2, image.height / 2);
    }
}

function imageHelper2(imageFile, x,y,w,h) {
    let imageURL = URL.createObjectURL(imageFile);

    let image = new Image();
    image.src = imageURL;
    // Add an event handler property for this image object
    image.onload = () => {
        mainCanvas.height = image.height;
        mainCanvas.width = image.width;
        mainctx.drawImage(image, x, y, w, h);
    }
}

function tempimage(event) {
    imageHelper2(imageInput.files[0], 0,0,100,100);
}

function canvasBGChange(event) {
    imageHelper(event.target.files[0]);
}

function saveImage(type) {
    // convert the canvas into a data url that is the image encoded as base64.
    // Then create an html element (an <a> specifically)
}

// This app only needs one image uploaded at a time to be used as a background.
// So changing
imageInput.addEventListener("change", canvasBGChange, false);
imageInput2.addEventListener("change", canvasBGChange, false);
tempbutton.addEventListener("click", tempimage, false);

// ToDo: It's not necessary but for the sake of learning, I want to figure out how to drawImage twice.
// Right now it seemingly erases the previous image if I call the imageHelper function twice.
// I think I found that it's not actually erasing.
// Two things that can happen that seem to have this effect:
// First, the canvas is resizing to the latest image's dimensions. Uploading a smaller image second would downsize the canvas.
// Second, when trying out imageHelper2, I drew the image with resized (smaller) dimensions but
//  still resized the canvas to be the full size. The resizing itself seems to clear the canvas.
//  Side note: If I wanted to resize the canvas without loss of drawn pixels, I can use the getImageData function.
//   Alternatively, I could keep a list of images in use and their properties in a stack. Depends, for a game maybe, for simple drawing that's overly complex.

// ToDo: I want to resize the source image for displaying on the webpage but I don't want the output image
//  to be resized. I think I will have an canvas that isn't being displayed as the main canvas and a second
//  canvas to take the main canvas' image and display it smaller.
//  Editing the image and saving it will be done using the main canvas.