'use strict'

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("label-zone");
let ctx = canvas.getContext("2d");

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
        canvas.height = image.height;
        canvas.width = image.width;
        ctx.drawImage(image, 0, 0);
    }
}

function imageHelper2(imageFile, x,y,w,h) {
    let imageURL = URL.createObjectURL(imageFile);

    let image = new Image();
    image.src = imageURL;
    // Add an event handler property for this image object
    image.onload = () => {
        canvas.height = image.height;
        canvas.width = image.width;
        ctx.drawImage(image, x, y, w, h);
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