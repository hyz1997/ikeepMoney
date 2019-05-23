/**
 * @Author: chenjie.lu
 * @Date:   2018-02-18T10:08:54+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T15:52:31+08:00
 */
const db = require('../db');
const users = require('./users.js');
const types = require('./types.js');

const userToTypes = db.defineModel('userToTypes', {
    id: db.STRING(16),
});

userToTypes.belongsTo(types, {
    foreignKey: 'tid',
    targetKey: 'tid',
});

users.hasMany(userToTypes, {
    foreignKey: 'uid',
    targetKey: 'uid',
});

module.exports = userToTypes;
