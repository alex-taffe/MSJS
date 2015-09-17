var Sprite = {
        create: function () {
            var temp = {

                image: new Raster(),
                setImage: function (URL, destination) {
                    image = null;
                    image = new Raster(URL);
                    //alert(image.width);
                    image.onLoad = function () {
                        setImageSize(image);
                        //setLocation(xCoord, yCoord);
                        destination.next();
                    };
                },
                setLocation: function (x, y) {
                    //get canvas and grid sizing
                    var imageXCenter = image.width / 2;
                    var imageYCenter = image.height / 2;

                    var canvas = document.getElementById("board");
                    var canvasWidth = canvas.width;
                    var canvasHeight = canvas.height;

                    var tileWidth = canvasWidth / 10;
                    var tileHeight = canvasHeight / 10;

                    //set position based on passed arguments and tile dimensions
                    image.position = new Point(imageXCenter + tileWidth * x, imageYCenter + tileHeight * y);
                    xCoord = x;
                    yCoord = y;
                },
                id: 0,
                xCoord: 0,
                yCoord: 0,
                move: function () {},
                moveTo: function () {

                }
            };

            temp.move = function (direction, numSpaces, speed) {
                console.log(temp.image.position);
                animate(temp, numSpaces);
            };
            temp.moveTo = function (x, y, speed) {
                animate(temp, x, y, speed, currentX, currentY);
            };

            temp.id = currentSpriteID;
            currentSpriteID++;
            return temp;
        }

    }