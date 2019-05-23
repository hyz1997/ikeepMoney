/**
 * @Author: chenjie.lu
 * @Date:   2018-02-18T10:08:54+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T15:52:31+08:00
 */
const db = require('../db');
const { makeId } = require('../tools/middleware.js');

const users = db.defineModel('users', {
    id: db.STRING(16),
    uid: {
        type: db.STRING(32),
        unique: true,
        primaryKey: true,
    },
    name: {
        type: db.STRING(16),
        allowNull: false,
    },
    avatar: {
        type: db.STRING,
        allowNull: false,
    },
});
// hook是生命周期
users.addHook('afterCreate', async (user) => {
    const accounts = require('./accounts.js');
    const userToTypes = require('./userToTypes.js');
    const types = require('./types.js');
    await accounts.create({
        aid: makeId(user.uid),
        createrId: user.uid,
        accountName: `${user.name}的默认账单`,
        type: 0,
    });
    const willAddTypes = await types.findAll({
        where: {
            createrId: 1,
        },
    });
    await willAddTypes.forEach(async (type) => {
        await userToTypes.create({
            tid: type.tid,
            uid: user.uid,
        });
    });
});

module.exports = users;
