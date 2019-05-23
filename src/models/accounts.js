/**
 * @Author: chenjie.lu
 * @Date:   2018-02-18T10:08:54+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T15:52:31+08:00
 */
const db = require('../db');
const users = require('./users.js');

const accounts = db.defineModel('accounts', {
    id: db.STRING(16),
    aid: {
        type: db.STRING(16),
        unique: true,
        primaryKey: true,
    },
    accountName: {
        type: db.STRING(16),
        allowNull: false,
    },
    // 0 - 普通 1 - AA
    type: {
        type: db.FLOAT,
        allowNull: true,
    },
});

accounts.belongsTo(users, {
    foreignKey: 'createrId',
    targetKey: 'uid',
});

accounts.addHook('afterCreate', (account) => {
    const userToAccount = require('./userToAccount.js');
    userToAccount.create({
        aid: account.aid,
        uid: account.createrId,
        isDefault: true,
        access: 0,
    });
});

module.exports = accounts;
