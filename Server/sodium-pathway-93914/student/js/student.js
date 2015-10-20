"use strict";
var debug = false;

class Terminal {
    static log(message) {
        $("#console").append(message + "\n");
    }
    static clear() {
        $("#console").text("");
    }
}

$(window).keypress(function (event) {
    if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
    alert("Ctrl-S pressed");
    event.preventDefault();
    return false;
});

//create custom splice method. From user113716 @ http://stackoverflow.com/questions/4313841/javascript-how-can-i-insert-a-string-at-a-specific-index
String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

//handle document load
$(document).ready(function () {
    paper.install(window);

    paper.setup('board');
    setCanvasSize();
    drawCanvasGrid();

    //set animation
    paper.view.attach('frame', onFrame);


});

//get the grid setup
function drawCanvasGrid() {
    //get canvas width and height
    var canvas = document.getElementById("board");
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    for (var i = 0; i < 10; i++) {
        //vertical lines
        var path = new Path();
        path.strokeColor = 'black';
        path.moveTo(canvas.width * (i / 10), 0);
        path.lineTo(canvas.width * (i / 10), canvasHeight);
        view.draw();

        //horizontal lines
        var path2 = new Path();
        path2.strokeColor = 'black';
        path2.moveTo(0, canvas.height * (i / 10));
        path2.lineTo(canvasWidth, canvas.height * (i / 10));
        view.draw()
    }

}

//refresh the canvas grid when the browser resizes
$(window).resize(function () {
    setCanvasSize();
    drawCanvasGrid();
});
//keep canvas size consistent to prevent blurring
function setCanvasSize() {
    /*var canvas = document.getElementById('board');
    var canvasWidth = $(window).width() * .45;
    var canvasHeight = $(window).width() * .45;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;*/
}
//from Tim Down @ http://stackoverflow.com/questions/3410464/how-to-find-all-occurrences-of-one-string-in-another-in-javascript
function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0,
        searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

//check for likely new statements
function isNewStatementCharacter(character) {
    if (character == ' ' || character == ';' || character == ')' || character == '}' || character == '\n' || character == '\t')
        return true;
    else
        return false;
}

//finds the incdices of the items that need to have callback statements for synchronous code running
function getReplaceIndices(code) {
    var imageIndices = getIndicesOf(".setImage(", code, false);
    var moveIndices = getIndicesOf(".move(", code, false);
    var moveToIndices = getIndicesOf(".moveTo(", code, false);

    return imageIndices.concat(moveIndices).concat(moveToIndices);
}

//compile code to avoid async results conflicting
function compileCode(code) {
    //add terminal message to indicate code has finished running
    code += " Terminal.log('Finished running');";

    var searchIndices = getReplaceIndices(code);
    //iterate through all necessary changes
    for (var i = 0; i < searchIndices.length; i++) {
        var innerCounter = searchIndices[i];

        //get index of where we should insert this time
        innerCounter = code.indexOf(")", innerCounter);

        //splice the calling function in
        var firstSplice = ",{next : function(){goToStatement" + i + "();}}";
        code = code.splice(innerCounter, 0, firstSplice);
        innerCounter += firstSplice.length + 2;

        //splice the destination
        code = code.splice(innerCounter, 0, "\nfunction goToStatement" + i + "(){");
        var tempLocation = searchIndices[i];

        while (code.charAt(tempLocation) != "\n")
            tempLocation--;
        if (code.charAt(tempLocation + 1) == "\\" && code.charAt(tempLocation + 2))
            code = code + "\n}";
        else
            code = code + "}";

        //reset the indices because the string length has changed
        searchIndices = getReplaceIndices(code);
    }

    return code;
}

/*
var sprite = new Sprite();
sprite.setImage("img/giphy.gif");
sprite.setLocation(1,1);
sprite.move("left",1,1);
sprite.move("up",1,1);
sprite.move("right",5,1);
sprite.moveTo(4,3,1);

var sprite2 = Sprite.create();
sprite2.setImage("http://media.giphy.com/media/cqqY4tX61jof6/giphy.gif");
sprite2.move();
*/

//compileCode('var sprite = Sprite.create();sprite.setImage("http://media.giphy.com/media/cqqY4tX61jof6/giphy.gif");sprite.move();');

//run student code
function runCode() {
    project.clear();
    drawCanvasGrid();
    Terminal.clear();
    Terminal.log("Compiling...");
    var code = "";
    if (debug) {
        code = compileCode(myCodeMirror.getValue());
        //code = myCodeMirror.getValue();
    } else {
        code = "try{" + compileCode(myCodeMirror.getValue()) + "}catch(err) {Terminal.log(err.message)}";
    }
    Terminal.log("Running...");
    window.eval(code);
}

function loadSavedCode() {
    //get code from storage and decode from base64
    var code = atob(localStorage.getItem("studentCode"));
    myCodeMirror.setValue(code);
}

function saveCode() {
    //get code and encode in base64
    var code = btoa(myCodeMirror.getValue());
    //store code
    localStorage.setItem("studentCode", code);
}

