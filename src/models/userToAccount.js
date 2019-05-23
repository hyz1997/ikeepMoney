/**
 * @Author: chenjie.lu
 * @Date:   2018-02-18T10:08:54+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T15:52:31+08:00
 */
const db = require('../db');
const users = require('./users.js');
const accounts = require('./accounts.js');

const userToAccount = db.defineModel('userToAccount', {
    id: db.STRING(16),
    isDefault: {
        type: db.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isDelete: {
        type: db.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // 0 - 拥有者 1 - 管理员 2 - 可写 3 - 可读
    access: {
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    source: {
        type: db.STRING,
        allowNull: true,
    },
});

userToAccount.belongsTo(accounts, {
    foreignKey: 'aid',
    targetKey: 'aid',
});

userToAccount.belongsTo(users, {
    foreignKey: 'uid',
    targetKey: 'uid',
});

module.exports = userToAccount;
