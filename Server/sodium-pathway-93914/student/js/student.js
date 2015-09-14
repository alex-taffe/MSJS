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

//compile code to avoid async results conflicting
function compileCode(code) {
    var imageIndices = getIndicesOf(".setImage(", code, false);
    //iterate through all necessary changes
    for (var i = 0; i < imageIndices.length; i++) {
        var innerCounter = imageIndices[i];

        //get index of where we should insert this time
        innerCounter = code.indexOf(")", innerCounter);

        //splice the calling function in
        var firstSplice = ",{next : function(){goToStatement" + i + "();}}";
        code = code.splice(innerCounter, 0, firstSplice);
        innerCounter += firstSplice.length + 2;

        //splice the destination
        code = code.splice(innerCounter, 0, "function goToStatement" + i + "(){");
        code = code + "\n}";

        //reset the indices because the string length has changed
        imageIndices = getIndicesOf(".setImage(", code, false);
    }
    alert(code);
    return code;
}


/*
var sprite = Sprite.create();
sprite.setImage("http://media.giphy.com/media/cqqY4tX61jof6/giphy.gif");
sprite.move();
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
var Sprite = {
        create: function () {
            var temp = {
                image: new Raster(),
                setImage: function (URL, destination) {
                    image = null;
                    console.log("outer");
                    image = new Raster(URL);
                    //alert(image.width);
                    image.onLoad = function () {
                        setImageSize(image);
                        console.log("inner");
                        destination.next();
                    };
                },
                setLocation: function (x, y) {
                    image.source = new Point(x, y);
                },
                id: 0,
                move: function () {}
            }

            temp.move = function (direction, numSpaces, speed) {
                animate(temp);
            };
            temp.id = currentSpriteID;
            currentSpriteID++;
            return temp;
        }

    }
    //appropriately size image for canvas
function setImageSize(image) {
    //get canvas width and height
    var canvas = document.getElementById("board");
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var tileWidth = canvasWidth / 10;
    var tileHeight = canvasHeight / 10;
    //get image width and height
    var imageWidth = image.width;
    var imageHeight = image.height;

    if (tileWidth - 5 < imageWidth || tileHeight - 5 < imageHeight) {
        if (imageWidth > imageHeight) {
            var scaleFactor = (tileWidth - 5) / imageWidth;
            image.width = tileWidth - 5;
            image.height = image.height * scaleFactor;
        } else if (imageWidth < imageHeight) {
            var scaleFactor = (tileHeight - 5) / imageHeight;
            image.width = image.width * scaleFactor;
            image.height = tileHeight - 5;
        } else {
            image.width = tileWidth - 5;
            image.height = tileHeight - 5;
        }
    }

}

function animate(sprite, direction, speed) {
    console.log("test");
    view.onFrame = function (event) {
        sprite.image.rotate(3);
    };
}