class AnimationRequest {
    constructor(sprite, callBack, destinationX, destinationY, rotations, speed) {
        this.sprite = sprite;
        this.callBack = callBack;
        this.rotations = rotations;
        this.speed = speed;
        this.timesExecuted = 0;

        //get how many tiles we need to move in each direction
        var deltaX = destinationX - this.sprite.xCoord;
        var deltaY = destinationY - this.sprite.yCoord;

        //find out how far the total distance actually is
        this.fullDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

        //figure out if we need to move in the positive or negative direction (value will always be 1 or -1. If we divide 0/0 and get NaN, assign value to positive 1
        var xNegativeMultiplier = deltaX / Math.abs(deltaX) || 1;
        var yNegativeMultiplier = deltaY / Math.abs(deltaY) || 1;

        //get ready for multipliers
        this.maxX = 0;
        this.maxY = 0;

        //determine the multiplier for the max speed of each direction, so the sprite can get to its destination as quickly as possible
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            this.maxY = Math.abs(deltaY / deltaX) * yNegativeMultiplier;
            this.maxX = 1.0 * xNegativeMultiplier;
        } else if (deltaX == deltaY) {
            this.maxX = 1.0 * xNegativeMultiplier;
            this.maxY = 1.0 * yNegativeMultiplier;
        } else {
            this.maxY = 1.0 * yNegativeMultiplier;
            this.maxX = Math.abs(deltaX / deltaY) * xNegativeMultiplier;
        }
    }
}

//persitent data
var currentSpriteID = 0;
class Sprite {
    //constructor
    constructor() {
            this.id = currentSpriteID;
            this.xCoord = 0;
            this.yCoord = 0;
            this.image = new Raster();
            this.hasAttachedAnimation = false;

            //increment sprite ID before more instance creation can occur
            currentSpriteID++;
        }
        //sets the image based on the passed URL and then once the image is completed loading, continues the program flow based on the value of destination.next();
    setImage(URL, destination) {
            this.image = null;
            this.image = new Raster(URL);
            //alert(image.width);
            var tempThis = this;
            this.image.onLoad = function () {
                tempThis.setImageSize();
                tempThis.setLocation(tempThis.xCoord, tempThis.yCoord);
                destination.next();
            };
        }
        //sets the position of the sprite based on an X/Y coordinate (instant)
    setLocation(x, y) {
        var imageXCenter = this.image.width / 2;
        var imageYCenter = this.image.height / 2;

        var canvas = document.getElementById("board");
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        var tileWidth = canvasWidth / 10;
        var tileHeight = canvasHeight / 10;

        //set position based on passed arguments and tile dimensions
        this.image.position = new Point(imageXCenter + tileWidth * x, imageYCenter + tileHeight * y);
        this.xCoord = x;
        this.yCoord = y;
    }
    move(direction, numSpaces, speed, destination) {
        //sanitize the string to remove any obscure characters
        direction = direction.replace(/[^a-zA-Z0-9! ]+/g, "");
        //make it all lower case for consistency
        direction = direction.toLowerCase();

        //get existing coordinates for further use and instantiate the final value variables
        var finalX = this.xCoord;
        var finalY = this.yCoord;

        //decide where we need to go
        if (direction == "left") {
            finalX -= numSpaces;
        } else if (direction == "right") {
            finalX += numSpaces;
        } else if (direction == "down") {
            finalY += numSpaces;
        } else if (direction == "up") {
            finalY -= numSpaces;
        } else {
            //they screwed up, the program can't continue so let's just throw an error and let them know
            throw "Direction invalid. Try the directions left, right, up, or down";
        }
        //animate it!
        this.animate(finalX, finalY, speed, null, destination);
        //update existing coordinate values
        this.yCoord = finalY;
        this.xCoord = finalX;
    }
    moveTo(x, y, speed, destination) {
            //animate it!
            this.animate(x, y, speed, null, destination);
            //update existing coordinate values
            this.yCoord = y;
            this.xCoord = x;
        }
        //appropriately size image for canvas
    setImageSize() {
        var canvas = document.getElementById("board");
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        var tileWidth = canvasWidth / 10;
        var tileHeight = canvasHeight / 10;
        //get image width and height
        var imageWidth = this.image.width;
        var imageHeight = this.image.height;

        //scale image so it appropriately fits in the grid
        if (tileWidth - 5 < imageWidth || tileHeight - 5 < imageHeight) {
            if (imageWidth > imageHeight) {
                var scaleFactor = (tileWidth - 5) / imageWidth;
                this.image.width = tileWidth - 5;
                this.image.height = this.image.height * scaleFactor;
            } else if (imageWidth < imageHeight) {
                var scaleFactor = (tileHeight - 5) / imageHeight;
                this.image.width = this.image.width * scaleFactor;
                this.image.height = tileHeight - 5;
            } else {
                this.image.width = tileWidth - 5;
                this.image.height = tileHeight - 5;
            }
        }

    }
    setUp(key) {

    }
    setDown(key) {

    }
    setLeft(key) {

    }
    setRight(key) {

    }
    animate(destinationX, destinationY, speed, rotateTimes, destination) {
        //create a new animation request
        console.log("Request new animation");
        var animation = new AnimationRequest(this, destination, destinationX, destinationY, null, speed);
        animationRequests.push(animation);

    }

}



var animationRequests = [];

function onFrame(event) {
    if (animationRequests.length != 0) {

        //get canvas size
        var canvas = document.getElementById("board");
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;


        //get tile width for accurate calculations
        var tileWidth = canvasWidth / 10;
        var tileHeight = canvasHeight / 10;

        if (animationRequests[0].timesExecuted >= animationRequests[0].fullDistance * tileWidth) {
            animationRequests[0].callBack.next();
            animationRequests.splice(0, 1);
            return;
        }

        animationRequests[0].sprite.image.position.x += 1 * animationRequests[0].maxX;
        animationRequests[0].sprite.image.position.y += 1 * animationRequests[0].maxY;
        animationRequests[0].timesExecuted++;
    }
}