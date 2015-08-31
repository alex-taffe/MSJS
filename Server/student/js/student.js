//handle document load
$(document).ready(function () {
    setCanvasSize();
    drawCanvasGrid();

});

//get the grid setup
function drawCanvasGrid() {
    var canvas = document.getElementById('board');
    var ctx = canvas.getContext('2d');

    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    //set the color before drawing grid
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    for (var i = 0; i < 10; i++) {
        //vertical lines
        ctx.beginPath();
        ctx.moveTo(canvas.width * (i / 10), 0);
        ctx.lineTo(canvas.width * (i / 10), canvasHeight);
        ctx.stroke();

        //horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * (i / 10));
        ctx.lineTo(canvasWidth, canvas.height * (i / 10));
        ctx.stroke();
    }

}

//refresh the canvas grid when the browser resizes
$(window).resize(function () {
    setCanvasSize();
    drawCanvasGrid();
});
//keep canvas size consistent to prevent blurring
function setCanvasSize() {
    var canvas = document.getElementById('board');
    var canvasWidth = $(window).width() * .45;
    var canvasHeight = $(window).width() * .45;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
//run student code
function runCode() {
    var code = "try{" + myCodeMirror.getValue() + "}catch(err) {alert(err.message)}";
    window.eval(code);
}

//STUDENT ACCESSIBLE METHODS
var Sprite = {
    create: function () {
        var temp = {
            image: "default.svg",
            xCoord: 0,
            yCoord: 0,
        }
        return temp;
    }
}