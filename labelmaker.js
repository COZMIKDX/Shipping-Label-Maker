'use strict'
let jsPDF = window.jspdf.jsPDF;

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
let saveCanvas = document.getElementById("save-canvas");
let savectx = saveCanvas.getContext("2d");
saveCanvas.style.display = "none";

/** @type {HTMLCanvasElement} */
let displayCanvas = document.getElementById("display-canvas");
let displayctx = displayCanvas.getContext("2d");

let imageInput = document.getElementById("image-upload");
let textInput = document.getElementById("text-input");
let xSlider =  document.getElementById("xpos");
let ySlider = document.getElementById("ypos");
let saveButton = document.getElementById("save-button");
let downloadButton = document.getElementById("download-button");

let doc = new jsPDF('p', 'px', [saveCanvas.height, saveCanvas.width]);

let dataBlobList = [];

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
    saveCanvas.height = width; // swapped to be in portait orientation in pdf.
    saveCanvas.width  = height;
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

        updateFontCanvas(); // Redraw the text input after drawing the image.

        // Another canvas for displaying images in reduced size. Main canvas is used for editing.
        resizeDisplayCanvas(mainCanvas.width, mainCanvas.height);
        updateDisplayCanvas();

        xSlider.setAttribute("max", fontCanvas.width);
        if (xSlider.value > fontCanvas.width) { xSlider.value = fontCanvas.width - 10; } // I probably should make sure the slider doesn't hit negative values but it's probably not going to happen.
        
        ySlider.setAttribute("max", fontCanvas.height);
        if (ySlider.value > fontCanvas.height) { ySlider.value = fontCanvas.height; }

        doc = makeNewPDF();
    }
}

function canvasBGChange(event) {
    imageHelper(event.target.files[0]);
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
    ySlider.setAttribute("min", getFontSize()); // So that the text isn't hidden offscreen
}

// updates the font canvas and then the display canvas.
// perhaps I should remove the updateDisplayCanvas call so that I can call this in the imageHelper.
// I would likely need another function to call updateDisplayCanvas during an event.
function updateFontCanvas() {
    fontctx.clearRect(0, 0, fontCanvas.width, fontCanvas.height);

    fontSizeUpdate(); // Make sure we're using the right font properties. Also canvas resizing in imageHelper clears the set font properties.

    let tokenizedInput = textInput.value.split("\n");
    let fontSize = getFontSize();
    for (let i = 0; i < tokenizedInput.length; i++) {
        fontctx.fillText(tokenizedInput[i], Number(xSlider.value), Number(ySlider.value) + (i * fontSize));
    }
}

function textUpdate() {
    updateFontCanvas();
    updateDisplayCanvas();
}

function degToRad(degree) {
    return degree * (Math.PI / 180);
}

function updateSaveCanvas() {
    savectx.resetTransform();
    savectx.clearRect(0, 0, saveCanvas.width, saveCanvas.height);
    // Transform for 90 degree rotation
    // savectx.translate(saveCanvas.width, 0);
    // savectx.rotate(degToRad(90));

    savectx.translate(0, saveCanvas.height);
    savectx.rotate(degToRad(270));

    
    savectx.drawImage(mainCanvas, 0, 0, mainCanvas.width, mainCanvas.height);
    savectx.drawImage(fontCanvas, 0, 0, fontCanvas.width, fontCanvas.height);
    
}

function saveImageBlob() {
    updateSaveCanvas();

    saveCanvas.toBlob((blob) => {
        dataBlobList.push(blob);
    },"image/png");

    textInput.value = "";
    textUpdate(); // To clear the text in the image.
    downloadButton.disabled = false;

    makePDF();
}

function downloadImagesBlob() {
    let zip = new JSZip();
    for (let i = 0; i < dataBlobList.length; i++) {
        zip.file(`label_${i}.png`, dataBlobList[i]);
    }
    zip.generateAsync({ type: "blob" })
        .then(function (blob) {
            saveAs(blob, "hello.zip");
            dataBlobList = [];
        });
}

function makeNewPDF() {
    return new jsPDF('p', 'px', [saveCanvas.height, saveCanvas.width]);
}

function addImageToPDF() {
    updateSaveCanvas();
    doc.addImage(saveCanvas, 'PNG', 0, 0, saveCanvas.width, saveCanvas.height);
    doc.addPage([saveCanvas.height, saveCanvas.width], 'p');
    textInput.value = "";
    textUpdate(); // To clear the text in the image.
    downloadButton.disabled = false;
}

function downloadPDF() {
    let length = doc.internal.getNumberOfPages();
    doc.deletePage(length); // delete the last page as it wasn't used to make a label.
    doc.save("shipping_labels.pdf");
}

// This app only needs one image uploaded at a time to be used as a background.
// So changing
imageInput.addEventListener("change", canvasBGChange, false);
//addressButton.addEventListener("input", addAddress, false);
fontSlider.addEventListener("input", textUpdate, false);

textInput.addEventListener("input", textUpdate, false);
xSlider.addEventListener("input", textUpdate, false);
ySlider.addEventListener("input", textUpdate, false);
saveButton.addEventListener("click", addImageToPDF, false);
downloadButton.addEventListener("click", downloadPDF, false);

/* Notes:
- Client wants the labels to be printed such that his printer's builtin watermark is in a specific position
    and orienation. The first test run essentially had the label printed upside down. The pdf images were 
    in landscape orientation but the printer software automatically decided how to rotate them.
    The issue is that it he wants this mostly automated. He doesn't want to change the printer settings to 
    print correctly here and then again to print etsy shipping labels correctly.
*/