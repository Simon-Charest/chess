function switchPlayer(game) {
    if (game['color'] == 'white') { 
        game['color'] = "black";
    }

    else {
        game['color'] = "white";
    }
}

module.exports = switchPlayer;
