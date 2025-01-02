const isCheck = require('./isCheck');
const simulateMove = require('./simulateMove');
const validateMove = require('./validateMove');

function isCheckmate(color, game) {
    const board = game["board"];

    // Check if the player is in check
    if (!isCheck(color, board)) {
        return false; // Player is not in check, so not checkmate
    }

    // Iterate over all pieces of the player's color
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const piece = board[row][col];
            
            // Skip pieces of the opponent's color or empty squares
            if ((color === "white" && !game.white.includes(piece)) || 
                (color === "black" && !game.black.includes(piece))) {
                continue;
            }

            // Generate all possible moves for this piece
            for (let toRow = 0; toRow < board.length; toRow++) {
                for (let toCol = 0; toCol < board[toRow].length; toCol++) {
                    // Skip invalid moves
                    if (!validateMove(row, col, toRow, toCol, board)) {
                        continue;
                    }

                    // Simulate the move
                    const simulatedBoard = simulateMove(board, row, col, toRow, toCol);

                    // Check if the king is still in check after the move
                    if (!isCheck(color, simulatedBoard)) {
                        return false; // At least one move removes the check
                    }
                }
            }
        }
    }

    // No valid moves to escape check, it's checkmate
    return true;
}

module.exports = isCheckmate;
