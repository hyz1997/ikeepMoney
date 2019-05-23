// base on /account
const Router = require('koa-router');
const sequelize = require('sequelize');

const router = new Router({
    prefix: '/account',
});

const getAccountDetail = async function (ctx, aid, uid, fromDate, endDate) {
    const where = aid.toString() !== '0' ? {
        aid,
        uid,
    } : {
        uid,
        isDefault: true,
    };
    const userToAccount = await ctx.model.userToAccount.findOne({
        where,
        order: [
            ['createdAt', 'DESC'],
        ],
    });
    const accountDetail = await ctx.model.accounts.findOne({
        where: {
            aid: userToAccount.aid,
        },
        include: [
            {
                model: ctx.model.users,
            },
        ],
    });
    const income = await ctx.model.records.sum('amount', {
        where: {
            aid: userToAccount.aid,
            balanceType: 0,
            time: {
                [sequelize.Op.between]: [fromDate, endDate],
            },
        },
    });
    const outcome = await ctx.model.records.sum('amount', {
        where: {
            aid: userToAccount.aid,
            balanceType: 1,
            time: {
                [sequelize.Op.between]: [fromDate, endDate],
            },
        },
    });
    accountDetail.dataValues.isDefault = userToAccount.isDefault;
    accountDetail.dataValues.access = userToAccount.access;
    accountDetail.dataValues.income = income || 0;
    accountDetail.dataValues.outcome = outcome || 0;
    accountDetail.isDefault = userToAccount.isDefault;
    accountDetail.access = userToAccount.access;
    return accountDetail;
};

module.exports = router
    // 获取账单具体信息
    .get('/:uid/:aid', async (ctx, next) => {
        const {
            aid,
            uid,
            fromDate,
            endDate,
        } = ctx.getParams(['aid', 'uid']);
        if (!aid || !uid) {
            return;
        }
        const accountDetail = await getAccountDetail(ctx, aid, uid, fromDate, endDate);
        ctx.goSuccess({
            data: accountDetail,
        });
        await next();
    })
    // 创建一本账单
    .post('/:uid', async (ctx, next) => {
        const {
            uid,
            accountName,
            type,
        } = ctx.getParams(['uid', 'accountName', 'type']);
        if (!uid) {
            return;
        }
        const accountDetail = await ctx.model.accounts.create({
            aid: ctx.makeId(uid),
            createrId: uid,
            accountName,
            type,
        });
        accountDetail.dataValues.isDefault = false;
        accountDetail.dataValues.access = 0;
        ctx.goSuccess({
            data: accountDetail,
        });
        await next();
    })
    // 修改一本账单
    .put('/:aid', async (ctx, next) => {
        const {
            aid,
            uid,
            accountName,
            type,
            isDefault = false,
            access = 0,
        } = ctx.getParams(['uid', 'aid']);
        if (!aid || !uid) {
            return;
        }
        const originAccountDetail = await getAccountDetail(ctx, aid, uid);
        // 仅为可读权限
        if (originAccountDetail.access === 3) {
            ctx.goError({
                message: '无权限！',
            });
            await next();
            return;
        }
        await ctx.model.accounts.update({
            createrId: uid,
            accountName: accountName || originAccountDetail.accountName,
            type: type || originAccountDetail.type,
        }, {
            where: {
                aid,
            },
        });
        await ctx.model.userToAccount.update({
            uid,
            accountName: accountName || originAccountDetail.accountName,
            isDefault: isDefault || originAccountDetail.isDefault,
            access: access || originAccountDetail.access,
        }, {
            where: {
                aid,
            },
        });
        ctx.goSuccess({
            data: 'success',
        });
        await next();
    })
    // 删除一本账单
    .del('/:uid/:aid', async (ctx, next) => {
        const {
            uid,
            aid,
        } = ctx.getParams(['uid', 'aid']);
        const originAccountDetail = await getAccountDetail(ctx, aid, uid);
        // 仅为可读权限
        if (originAccountDetail.access !== 0) {
            ctx.goError({
                message: '无权限！',
            });
            await next();
            return;
        }
        await ctx.model.accounts.destroy({
            where: {
                id: aid,
            },
        });
        await ctx.model.userToAccount.destroy({
            where: {
                uid,
                id: aid,
            },
        });
        ctx.goSuccess({
            data: 'success',
        });
        await next();
    });
