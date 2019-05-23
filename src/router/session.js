// base on /session
const Router = require('koa-router');
const fetch = require('node-fetch');
const config = require('../../config');

const router = new Router({
    prefix: '/session',
});
module.exports = router
    // 登录
    .post('/', async (ctx, next) => {
        const {
            code,
            name,
            avatar,
        } = ctx.getParams(['code']);
        if (!code) {
            await next();
            return;
        }
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.appid}&secret=${config.secret}&js_code=${code}&grant_type=authorization_code`;
        const loginInf = await fetch(url)
            .then(res => (res.json()));
        const uid = loginInf.openid;
        if (uid.errcode) {
            ctx.goError({
                data: `uid不存在！${JSON.stringify(loginInf)}`,
            });
            await next();
            return;
        }

        let hasUser = await ctx.model.users.findOne({
            where: {
                uid,
            },
        });
        if (!hasUser && (!name || !avatar)) {
            ctx.goError({
                data: '未注册!',
            });
            await next();
            return;
        } else if (name && avatar) {
            hasUser = await ctx.model.users.create({
                uid,
                name,
                avatar,
            });
        }
        ctx.goSuccess({
            uid,
            userInfo: {
                name: hasUser.name,
                avatar: hasUser.avatar,
            },
        });
        await next();
    })
    .get('/account', async (ctx, next) => {
        const {
            aid,
            rid,
        } = ctx.getParams();
        if (!aid && !rid) {
            ctx.goError({
                message: '参数缺失!',
            });
            return;
        }
        let users;
        if (rid) {
            users = await ctx.model.userToRecord.findAll({
                where: {
                    rid,
                },
                include: [
                    {
                        model: ctx.model.users,
                    },
                ],
            });
        } else {
            users = await ctx.model.userToAccount.findAll({
                where: {
                    aid,
                },
                include: [
                    {
                        model: ctx.model.users,
                    },
                ],
            });
        }
        ctx.goSuccess({
            users,
        });
        await next();
    });
