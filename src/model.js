/**
 * @Author: chenjie.lu
 * @Date:   2018-02-18T15:49:06+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T16:00:29+08:00
 */
const fs = require('fs');
const db = require('./db');

const files = fs.readdirSync(`${__dirname}/models`);

const jsFiles = files.filter(f => f.endsWith('.js'), files);

module.exports = {};
for (let i = jsFiles.length; i--;) {
    const f = jsFiles[i];
    const name = f.substring(0, f.length - 3);
    module.exports[name] = require(`${__dirname}/models/${f}`);
}

module.exports.sync = () => db.sync();
