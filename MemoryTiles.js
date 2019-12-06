//sets starting screen to home screen
var isHomeScene = true;
var winState = false;
//setting the winstate length to # of millis when program starts
var winStateLength = millis();
//5 seconds of confetti falling
var confettiLength = 5000;
//make sure program starts on home screen
var isEasyGrid = false;
var isHardGrid = false;
//creates confetti array (empty)
var confettiArray = [];

//creating buttons
var btnEasy = {
    x: 241,
    y: 22,
    width: 60,
    height: 29,
    label: "Easy",
};

//hard button
var btnHard = {
    x: 312,
    y: 22,
    width: 60,
    height: 29,
    label: "Hard",
};

//home button
var btnHome = {
    x: 110,
    y: 235,
    width: 65,
    height: 29,
    label: "Home",
};

//play again button
var btnPlayAgain = {
    x: 191,
    y: 235,
    width: 105,
    height: 29,
    label: "Play Again",
};

//function to draw buttons
var drawButton = function(btn) {
    strokeWeight(1);
    fill(83, 166, 95);
    rect(btn.x, btn.y, btn.width, btn.height, 5);
    fill(255, 255, 255);
    textSize(20);
    textAlign(LEFT, TOP);
    text(btn.label, btn.x+7, btn.y+btn.height/8);
};

//draws difficulty bar at the top of screen (stands for option)
var opt = function() {
    fill(214, 247, 202);
    rect(11, 11, 382, 50);
    fill(0, 0, 0);
    textSize(20);
    text("Choose your difficulty:", 29, 25);
    drawButton(btnEasy);
    drawButton(btnHard);
};

//function to draw the home screen
var homeScene = function() {
    background(255, 255, 255);
    winState = false;
    opt();
    strokeWeight(2);
    isHomeScene = true;
    fill(214, 247, 202);
    rect(40, 112, 330, 200);
    fill(0, 0, 0);
    textSize(30);
    text("Welcome to Memory++", 51, 126);
    textSize(20);
    text("Click the buttons above and", 78, 178);
    text("choose your difficulty level.", 86, 203);
    textSize(15);
    text("Leave feedback in the comments or spin-off", 61, 240);
    text("and make your own Memory++ game!", 75, 256);
    text("Made by: Graham Billington", 108, 284);
};

//confetti constructor
var Confetti = function(x, y, red, green, blue) {
    this.x = x;
    this.y = y;
    this.red = red;
    this.green = green;
    this.blue = blue;
};

//pushes new confetti into array
var createConfetti = function() {
   confettiArray.push(new Confetti(random(0, 400), -10, random(0, 255), random(0, 255), random(0, 255)));
};

//draws confetti
Confetti.prototype.draw = function() {
        fill(this.red, this.green, this.blue);
        rect(this.x, this.y, 5, 15);
        this.y += 6;
};

//returns boolean if confetti is on the screen
Confetti.prototype.isOnScreen = function() {
    return this.y <= 400;
};

//tile contructor
var Tile = function(x, y, width, face) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.face = face;
    this.isFaceUp = false;
    this.isMatch = false;
    this.isHoverState = false;
};

//draws the tile
Tile.prototype.draw = function() {
    fill(214, 247, 202);
    strokeWeight(2);
    rect(this.x, this.y, this.width, this.width, 10);
    //if tile is face up then draw the image 
    if (this.isFaceUp) {
        image(this.face, this.x, this.y, this.width, this.width);
        
        //if tile is face down and mouse is over tile then draw yellow leaf (hoverstate)
    } else if (this.isUnderMouse(mouseX, mouseY)) {    
        
        fill(74, 122, 128);
        strokeWeight(2);
        rect(this.x, this.y, this.width, this.width, 10);
        image(getImage("avatars/leaf-yellow"), this.x, this.y, this.width, this.width);
        
        //if tile is face up then draw green leaf
    } else {
        image(getImage("avatars/leaf-green"), this.x, this.y, this.width, this.width);
    }
};

