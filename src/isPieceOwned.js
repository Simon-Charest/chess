function isPieceOwned(game, move) {
    return (game['color'] === 'white' && game['white'].includes(game['board'][move.from.row][move.from.col])) ||
        (game['color'] === 'black' && game['black'].includes(game['board'][move.from.row][move.from.col]));
}

module.exports = isPieceOwned;
