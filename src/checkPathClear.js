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

module.exports = checkPathClear;
