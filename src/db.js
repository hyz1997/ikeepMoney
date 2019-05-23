/**
 * 这个js的作用是提供了一个创建表的公用函数
*/
const Sequelize = require('sequelize');
const uuid = require('node-uuid');
const config = require('../config');
// id的生成规则
function generateId() {
    return uuid.v4().toString(16).slice(0, 12);
}
// 连接到数据库
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect || 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
});
// 定义id类型
const ID_TYPE = Sequelize.STRING(32);
// 定义表结构
function defineModel(name, attributes) {
    const attrs = {};
    Object.keys(attributes).forEach((key) => {
        const value = attributes[key];
        if (typeof value === 'object' && value.type) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false,
            };
        }
    });
    // 下面几项是每个表的默认项
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true,
    };
    attrs.createdAt = {
        type: Sequelize.DATE,
        allowNull: false,
    };
    attrs.updatedAt = {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false,
    };
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate(obj) {
                const now = new Date();
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId();
                    }
                    obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
                } else {
                    obj.updatedAt = now;
                    obj.version++;
                }
            },
        },
    });
}

const TYPES = ['STRING', 'INTEGER', 'FLOAT', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN', 'DATE', 'DATEONLY'];

const exp = {
    defineModel,
    sync: () => {
        // 是否在生产环境，不知道为什么要判断
        if (process.env.NODE_ENV !== 'production') {
            return sequelize.sync({ force: true });
        }
        throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
    },
};

TYPES.forEach((type) => {
    exp[type] = Sequelize[type];
});

exp.ID = ID_TYPE;
exp.generateId = generateId;

module.exports = exp;
