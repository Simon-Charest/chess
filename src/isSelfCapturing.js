function isSelfCapturing(game, move) {
    return (game['color'] === 'white' && game['white'].includes(game['board'][move.to.row][move.to.col])) ||
        (game['color'] === 'black' && game['black'].includes(game['board'][move.to.row][move.to.col]));
}

module.exports = isSelfCapturing;
