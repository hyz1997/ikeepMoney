const isFieldNotExist = function (data = [], mustExistField = []) {
    const emptyKey = [];
    mustExistField.forEach((field) => {
        if (data[field] === undefined) {
            emptyKey.push(field);
        }
    });
    return emptyKey;
};

// this指针绑定为ctx
const go = function (content) {
    const body = JSON.parse(this.body || '{}');
    if (body.success === false) {
        return false;
    }
    this.body = JSON.stringify(content);
    return true;
};

// 返回成功
const goSuccess = function (content = {}) {
    const goContent = content;
    goContent.success = true;
    go.call(this, goContent);
    return true;
};

// 返回失败
const goError = function (content = {}) {
    const goContent = content;
    goContent.success = false;
    go.call(this, goContent);
    return true;
};

const dayMask = function (days, cb) {
    const time = days * 86400000;
    setTimeout(() => {
        cb();
    }, time);
};

const monthMask = function (months, cb) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const time = new Date(year, month + months, day, 0, 0, 0) - now;
    setTimeout(() => {
        monthMask(months, cb);
        cb();
    }, time);
};

const yearMask = function (years, cb) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const time = new Date(year + years, month, day, 0, 0, 0) - now;
    setTimeout(() => {
        monthMask(years, cb);
        cb();
    }, time);
};

// 定时任务
const timeMask = function (type, time, cb) {
    switch (type.toStirng()) {
    case '0':
        yearMask(time, cb);
        break;
    case '1':
        monthMask(time, cb);
        break;
    case '2':
        dayMask(time, cb);
        break;
    default:
    }
};

// 获取传递的参数
const getParams = function (mustExistField = []) {
    const ctx = this;
    let params = {};
    switch (ctx.method.toLowerCase()) {
    case 'get':
        params = ctx.query;
        break;
    case 'post':
        params = ctx.request.body;
        break;
    case 'put':
        params = ctx.request.body;
        break;
    case 'delete':
        params = ctx.request.body;
        break;
    default:
        params = {};
    }
    Object.assign(params, ctx.params);
    const emptyKeys = isFieldNotExist(params, mustExistField);
    if (emptyKeys.length) {
        goError.call(this, {
            content: `参数${JSON.stringify(emptyKeys)}错误！不可为空！`,
        });
        return false;
    }
    return params;
};

const makeId = function (baseId = '') {
    return `${Math.floor((+new Date()) * Math.random())}${baseId}`.toString(16).slice(0, 8);
};

module.exports = {
    go,
    goSuccess,
    goError,
    getParams,
    makeId,
    timeMask,
};
