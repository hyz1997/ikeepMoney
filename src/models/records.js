/**
 * @Author: chenjie.lu
 * @Date:   2018-04-16T10:08:54+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-02-18T15:52:31+08:00
 */
const db = require('../db');
const users = require('./users.js');
const accounts = require('./accounts.js');
const types = require('./types.js');

const records = db.defineModel('records', {
    id: db.STRING(16),
    rid: {
        type: db.STRING(16),
        unique: true,
        primaryKey: true,
    },
    time: {
        type: db.DATEONLY,
        allowNull: false,
    },
    amount: {
        type: db.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    // 0 收入 1 支出
    balanceType: {
        type: db.INTEGER,
        allowNull: false,
    },
    tid: {
        type: db.INTEGER,
        allowNull: false,
    },
    note: {
        type: db.STRING,
        allowNull: true,
        defaultValue: '',
    },
    isDelete: {
        type: db.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    circleTime: {
        type: db.STRING(16),
        allowNull: false,
        defaultValue: '',
    },
    circleType: {
        type: db.STRING(16),
        allowNull: false,
        defaultValue: '',
    },
});

records.belongsTo(types, {
    foreignKey: 'tid',
    targetKey: 'tid',
});

records.belongsTo(users, {
    foreignKey: 'createrId',
    targetKey: 'uid',
    as: 'creater',
});

records.belongsTo(users, {
    foreignKey: 'editerId',
    targetKey: 'uid',
    as: 'editer',
});

accounts.hasMany(records, {
    foreignKey: 'aid',
    targetKey: 'aid',
});

module.exports = records;
