'use strict';

window.onload = () => {
    //Canvas stuff
    let canvas = document.getElementById("js-board");
    let exportBtn = document.getElementById("js-export");
    let loadBtn = document.getElementById("js-load");
    let textbox = document.getElementById("js-textbox")

    let game = new Game(600, 5, canvas);
    game.start();

    let inEventTrigger = false;

    console.log("happen once right?");

    window.addEventListener("keydown", function (e) {    
        //Throttle the input to one per 50 ms
        if(!inEventTrigger) {
            const controlKeys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
            if (controlKeys.includes(e.key)) {
                let index = controlKeys.indexOf(e.key);
                //Execute the move
                game.doMove(index);
            }

            inEventTrigger = true;
            setTimeout(() => inEventTrigger = false, 50);
        }
    });

    exportBtn.addEventListener("click", function() {
        textbox.value = JSON.stringify(game.board);
    });
    loadBtn.addEventListener("click", function() {
        game.setBoard(JSON.parse(textbox.value));
    });
    
}

class Game {
    constructor(size, numSquares, canvas) {
        this.size = size;
        this.numSquares = numSquares;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.board = [];
        this.baseStates = [[[1, 1], [2, 2]],
        [[1, 1], [3, 3]],
        []];
        this.colors = {
            0: "#CCBFB3",
            2: "#EDE3D9",
            4: "#ECDFC6",
            8: "#F0AF78",
            16: "#F29363",
            32: "#F37A5F",
            64: "#F35C3C",
            128: "#EBCD71",
            256: "#EACA61",
            512: "#EAC651",
            1024: "#EAC341",
            2048: "#EDC22E"
        };
    }

    start() {
        this.initializeBoard();
        this.drawTiles();
        this.drawGrid();
    }

    initializeBoard() {
        this.ctx.font = "bold 40px Arial";

        for (let x = 0; x < this.numSquares; x++) {
            let row = [];
            for (let y = 0; y < this.numSquares; y++) {
                row.push(0);
            }
            this.board.push(row);
        }
        //Should have done JSON...
        let initial = this.baseStates[this.numSquares - 4];
        for (let x = 0; x < initial.length; x++) {
            let coord = initial[x];
            this.board[coord[0]][coord[1]] = 2;
        }
    }

    setBoard(newBoard) {
        this.board = newBoard;
        this.redraw();
    }

    drawGrid() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#B9AB9E";
        let squareSize = this.size / this.numSquares;
        for (let i = 1; i < this.numSquares; i++) {
            //Vertical lines
            this.ctx.moveTo(0, squareSize * i);
            this.ctx.lineTo(this.size, squareSize * i);
            this.ctx.lineWidth = 6;
            this.ctx.stroke();
            //Horizontal lines
            this.ctx.moveTo(squareSize * i, 0);
            this.ctx.lineTo(squareSize * i, this.size);
            this.ctx.lineWidth = 6;
            this.ctx.stroke();
        }
    }

    drawTiles() {
        this.ctx.textAlign = "center";

        let squareSize = this.size / this.numSquares;
        let midpoint = squareSize / 2;
        for (let y = 0; y < this.numSquares; y++) {
            for (let x = 0; x < this.numSquares; x++) {
                this.ctx.fillStyle = this.colors[this.board[y][x]];
                this.ctx.fillRect(x*squareSize, y*squareSize, squareSize, squareSize);
                this.ctx.fillStyle = "#766E65";
                this.ctx.fillText(this.board[y][x], midpoint + x * squareSize,
                    midpoint + y * squareSize + 15);
            }
        }
    }

    //TODO: refactor this to make it prettier/more efficient?
    doMove(move) {
        //console.log(`doing move: ${move}`)
        let d = new Date();
        let start = d.getTime();

        if (move === 0) { //Up
            for (let x = 0; x < this.numSquares; x++) {
                for (let y = 0; y < this.numSquares; y++) {
                    if(!(this.board[y][x] === 0)) {
                        this.pack(x, y, move);
                    }
                }
            }
        }
        else if (move === 1) { //Right
            for (let y = 0; y < this.numSquares; y++) {
                for (let x = this.numSquares-1; x >= 0; x--) {
                    if(!(this.board[y][x] === 0)) {
                        this.pack(x, y, move);
                    }
                }
            }
        }
        else if (move === 2) { //Down
            for (let x = 0; x < this.numSquares; x++) {
                for (let y = this.numSquares-1; y >= 0; y--) {
                    if(!(this.board[y][x] === 0)) {
                        this.pack(x, y, move);
                    }   
                }
            }
        }
        else if (move === 3) { //Left
            for (let y = 0; y < this.numSquares; y++) {
                for (let x = 0; x < this.numSquares; x++) {
                    if(!(this.board[y][x] === 0)) {
                        this.pack(x, y, move);
                    }
                }
            }
        }
        else {
            console.log(`Error: invalid move: ${move}`);
        }
        this.redraw();
        this.spawnRandom();

        d = new Date();
        let elapsed = d.getTime() - start;
        console.log(`doMove took ${elapsed} ms`)
    }

    //Merges (a + b) into a
    merge(a, b) {
        //Validate
        let val1 = this.board[a[1]][a[0]];
        let val2 = this.board[b[1]][b[0]];
        if (val1 === val2) {
            this.board[b[1]][b[0]] = val1+val2;
            this.board[a[1]][a[0]] = 0;
        }
    }

    pack(x, y, direction) {
        let curr = [x, y];

        while(true) {
            let next = this.getNext(curr[0], curr[1], direction);
            //Validate indexes
            if(next[0] < 0 || next[0] >= this.numSquares || next[1] < 0 || next[1] >= this.numSquares) {
                return;
            }
            else if(this.board[next[1]][next[0]] == 0) { //It's empty, so move it
                this.board[next[1]][next[0]] = this.board[curr[1]][curr[0]];
                this.board[curr[1]][curr[0]] = 0;
            }
            else if(this.board[curr[1]][curr[0]] === this.board[next[1]][next[0]]) {
                //Next is occupied, try to merge
                this.merge(curr, next);
            }
            curr = next;
        }
    }

    getNext(x, y, direction) {
        switch (direction) {
            case 0:
                return [x, y-1];
            case 1:
                return [x+1, y];
            case 2:
                return [x, y+1];
            case 3:
                return [x-1, y];
        }
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTiles();
        this.drawGrid();
    }

    getEmptySpaces() {
        let empty = [];
        for (let y = 0; y < this.numSquares; y++) {
            for (let x = 0; x < this.numSquares; x++) {
                if(this.board[y][x] === 0) {
                    empty.push([x, y]);
                }
            }
        }
        return empty;
    }

    spawnRandom() {
        let d = new Date();
        let start = d.getTime();

        let emptySpaces = this.getEmptySpaces();
        let rand = emptySpaces[this.getRandomNum(0, emptySpaces.length)];
        this.board[rand[1]][rand[0]] = 2;
        this.redraw();

        d = new Date();
        let elapsed = d.getTime() - start;
        console.log(`spawnRandom() took ${elapsed} ms`);
    }

    getRandomNum(min, max) {
        return Math.floor(Math.random()*(max-min) + min);
    }

}