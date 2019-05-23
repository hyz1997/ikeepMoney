/**
 * @Author: chenjie.lu
 * @Date:   2018-02-15T13:57:26+08:00
 * @Email:  chenjie.lu@husor.com
 * @Last modified by:   chenjie.lu
 * @Last modified time: 2018-03-04T11:10:49+08:00
 */
const Koa = require('koa');
const koaBody = require('koa-body');
const serve = require('koa-static');
const router = require('./src/router.js');
const model = require('./src/model.js');
const {
    getParams,
    go,
    goSuccess,
    goError,
    makeId,
    timeMask,
} = require('./src/tools/middleware.js');
const { types } = require('./dataConfig.js');

const PORT = 8080;
const app = new Koa();
const env = process.env.NODE_ENV;
if (env === 'refreshSql') {
    // 更新数据库，正式环境删除
    const id = 'oOgQI0TT8IPdT-R4Kl2hEO3T7XB4';
    const otherUserAvatar = 'https://wx.qlogo.cn/mmopen/vi_32/ZG0tmpOI1yiaAcWqND0lRFdDRic3NWKjI5lMmSs5DDuNzibcGmqMibLlyMq8ibsgtyoJB5Qz8D6Bbsh5fcHOcCM51qQ/132';
    model
        .sync()
        .then(async () => {
            await types.forEach(async (item) => {
                await model.types.create({
                    tid: item.tid,
                    createrId: 1,
                    name: item.name,
                    type: item.type,
                    code: item.code,
                });
            });
            await model.users.create({
                uid: id,
                name: '小红依',
                avatar: 'https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKr8HtokcNroNeJmdrFEggCkskA7O63AU4hEibaiauKlGH7ichIRgJ5Mibu0HJNuQ3DxMZ9DefLqCpT0Q/132',
            });
            const account = await model.accounts.create({
                aid: makeId(id),
                createrId: id,
                accountName: '小红依的测试账本',
                type: 0,
            });
            const inTypes = types.filter(type => type.type === 0);
            const outTypes = types.filter(type => type.type === 1);
            const random = function (from, to) {
                return (Math.random() * (to - from)) + from;
            };
            const randomType = function (balanceType) {
                const type = [inTypes, outTypes][balanceType];
                return type[Math.floor(random(0, type.length - 1))].tid;
            };
            // 2018年12个月每个月200条数据
            for (let i = 0; i < 12; i++) {
                for (let j = 0; j < 200; j++) {
                    const balanceType = Math.floor(Math.random() * 10) % 2 === 0 ? 1 : 0;
                    model.records.create({
                        rid: makeId(account.aid),
                        aid: account.aid,
                        createrId: id,
                        editerId: id,
                        balanceType,
                        tid: randomType(balanceType),
                        amount: random(0, 1000).toFixed(2),
                        time: new Date(2018, i, Math.floor(random(1, 29))),
                        note: '',
                    });
                }
            }
            await model.users.create({
                uid: 1,
                name: '测试用户1',
                avatar: otherUserAvatar,
            });
            await model.users.create({
                uid: 2,
                name: '测试用户2',
                avatar: otherUserAvatar,
            });
        });
}
app
    .use(koaBody({
        multipart: true,
    }))
    .use(serve('./static'))
    .use(async (ctx, next) => {
        ctx.model = model;
        ctx.getParams = getParams.bind(ctx);
        ctx.go = go.bind(ctx);
        ctx.goSuccess = goSuccess.bind(ctx);
        ctx.goError = goError.bind(ctx);
        ctx.makeId = makeId;
        ctx.timeMask = timeMask;
        await next();
    })
    .use(router.routes())
    .use(router.allowedMethods());
app.listen(PORT);

console.log(`Server is listen on Port ${PORT}`);
