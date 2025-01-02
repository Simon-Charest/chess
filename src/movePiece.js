function movePiece(game, move) {
    game['board'][move.to.row][move.to.col] = game['board'][move.from.row][move.from.col];
    game['board'][move.from.row][move.from.col] = "";
}

module.exports = movePiece;
