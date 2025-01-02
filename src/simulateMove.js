function simulateMove(board, fromRow, fromCol, toRow, toCol) {
    // Deep copy the board
    const newBoard = board.map(row => [...row]);

    // Move the piece
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    
    // Clear the original square
    newBoard[fromRow][fromCol] = "";
    
    return newBoard;
}

module.exports = simulateMove;
