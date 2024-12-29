const express = require('express');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');

async function main() {
    // Read configuration
    const config = JSON.parse(await fs.readFile(path.join(__dirname, 'config.json'), 'utf8'));
    
    // Initialize Express app
    const app = express();
    const hostname = '0.0.0.0';
    const port = process.env.PORT || 3000;

    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Route to render the main page
    app.get('/', async (req, res) => {
        res.render('chess', {
            initialBoard: config.initialBoard,
            validateMove,
            checkPathClear
        });
    });

    // Start HTTP server
    http.createServer(app).listen(port, hostname, () => {
        console.log(`HTTP Server running at http://${hostname}:${port}/`);
    });
}

function validateMove(piece, fromRow, fromCol, toRow, toCol, board) {
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;

    switch (piece) {
        case '\u265F': // Black Pawn ♟
            // Pawns move forward, capture diagonally
            if (deltaRow === 1 && deltaCol === 0 && !board[toRow][toCol]) {
                return true; // Move forward
            }

            if (deltaRow === 1 && Math.abs(deltaCol) === 1 && board[toRow][toCol]) {
                return true; // Capture diagonally
            }

            break;

        case '\u2659': // White Pawn ♙
            if (deltaRow === -1 && deltaCol === 0 && !board[toRow][toCol]) {
                return true;
            }

            if (deltaRow === -1 && Math.abs(deltaCol) === 1 && board[toRow][toCol]) {
                return true;
            }

            break;

        case '\u265C': // Black Rook ♜
        case '\u2656': // White Rook ♖
            if (deltaRow === 0 || deltaCol === 0) {
                return checkPathClear(fromRow, fromCol, toRow, toCol, board);
            }

            break;

        case '\u265E': // Black Knight ♞
        case '\u2658': // White Knight ♘
            if ((Math.abs(deltaRow) === 2 && Math.abs(deltaCol) === 1) ||
                (Math.abs(deltaRow) === 1 && Math.abs(deltaCol) === 2)) {
                return true;
            }

            break;

        case '\u265D': // Black Bishop ♝
        case '\u2657': // White Bishop ♗
            if (Math.abs(deltaRow) === Math.abs(deltaCol)) {
                return checkPathClear(fromRow, fromCol, toRow, toCol, board);
            }

            break;

        case '\u265B': // Black Queen ♛
        case '\u2655': // White Queen ♕
            if (Math.abs(deltaRow) === Math.abs(deltaCol) || deltaRow === 0 || deltaCol === 0) {
                return checkPathClear(fromRow, fromCol, toRow, toCol, board);
            }

            break;

        case '\u265A': // Black King ♚
        case '\u2654': // White King ♔
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
