// base on /accounts
const Router = require('koa-router');
const Sequelize = require('sequelize');

const { Op } = Sequelize;
const router = new Router({
    prefix: '/types',
});

module.exports = router
    // 获取全部账单列表，没有则创建默认账单，取全部账单
    .get('/:uid', async (ctx, next) => {
        const {
            uid,
            type,
        } = ctx.getParams(['uid']);
        const typesList = await ctx.model.userToTypes.findAll({
            where: {
                uid,
            },
            include: [
                {
                    model: ctx.model.types,
                    where: {
                        type: type === undefined ? {
                            [Op.or]: [0, 1],
                        } : type,
                    },
                },
            ],
        });
        // if (typesList == false) {
        //     typesList = [
        //         {
        //             code: 'https://upload-images.jianshu.io/upload_images/16237207-d19728e2a02b9552.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240',
        //         },
        //         {
        //             code: 'https://upload-images.jianshu.io/upload_images/16237207-d19728e2a02b9552.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240',
        //         },
        //     ];
        // }

        ctx.goSuccess({
            data: typesList,
        });
        await next();
    });
