/**
 * @Author: chenjie.lu
 * @Date:   2018-02-15T15:04:45+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-17T09:23:33+08:00
 */

const Router = require('koa-router');
const fs = require('fs');

const router = new Router();
const files = fs.readdirSync(`${__dirname}/router`);
const jsFiles = files.filter(f => f.endsWith('.js'), files);

for (let i = jsFiles.length; i--;) {
    const f = jsFiles[i];
    router.use('', require(`${__dirname}/router/${f}`).routes());
}

module.exports = router;
