const express = require('express');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');

const initPath = path.join(__dirname, 'data', 'init.json')
const dataPath = path.join(__dirname, 'data', 'data.json')

async function main() {
    // Read game data
    let data;
    
    if (await pathExists(dataPath)) {
        data = await readJsonFile(dataPath);
    }

    else {
        data = await readJsonFile(initPath);
    }
    
    // Initialize Express app
    const app = express();
    const hostname = '0.0.0.0';
    const port = process.env.PORT || 3000;

    // Serve static files
    app.use('/public', express.static(path.join(__dirname, 'public')));

    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));    

    // Route to render the main page
    app.get('/', async (req, res) => {
        res.render('chess', {
            data
        });
    });

    app.get('/move', async (req, res) => {
        // Receive move from client
        const move = {
            from: {
                row: parseInt(req.query.fromRow, 10),
                col: parseInt(req.query.fromCol, 10)
            },
            to: {
                row: parseInt(req.query.toRow, 10),
                col: parseInt(req.query.toCol, 10)
            }
        };
    
        // Debug
        console.log(JSON.stringify(move));

        // Process the move using the received integers
        data[move.to.row][move.to.col] = data[move.from.row][move.from.col];
        data[move.from.row][move.from.col] = "";

        // Save updated board to file
        writeFormattedJsonFile(data);
    });
    
    // Start HTTP server
    http.createServer(app).listen(port, hostname, () => {
        console.log(`HTTP Server running at http://${hostname}:${port}/`);
    });
}

const pathExists = async (path) =>
    fs.access(path)
        .then(() => true)
        .catch(() => false);

async function readJsonFile(path, encoding = 'utf8') {
    const text = await fs.readFile(path, encoding);
    const jsonObject = JSON.parse(text);

    return jsonObject;
}

async function writeJsonFile(value, path, encoding = 'utf8', space = 2) {
    const jsonString = JSON.stringify(value, null, space);
    await fs.writeFile(path, jsonString, encoding);
}

const writeFormattedJsonFile = (value, path = dataPath, encoding = 'utf8') => {
    const jsonString = '[\n' + value.map(row => {
        return '\t[' + row.map(cell => `"${cell}"`).join(', ') + ']';
    }).join(',\n') + '\n]';
    fs.writeFile(path, jsonString, encoding);
}

function validateMove(piece, fromRow, fromCol, toRow, toCol, board) {
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;

    switch (piece) {
        // White Pawn
        case '♙':
            if (deltaRow === -1 && deltaCol === 0 && !board[toRow][toCol]) {
                return true;
            }

            if (deltaRow === -1 && Math.abs(deltaCol) === 1 && board[toRow][toCol]) {
                return true;
            }

            break;

        // Black Pawn
        case '♟':
            // Pawns move forward, capture diagonally
            if (deltaRow === 1 && deltaCol === 0 && !board[toRow][toCol]) {
                // Move forward
                return true;
            }

            if (deltaRow === 1 && Math.abs(deltaCol) === 1 && board[toRow][toCol]) {
                // Capture diagonally
                return true;
            }

            break;

        // Rook
        case '♖': 
        case '♜':
            if (deltaRow === 0 || deltaCol === 0) {
                return checkPathClear(fromRow, fromCol, toRow, toCol, board);
            }

            break;

        // Knight
        case '♘':
        case '♞':
            if ((Math.abs(deltaRow) === 2 && Math.abs(deltaCol) === 1) ||
                (Math.abs(deltaRow) === 1 && Math.abs(deltaCol) === 2)) {
                return true;
            }

            break;

        // Bishop
        case '♗':
        case '♝':
            if (Math.abs(deltaRow) === Math.abs(deltaCol)) {
                return checkPathClear(fromRow, fromCol, toRow, toCol, board);
            }

            break;

        // Queen
        case '♕':
        case '♛':
            if (Math.abs(deltaRow) === Math.abs(deltaCol) || deltaRow === 0 || deltaCol === 0) {
                return checkPathClear(fromRow, fromCol, toRow, toCol, board);
            }

            break;

        // King
        case '♔':
        case '♚':
            if (Math.abs(deltaRow) <= 1 && Math.abs(deltaCol) <= 1) {
                return true;
            }

            break;
    }

    return false;
}

function checkPathClear(fromRow, fromCol, toRow, toCol, board) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol]) {
            // Path is blocked
            return false;
        }

        currentRow += rowStep;
        currentCol += colStep;
    }

    return true;
}

main();
