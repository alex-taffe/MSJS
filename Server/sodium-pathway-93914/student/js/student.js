"use strict";
var debug = true;

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

function getReplaceIndices(code) {
    var imageIndices = getIndicesOf(".setImage(", code, false);
    var moveIndices = getIndicesOf(".move(", code, false);
    var moveToIndices = getIndicesOf(".moveTo(", code, false);

    return imageIndices.concat(moveIndices).concat(moveToIndices);
}

//compile code to avoid async results conflicting
function compileCode(code) {
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
    alert(code);
    return code;
}


/*
var sprite = new Sprite();
sprite.setImage("img/giphy.gif");
sprite.setLocation(1,1);
sprite.move("left",3,1);

var sprite2 = Sprite.create();
sprite2.setImage("http://media.giphy.com/media/cqqY4tX61jof6/giphy.gif");
sprite2.move();
*/

//compileCode('var sprite = Sprite.create();sprite.setImage("http://media.giphy.com/media/cqqY4tX61jof6/giphy.gif");sprite.move();');

//run student code
function runCode() {
    project.clear();
    drawCanvasGrid();
    var code = "";
    if (debug) {
        code = compileCode(myCodeMirror.getValue());
        //code = myCodeMirror.getValue();
    } else {
        code = "try{" + compileCode(myCodeMirror.getValue()) + "}catch(err) {alert(err.message)}";
    }
    window.eval(code);
}

//STUDENT ACCESSIBLE METHODS

//persitent data
var currentSpriteID = 0;
class Sprite {
    //constructor
    constructor() {
            this.id = currentSpriteID;
            this.xCoord = 0;
            this.yCoord = 0;
            this.image = new Raster();

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
                //setLocation(xCoord, yCoord);
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
    move(direction, numSpaces, speed) {
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
        } else if (direction == "up") {
            finalY += numSpaces;
        } else if (direction == "down") {
            finalY -= numSpaces;
        } else {
            //they screwed up, the program can't continue so let's just throw an error and let them know
            throw "Direction invalid. Try the directions left, right, up, or down";
        }

        this.animate(this.xCoord, this.yCoord, finalX, finalY, speed);
    }
    moveTo(x, y, speed) {
            this.animate(x, y, speed, currentX, currentY);
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
    animate(currentX, currentY, destinationX, destinationY, speed, rotateTimes, destination) {
        //get movement totals
        var canvas = document.getElementById("board");
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        var tileWidth = canvasWidth / 10;
        var tileHeight = canvasHeight / 10;
        console.log(`X original: ${currentX}\nY original: ${currentY}\nDestination X: ${destinationX}\nDestination Y: ${destinationY}`);

        var fullDistance = Math.sqrt(Math.pow(destinationX - currentX, 2) + Math.pow(destinationY - currentY, 2));
        console.log(fullDistance);
        var sprite = this;
        paper.view.attach('frame', animateLinear);

        function animateLinear(event) {
            if (event.count < fullDistance * tileWidth) {
                sprite.image.position.x += 1;
                sprite.image.position.y += 1;
            } else {
                console.log("exit");
                paper.view.detach('frame', animateLinear);
            }
        }

    }
}