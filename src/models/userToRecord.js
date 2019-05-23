/**
 * @Author: chenjie.lu
 * @Date:   2018-02-18T10:08:54+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T15:52:31+08:00
 */
const db = require('../db');
const users = require('./users.js');
const records = require('./records.js');

const userToRecord = db.defineModel('userToRecord', {
    id: db.STRING(16),
});

userToRecord.belongsTo(records, {
    foreignKey: 'rid',
    targetKey: 'rid',
});

userToRecord.belongsTo(users, {
    foreignKey: 'uid',
    targetKey: 'uid',
});

module.exports = userToRecord;
