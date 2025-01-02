const fs = require('fs/promises');

const pathExists = async (path) =>
    fs.access(path)
        .then(() => true)
        .catch(() => false);

module.exports = pathExists;
