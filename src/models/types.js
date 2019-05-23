/**
 * @Author: chenjie.lu
 * @Date:   2018-05-05T10:08:54+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T15:52:31+08:00
 */
const db = require('../db');
const users = require('./users.js');

const types = db.defineModel('types', {
    id: db.STRING(16),
    tid: {
        type: db.STRING(16),
        unique: true,
        primaryKey: true,
    },
    name: {
        type: db.STRING(16),
        unique: false,
    },
    code: {
        type: db.STRING,
        unique: false,
    },
    type: {
        type: db.INTEGER,
        allowNull: false,
    },
});

users.hasMany(types, {
    foreignKey: 'createrId',
    targetKey: 'uid',
});

types.addHook('afterCreate', async (type) => {
    const userToTypes = require('./userToTypes.js');
    await userToTypes.create({
        uid: type.createrId,
        tid: type.tid,
    });
});

module.exports = types;
