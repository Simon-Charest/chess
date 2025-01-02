const fs = require('fs/promises');

async function readJsonFile(path, encoding = 'utf8') {
    const text = await fs.readFile(path, encoding);
    const jsonObject = JSON.parse(text);

    return jsonObject;
}

module.exports = readJsonFile;
