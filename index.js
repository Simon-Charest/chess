const express = require('express');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

async function main() {
    const initPath = path.join(__dirname, 'data', 'init.json')
    const gamePath = path.join(__dirname, 'data', 'game.json')

    // Read game data
    let game;
    
    if (await pathExists(gamePath)) {
        game = await readJsonFile(gamePath);
    }

    else {
        game = await readJsonFile(initPath);
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
            game
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

        if (
            // Check if the piece belongs to the current turn's color
            (
                (game['color'] === 'white' && game['white'].includes(game['board'][move.from.row][move.from.col])) ||
                (game['color'] === 'black' && game['black'].includes(game['board'][move.from.row][move.from.col]))
            ) &&
            // Check if the target tile contains a piece of the same color
            (
                (game['color'] === 'white' && !game['white'].includes(game['board'][move.to.row][move.to.col])) ||
                (game['color'] === 'black' && !game['black'].includes(game['board'][move.to.row][move.to.col]))
            ) &&
            validateMove(move.from.row, move.from.col, move.to.row, move.to.col, game['board'])
        ) {
            // Process the move using the received integers
            game['board'][move.to.row][move.to.col] = game['board'][move.from.row][move.from.col];
            game['board'][move.from.row][move.from.col] = "";

            if (game['color'] == 'white') { 
                game['color'] = "black";
            }

            else {
                game['color'] = "white";
            }
        
            // Save updated game data to file
            writeJsonFile(game, gamePath);
        }

        // Broadcast refresh signal to all WebSocket clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('refresh');
            }
        });

        // Respond to the client
        res.sendStatus(200);
    });

    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');
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

function validateMove(fromRow, fromCol, toRow, toCol, board) {
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;
    const piece = board[fromRow][fromCol];

    switch (piece) {
        // White Pawn
        case '♙':
            // Single move forward
            if (deltaRow === -1 && deltaCol === 0 && !board[toRow][toCol]) {
                return true;
            }
    
            // Double move forward on the first move
            if (fromRow === 6 && deltaRow === -2 && deltaCol === 0 && !board[toRow][toCol] && !board[toRow + 1][toCol]) {
                return true;
            }
    
            // Capture diagonally
            if (deltaRow === -1 && Math.abs(deltaCol) === 1 && board[toRow][toCol]) {
                return true;
            }
    
            break;
    
        // Black Pawn
        case '♟':
            // Single move forward
            if (deltaRow === 1 && deltaCol === 0 && !board[toRow][toCol]) {
                return true;
            }
    
            // Double move forward on the first move
            if (fromRow === 1 && deltaRow === 2 && deltaCol === 0 && !board[toRow][toCol] && !board[toRow - 1][toCol]) {
                return true;
            }
    
            // Capture diagonally
            if (deltaRow === 1 && Math.abs(deltaCol) === 1 && board[toRow][toCol]) {
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
