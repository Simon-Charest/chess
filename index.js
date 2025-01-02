const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const isCheck = require('./src/isCheck');
const isCheckmate = require('./src/isCheckmate');
const isPieceOwned = require('./src/isPieceOwned');
const isSelfCapturing = require('./src/isSelfCapturing');
const movePiece = require('./src/movePiece');
const pathExists = require('./src/pathExists');
const readJsonFile = require('./src/readJsonFile');
const refresh = require('./src/refresh');
const switchPlayer = require('./src/switchPlayer');
const validateMove = require('./src/validateMove');
const writeJsonFile = require('./src/writeJsonFile');

async function main() {
    const initPath = path.join(__dirname, 'data', 'init.json')
    const gamePath = path.join(__dirname, 'data', 'game.json')

    // Read game data
    let game;
    
    if (await pathExists(gamePath)) {
        game = await readJsonFile(gamePath);
    }

    else {
        game = await readJsonFile(initPath);
    }
    
    // Initialize Express app
    const app = express();
    const hostname = '0.0.0.0';
    const port = process.env.PORT || 3000;

    // Serve static files
    app.use('/public', express.static(path.join(__dirname, 'public')));

    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));    

    // Route to render the main page
    app.get('/', async (req, res) => {
        res.render('chess', {
            game
        });
    });

    app.get('/move', async (req, res) => {
        // Receive move from client
        const move = {
            from: { row: parseInt(req.query.fromRow, 10), col: parseInt(req.query.fromCol, 10) },
            to: { row: parseInt(req.query.toRow, 10), col: parseInt(req.query.toCol, 10) }
        };
    
        // Debug
        console.log(JSON.stringify(move));

        if (
            // Ensure the piece belongs to the current player
            isPieceOwned(game, move) &&
            
            // Prevent capturing own pieces
            !isSelfCapturing(game, move) &&
            
            validateMove(move.from.row, move.from.col, move.to.row, move.to.col, game['board'])
        ) {
            // Process the move using the received integers
            movePiece(game, move);

            // Check if the move leaves the player in check
            if (!isCheck(game['color'], game['board'])) {
                // Switch player
                switchPlayer(game);

                // Check if player in check
                game['check'] = isCheck(game['color'], game['board']);

                // Save updated game data to file
                writeJsonFile(game, gamePath);
            }
        }

        // @TODO: Fix this
        //game['checkmate'] = isCheckmate(game['color'], game);

        refresh(wss, res);
    });

    const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');
    });

    wss.on('close', () => {
        console.log('WebSocket connection closed');
    });
    
    // Start HTTP server
    http.createServer(app).listen(port, hostname, () => {
        console.log(`HTTP Server running at http://${hostname}:${port}/`);
    });
}

main();
