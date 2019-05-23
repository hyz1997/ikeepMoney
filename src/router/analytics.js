// base on /analytics
const Router = require('koa-router');
const sequelize = require('sequelize');

const { Op } = sequelize;
const router = new Router({
    prefix: '/analytics',
});
module.exports = router
    // 获取全部账单列表，没有则创建默认账单，取全部账单
    .get('/types/:aid', async (ctx, next) => {
        const {
            aid,
            fromDate,
            endDate,
        } = ctx.getParams(['aid', 'fromDate', 'endDate']);
        if (!aid) {
            await next();
            return;
        }
        const recordsCount = await ctx.model.records.findAll({
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('rid')), 'ridCount'],
                    [sequelize.fn('sum', sequelize.col('amount')), 'amountSum'],
                ],
            },
            where: {
                aid,
                time: {
                    [Op.between]: [fromDate, endDate],
                },
            },
            group: 'tid',
            include: [
                {
                    model: ctx.model.types,
                },
            ],
        });
        ctx.goSuccess({
            data: recordsCount,
        });
        await next();
    })
    .get('/times/:aid', async (ctx, next) => {
        const {
            aid,
            date,
        } = ctx.getParams(['aid', 'date']);
        if (!aid) {
            await next();
            return;
        }
        const recordsCount = await ctx.model.records.findAll({
            attributes: {
                include: [
                    [sequelize.fn('sum', sequelize.col('amount')), 'amountSum'],
                ],
            },
            where: {
                aid,
                time: {
                    [Op.between]: [`${date}-1-1`, `${date}-12-31`],
                },
            },
            group: ['balanceType', 'time'],
            include: [
                {
                    model: ctx.model.types,
                },
            ],
        });
        ctx.goSuccess({
            data: recordsCount,
        });
        await next();
    });
