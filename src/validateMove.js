const checkPathClear = require('./checkPathClear');

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

module.exports = validateMove;
