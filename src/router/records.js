// base on /records
const Router = require('koa-router');
const sequelize = require('sequelize');

const router = new Router({
    prefix: '/records',
});
module.exports = router
    // 获取全部账单列表
    .get('/:uid/:aid', async (ctx, next) => {
        const {
            aid,
            uid,
            fromDate,
            endDate,
        } = ctx.getParams(['aid', 'uid']);
        const {
            limit = 10,
            page = 1,
        } = ctx.getParams();
        const canWrite = await ctx.model.userToAccount.findOne({
            where: {
                uid,
                aid,
                isDelete: false,
            },
        });
        if (!canWrite) {
            ctx.goError({
                message: '无权限！',
            });
            await next();
            return;
        }
        const recordsList = await ctx.model.records.findAll({
            offset: (page - 1) * limit,
            limit: +limit,
            where: {
                aid,
                time: {
                    [sequelize.Op.between]: [fromDate, endDate],
                },
            },
            include: [
                {
                    model: ctx.model.types,
                }, {
                    model: ctx.model.users,
                    as: 'creater',
                }, {
                    model: ctx.model.users,
                    as: 'editer',
                },
            ],
            order: [
                ['time', 'DESC'],
                ['updatedAt', 'DESC'],
            ],
        });
        ctx.goSuccess({
            data: {
                length: recordsList.length,
                page,
                data: recordsList,
            },
        });
        await next();
    });
