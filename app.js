
window.onload = () => {
    //Canvas stuff
    let c = document.getElementById("board");

    let game = new Game(300, 4, c);
    game.drawGrid();
    game.initializeBoard();
    game.drawTiles();

    window.addEventListener("keydown", function (e) {
        console.log("keypressed");
        const controlKeys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];

        if (controlKeys.includes(e.key)) {
            let index = controlKeys.indexOf(e.key);
            //Execute the move
            game.doMove(index);
        }
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
        []];
    }

    initializeBoard() {
        this.ctx.font = "30px Arial";

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

    drawGrid() {
        let squareSize = this.size / this.numSquares;
        for (let i = 1; i < this.numSquares; i++) {
            //Vertical lines
            this.ctx.moveTo(0, squareSize * i);
            this.ctx.lineTo(this.size, squareSize * i);
            this.ctx.stroke();
            //Horizontal lines
            this.ctx.moveTo(squareSize * i, 0);
            this.ctx.lineTo(squareSize * i, this.size);
            this.ctx.stroke();
        }
    }

    drawTiles() {
        let squareSize = this.size / this.numSquares;
        let midpoint = squareSize / 2;
        for (let y = 0; y < this.numSquares; y++) {
            for (let x = 0; x < this.numSquares; x++) {
                this.ctx.fillText(this.board[y][x], midpoint + x * squareSize,
                    midpoint + y * squareSize);
            }
        }
    }

    doMove(move) {
        console.log(`doing move: ${move}`)
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
            
        }
        else if (move === 2) { //Down

        }
        else if (move === 3) { //Left

        }
        else {
            console.log(`Error: invalid move: ${move}`);
        }
        this.redraw();
        this.spawnRandom();
    }

    //Merges a and b into a
    merge(a, b) {
        if (this.board[by][bx] === 0) {
            return; //Nothing to merge, move on
        }
        else {

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
                break;
            case 1:
                return [x+1, y];
                break;
            case 2:
                return [x, y+1];
                break;
            case 3:
                return [x-1, y];
                break;
        }
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawTiles();
    }

    spawnRandom(value) {

    }

}