const fs = require('fs/promises');

async function writeJsonFile(value, path, encoding = 'utf8', space = 2) {
    const jsonString = JSON.stringify(value, null, space);
    await fs.writeFile(path, jsonString, encoding);
}

module.exports = writeJsonFile;