//returns boolean to see if tiles are under mouse
Tile.prototype.isUnderMouse = function(x, y) {
    return x >= this.x && x <= this.x + this.width  &&
        y >= this.y && y <= this.y + this.width;
};

// Global config
var NUM_COLS = 5;
var NUM_ROWS = 4;

// Declare an array of all possible faces
var faces = [
    getImage("avatars/leafers-seed"),
    getImage("avatars/leafers-seedling"),
    getImage("avatars/leafers-sapling"),
    getImage("avatars/leafers-tree"),
    getImage("avatars/leafers-ultimate"),
    getImage("avatars/marcimus"),
    getImage("avatars/mr-pants"),
    getImage("avatars/mr-pink"),
    getImage("avatars/old-spice-man"),
    getImage("avatars/robot_female_1"),
    getImage("avatars/robot_female_2"),
    getImage("avatars/robot_female_3"),
    getImage("avatars/robot_male_1"),
    getImage("avatars/robot_male_2"),
    getImage("avatars/robot_male_3"),
    getImage("avatars/spunky-sam"),
    getImage("creatures/Hopper-Happy"),
    getImage("creatures/OhNoes-Happy"),
    getImage("creatures/BabyWinston"),
    getImage("creatures/Winston"),
    getImage("space/rocketship"),
];

// Now shuffle the elements of that array
var shuffleArray = function(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var ind = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[ind];
        array[ind] = temp;
    }
};

// Create the tiles
var tiles = [];
var numTries = 0;
var numMatches = 0;
var flippedTiles = [];
var delayStartFC = null;
//global definition
var selected = [];

//logic for pairing the tiles together 
var pairTiles = function() {
    // Make an array which has 2 of each, then randomize it
    var possibleFaces = faces.slice(0);
    
    for (var i = 0; i < (NUM_COLS * NUM_ROWS) / 2; i++) {
        // Randomly pick one from the array of remaining faces
        var randomInd = floor(random(possibleFaces.length));
        var face = possibleFaces[randomInd];
        // Push twice onto array
        selected.push(face);
        selected.push(face);
        // Remove from array
        possibleFaces.splice(randomInd, 1);
    }
};

//draws the 5 by 4 grid (easy)
var createEasyGrid = function() {
    isHomeScene = false;
    isEasyGrid = true;
    winState = false;
    tiles = [];
    numMatches = 0;
    background(255, 255, 255);
    NUM_COLS = 5;
    NUM_ROWS = 4;
    pairTiles();
    shuffleArray(selected);
    for (var i = 0; i < NUM_COLS; i++) {
        for (var j = 0; j < NUM_ROWS; j++) {
            var tileX = i * 78 + 10;
            var tileY = j * 78 + 75;
            var tileFace = selected.pop();
            tiles.push(new Tile(tileX, tileY, 70, tileFace));
        }
    }
};

//draws the 7 by 6 grid (hard) 
var createHardGrid = function() {
    isHardGrid = true;
    tiles = [];
    isHomeScene = false;
    winState = false;
    numMatches = 0;
    NUM_COLS = 7;
    NUM_ROWS = 6;
    pairTiles();
    shuffleArray(selected);
    for (var i = 0; i < NUM_COLS; i++) {
        for (var j = 0; j < NUM_ROWS; j++) {
            var tileX = i * 55 + 10;
            var tileY = j * 55 + 65;
            var tileFace = selected.pop();
            tiles.push(new Tile(tileX, tileY, 50, tileFace));
        } 
    }
};

//draws the win state
var drawWinState = function() {
    fill(214, 247, 202);
    rect(39, 149, 320, 142);
    fill(0, 0, 0);
    textSize(25);
    text("Winner!!!", 149, 160);
    textSize(18);
    text("You matched all the tiles in " + numTries + " tries!", 64, 195);
    drawButton(btnHome);
    drawButton(btnPlayAgain);
    //only creates the confetti for 5 seconds (5000 milli secs)
    if (millis() - winStateLength < confettiLength) {
        for (var i = 0; i< 1; i++) {
            createConfetti();
        }
    }
    //draws the confetti's that are on the screen
    for (var i = 0; i < confettiArray.length; i++) {
       if (confettiArray[i].isOnScreen()) {
            confettiArray[i].draw();
       } 
    } 
    //deletes confetti's from arraw once they leave the screen
    //runs through loop backwards to avoid any skips in array 
    for (var i = confettiArray.length - 1; i >= 0; i--) {
        if(!confettiArray[i].isOnScreen()) {
           confettiArray.splice(i, 1);
    }
}
    
    winState = true;
}; 

