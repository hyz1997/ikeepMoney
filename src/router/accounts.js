// base on /accounts
const Router = require('koa-router');
const sequelize = require('sequelize');

const Op = sequelize.Op;
const router = new Router({
    prefix: '/accounts',
});

module.exports = router
    .get('/users/:aid', async (ctx, next) => {
        const {
            aid,
            uid,
        } = ctx.getParams(['uid', 'aid']);
        if (!aid || !uid) {
            await next();
            return;
        }
        const users = await ctx.model.userToAccount.findAll({
            where: {
                aid,
            },
            include: [
                {
                    model: ctx.model.users,
                },
            ],
        });
        ctx.goSuccess({
            data: users,
        });
        await next();
    })
    // 获取全部账单列表，没有则创建默认账单，取全部账单
    .get('/:uid', async (ctx, next) => {
        const { uid } = ctx.getParams(['uid']);
        const accountsList = await ctx.model.userToAccount.findAll({
            where: {
                uid,
                isDelete: false,
            },
            include: [
                {
                    model: ctx.model.accounts,
                },
            ],
        });
        if (accountsList.length === 0) {
            const userInfo = await ctx.model.users.findOne({
                where: {
                    uid,
                },
            });
            const account = await ctx.model.accounts.create({
                aid: ctx.makeId(uid),
                createrId: uid,
                accountName: `${userInfo.name}的默认账单`,
                type: 1,
            });
            accountsList.push(account);
        }
        const aids = accountsList.map(account => account.aid);
        const memberCount = {};
        const recordCount = {};
        await ctx.model.userToAccount.count({
            group: 'aid',
            attributes: ['aid'],
            where: {
                aid: {
                    [Op.or]: aids,
                },
            },
        }).then((res) => {
            res.forEach((count) => {
                memberCount[count.aid] = count.count;
            });
        });
        await ctx.model.records.count({
            group: 'aid',
            attributes: ['aid'],
            where: {
                aid: {
                    [Op.or]: aids,
                },
            },
        }).then((res) => {
            res.forEach((count) => {
                recordCount[count.aid] = count.count;
            });
        });
        ctx.goSuccess({
            data: accountsList,
            memberCount,
            recordCount,
        });
        await next();
    })
    .post('/:uid', async (ctx, next) => {
        const {
            uid,
            source,
        } = ctx.getParams(['uid', 'source']);
        if (!uid || !source) {
            await next();
            return;
        }
        const querys = source.split(',');
        const aid = querys[1];
        const access = querys[2];
        const hasSource = await ctx.model.userToAccount.findOne({
            where: {
                source,
            },
        });
        if (hasSource) {
            ctx.goError({
                data: '一个链接仅可注册一个用户！',
            });
            await next();
            return;
        }
        const hasIn = await ctx.model.userToAccount.findOne({
            where: {
                aid,
                uid,
            },
        });
        if (!hasIn) {
            await ctx.model.userToAccount.create({
                isDefault: false,
                access,
                source,
                uid,
                aid,
            });
        } else {
            await ctx.model.userToAccount.update({
                access,
                source,
            }, {
                where: {
                    uid,
                    aid,
                },
            });
        }
        ctx.goSuccess({
            data: {
                aid,
            },
        });
        await next();
    });
