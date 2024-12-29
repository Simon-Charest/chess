const express = require('express');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function main() {
    // Read configuration
    const config = JSON.parse(await fs.readFile(path.join(__dirname, 'config.json'), 'utf8'));
    
    // Initialize database connection
    const db = new sqlite3.Database(path.join(__dirname, 'chess.db'));    
    
    // Initialize Express app
    const app = express();
    const hostname = '0.0.0.0';
    const port = process.env.PORT || 3000;

    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Route to render the main page
    app.get('/', async (req, res) => {
        res.render('chess', { initialBoard: config.initialBoard });
    });

    // Start HTTP server
    http.createServer(app).listen(port, hostname, () => {
        console.log(`HTTP Server running at http://${hostname}:${port}/`);
    });

    // Clean up database connection
    db.close();
}

main();