//drawing game
draw = function() {
    background(255, 255, 255);
    //options at top
    opt();
    //keeps tiles down
    if (delayStartFC && (frameCount - delayStartFC) > 30) {
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (!tile.isMatch) {
                tile.isFaceUp = false;
            }
        }
        flippedTiles = [];
        delayStartFC = null;
    }
    
    //draw each tile
    for (var i = 0; i < tiles.length; i++) {
        tiles[i].draw();
    }
    //draw winstate if user wins
    if (winState === true) {
        
        drawWinState();
        
        //clear confetti array if they dont win
    } else {
        confettiArray = [];
    }
    //draw home screen 
    if (isHomeScene === true) {
        homeScene();
    }
}; 
//logic for tile flipping
var checkIfFlippingTile = function() {
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i].isUnderMouse(mouseX, mouseY)) {
            if (flippedTiles.length < 2 && !tiles[i].isFaceUp) {
                tiles[i].isFaceUp = true;
                flippedTiles.push(tiles[i]);
                if (flippedTiles.length === 2) {
                    numTries++;
                    if (flippedTiles[0].face === flippedTiles[1].face) {
                        flippedTiles[0].isMatch = true;
                        flippedTiles[1].isMatch = true;
                        flippedTiles.length = 0;
                        playSound(getSound("retro/coin"));
                        numMatches++;
                        
                        if (numMatches === tiles.length / 2) {
                            winState = true;
                            winStateLength = millis();
                        }
                    }
                    delayStartFC = frameCount;
                }
            } 
        }
    }
};  

//resets game
var resetGame = function() {
    winState = false;
    winStateLength = 0;
    numMatches = 0;
    numTries = 0;
    confettiArray = [];
};

//play again button for hard grid
var playHardGridAgain = function() {
    if (mouseX >= 191 && mouseX <= 296 && mouseY >= 235 && mouseY <= 264 && winState === true && isHardGrid === true) {
                createHardGrid();
                resetGame();

            }
};

//play again button for easy grid
var playEasyGridAgain = function() {
    if (mouseX >= 191 && mouseX <= 296 && mouseY >= 235 && mouseY <= 264 && winState === true && isEasyGrid === true) {
                createEasyGrid();
                resetGame();
            }
};

//home button
var goToHome = function() {
    if (mouseX >= 110 && mouseX <= 175 && mouseY >= 235 && mouseY <= 264 && winState === true) {
                homeScene(); 
                resetGame();
            } 
};

//hard grid button
var goToHardGrid = function() {
    if (mouseX >= 312 && mouseX <= 372 && mouseY >= 22 && mouseY <= 51) {
                resetGame();
                createHardGrid();
            }
};

//easy grid button
var goToEasyGrid = function() {
    if (mouseX >= 241 && mouseX <= 301 && mouseY >= 22 && mouseY <= 51) {
                resetGame();
                createEasyGrid();
            } 
};

//mouse clicked event
mouseClicked = function() {
        
    checkIfFlippingTile();  

    playEasyGridAgain();
    
    playHardGridAgain();

    goToHome();

    goToEasyGrid();

    goToHardGrid();

};

//hoverstate 
Tile.prototype.hoverState = function() {
    this.isFaceUp = false;
    this.isHoverState = true;
    fill(74, 122, 128);
    strokeWeight(2);
    rect(this.x, this.y, this.width, this.width, 10);
    image(getImage("avatars/leaf-yellow"), this.x, this.y, this.width, this.width);
};