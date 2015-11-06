"use strict";
var debug = false;

class Terminal {
    //logs to console
    static log(message) {
            $("#console").append(message + "\n");
        }
        //clears console
    static clear() {
        $("#console").text("");
    }
}

//create custom splice method. From user113716 @ http://stackoverflow.com/questions/4313841/javascript-how-can-i-insert-a-string-at-a-specific-index
String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

var lastDown;

//handle document load
$(document).ready(function () {
    paper.install(window);

    paper.setup('board');
    setCanvasSize();
    drawCanvasGrid();

    //set animation
    paper.view.attach('frame', onFrame);

    //add key press listener to canvas
    var canvas = document.getElementById("board");

    document.addEventListener("mousedown", function (event) {
        lastDown = event.target;
    }, false);
    document.addEventListener("keydown", function (event) {
        if (lastDown == canvas) {
            canvasKeyPressed(event);
        }
    }, true);
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

    //return all the indices combined
    return imageIndices.concat(moveIndices).concat(moveToIndices);
}

//compile code to avoid async results conflicting
function compileCode(code) {
    //add terminal message to indicate code has finished runninh
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
sprite.setImage("sprite.gif");
sprite.moveTo(4,3,5);
sprite.move("up",2,4);
sprite.move("right",4,2);
sprite.move("down",7,3);
sprite.moveTo(0,0,1);

var sprite2 = Sprite.create();
sprite2.setImage("http://media.giphy.com/media/cqqY4tX61jof6/giphy.gif");
sprite2.move();
*/

//compileCode('var sprite = Sprite.create();sprite.setImage("http://media.giphy.com/media/cqqY4tX61jof6/giphy.gif");sprite.move();');

//run student code
function runCode() {
    //clear the canvas to start everything fresh
    project.clear();

    //redraw our grid
    drawCanvasGrid();

    //clear the console
    Terminal.clear();

    //let them know we're compiling
    Terminal.log("Compiling...");

    //prepare to get code
    var code = "";
    if (debug) {
        //get code from text field and compile it
        code = compileCode(myCodeMirror.getValue());
    } else {
        //get code from text field, compile it, and wrap it in error catching mechanism
        code = "try{" + compileCode(myCodeMirror.getValue()) + "}catch(err) {Terminal.log(err.message)}";
    }
    //unfocus the input box to avoid issues with keybinding
    $(myCodeMirror).blur();

    //focus the canvas so keybinding works
    lastDown = document.getElementById("board");

    //run the code!
    Terminal.log("Running...");
    window.eval(code);
}

class AnimationRequest {
    constructor(sprite, callBack, destinationX, destinationY, rotations, speed) {
        //variable initialization
        this.sprite = sprite;
        this.callBack = callBack;
        this.rotations = rotations;
        this.speed = speed;
        this.keyToRemove = -1;

        var canvas = document.getElementById("board");
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        var tileWidth = canvasWidth / 10;
        var tileHeight = canvasHeight / 10;

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

        //this is how many pixels we need to move
        this.xPixels = Math.abs(deltaX * tileWidth);
        this.yPixels = Math.abs(deltaY * tileHeight);

        //this is how many pixels we have moved
        this.xPixelsMoved = 0;
        this.yPixelsMoved = 0;

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
var spriteForKey = new Object();
class Sprite {
    //constructor
    constructor() {
            this.id = currentSpriteID;
            this.xCoord = 0;
            this.yCoord = 0;
            this.image = new Raster();
            this.hasAttachedAnimation = false;

            this.upKey = -1;
            this.downKey = -1;
            this.leftKey = -1;
            this.rightKey = -1;

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
        //the point of the image that we can manipulate is the center, so let's start there
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
        spriteForKey[key] = this;
        this.upKey = key;
    }
    setDown(key) {
        spriteForKey[key] = this;
        this.downKey = key;
    }
    setLeft(key) {
        spriteForKey[key] = this;
        this.leftKey = key;
    }
    setRight(key) {
        spriteForKey[key] = this;
        this.rightKey = key;
    }
    animate(destinationX, destinationY, speed, rotateTimes, destination) {
        //create a new animation request
        var animation = new AnimationRequest(this, destination, destinationX, destinationY, null, speed);
        //add it to the queue
        animationRequests.push(animation);
    }
}


var keysDown = [];

function canvasKeyPressed(event) {
    var keyCode = event.keyCode;


    if (!(keysDown.includes(keyCode))) {
        keysDown.push(keyCode);
        if (spriteForKey[keyCode]) {
            var destinationX = spriteForKey[keyCode].xCoord;
            var destinationY = spriteForKey[keyCode].yCoord;

            if (keyCode == spriteForKey[keyCode].upKey)
                destinationY--;
            else if (keyCode == spriteForKey[keyCode].downKey)
                destinationY++;
            else if (keyCode == spriteForKey[keyCode].leftKey)
                destinationX++;
            else if (keyCode == spriteForKey[keyCode].rightKey)
                destinationX--;

            var animation = new AnimationRequest(spriteForKey[keyCode], null, destinationX, destinationY, null, 1);
            animation.keyToRemove = keyCode;
            animationRequests.push(animation);
        }
    }
    if (event.keyCode == 38) {
        console.log(keysDown);
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

        //have we moved far enough?
        if (Math.abs(animationRequests[0].yPixelsMoved) >= animationRequests[0].yPixels && Math.abs(animationRequests[0].xPixelsMoved) >= animationRequests[0].xPixels) {
            //remove key binding if needed
            if (animationRequests[0].keyToRemove != -1) {
                keysDown.splice(keysDown.indexOf(animationRequests[0]), 1);
            }
            //yep, let's continue on to our next item if it exists
            if (animationRequests[0].callBack != null)
                animationRequests[0].callBack.next();
            //delete this animation request
            animationRequests.splice(0, 1);
            //exit this function so we don't extraneously move too far
            return;
        }

        //calculate how far we need to move
        var yPixelsToMove = 1 * animationRequests[0].speed * animationRequests[0].maxY;
        var xPixelsToMove = 1 * animationRequests[0].speed * animationRequests[0].maxX;

        //move!
        animationRequests[0].sprite.image.position.x += xPixelsToMove;
        animationRequests[0].sprite.image.position.y += 1 * yPixelsToMove;

        //log the move so we know what we've done
        animationRequests[0].xPixelsMoved += xPixelsToMove;
        animationRequests[0].yPixelsMoved += yPixelsToMove;
    }
}

function getKeyCodeFromCharacter(key) {
    key = key.toLowerCase();

    if (key == "left" || key == "left arrow")
        return 37;
    else if (key == "up" || key == "up arrow")
        return 38;
    else if (key == "right" || key == "right arrow")
        return 39;
    else if (key == "down" || key == "down arrow")
        return 40;
    else if (key == "delete")
        return 46;
    else if (key == "insert" || key == "ins")
        return 45
    else if (key == "backspace")
        return 8;
    else if (key == "tab")
        return 9;
    else if (key == "enter")
        return 13;
    else if (key == "shift")
        return 16;
    else if (key == "control" || key == "cntrl")
        return 17;
    else if (key == "alt")
        return 18;
    else if (key == "caps" || key == "caps lock")
        return 20;
    else if (key == "esc" || key == "escape")
        return 27;
    else if (key == "page up" || key == "pg up")
        return 33;
    else if (key == "page down" || key == "pg down")
        return 34;
    else if (key == "end")
        return 35;
    else if (key == "home")
        return 36;
    else if (!isNaN(key)) {
        if (key >= 10)
            throw "Not a key";
        return key + 48;
    } else if (key == "f1")
        return 112;
    else if (key == "f2")
        return 113;
    else if (key == "f3")
        return 114;
    else if (key == "f4")
        return 115;
    else if (key == "f5")
        return 116;
    else if (key == "f6")
        return 117;
    else if (key == "f7")
        return 118;
    else if (key == "f8")
        return 119;
    else if (key == "f9")
        return 120;
    else if (key == "f10")
        return 121;
    else if (key == "f11")
        return 122;
    else if (key == "f12")
        return 123;

}