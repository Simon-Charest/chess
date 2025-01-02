const validateMove = require('./validateMove');

function isCheck(color, board) {
    // Determine the opposing pieces and the king symbol
    const opponentPieces = color === 'white' ? '♟♜♞♝♛♚' : '♙♖♘♗♕♔';
    const king = color === 'white' ? '♔' : '♚';

    // Find the king's position
    let kingPosition = null;
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === king) {
                kingPosition = { row, col };
                
                break;
            }
        }

        if (kingPosition) break;
    }

    if (!kingPosition) {
        throw new Error(`${color} king not found on the board!`);
    }

    // Check if any opponent piece can attack the king
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const piece = board[row][col];
            if (opponentPieces.includes(piece)) {
                // Check if this opponent piece can legally move to the king's position
                if (validateMove(row, col, kingPosition.row, kingPosition.col, board)) {
                    // King is in check
                    return true;
                }
            }
        }
    }

    // King is not in check
    return false;
}

module.exports = isCheck;
