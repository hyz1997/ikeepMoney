// base on /type
const Router = require('koa-router');

const router = new Router({
    prefix: '/type',
});
module.exports = router
    // 获取记录具体信息
    .get('/:tid', async (ctx, next) => {
        const { tid } = ctx.getParams(['tid']);
        if (!tid) {
            await next();
            return;
        }
        const typeList = await ctx.model.types.findAll({
            where: {
                tid,
            },
        });
        ctx.goSuccess({
            data: typeList,
        });
        await next();
    })
    // 创建一条记录
    .post('/:uid', async (ctx, next) => {
        const {
            name,
            uid,
            code,
            type,
        } = ctx.getParams(['name', 'uid', 'code', 'type']);
        if (!name || !uid || !code || type === undefined) {
            await next();
            return;
        }
        await ctx.model.types.create({
            tid: ctx.makeId(uid),
            createrId: uid,
            code,
            type,
            name,
        });
        ctx.goSuccess({
            data: 'success',
        });
        await next();
    })
    // 修改记录具体信息
    .put('/:tid', async (ctx, next) => {
        const {
            tid,
            name,
            code,
        } = ctx.getParams(['tid', 'name', 'code']);
        const typeList = await ctx.model.types.update({
            name,
            code,
        }, {
            where: {
                tid,
            },
        });
        ctx.goSuccess({
            data: typeList,
        });
        await next();
    })
    // 删除一条记录
    .del('/:uid/:tid', async (ctx, next) => {
        const {
            tid,
            uid,
        } = ctx.getParams(['uid', 'tid']);
        ctx.model.records.destroy({
            where: {
                tid,
                uid,
            },
        });
        ctx.goSuccess({
            data: 'success',
        });
        await next();
    });
