// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');
const utils = require('./utils')

cloud.init({
    env: "test-b602t",
});

const db = cloud.database()
const _ = db.command

const fun = {
    getCoupons() {
        return db.collection('coupons').get().then(res => {
            return res.data
        })
    },
    updateCoupons(event) {
        let id = event.docid
        let data = event.data
        return db.collection('coupons-list').doc(id).update({
            data: data
        })

    },
    addCoupons(event) {
        let data = event.data
        return db.collection('coupons-list').add({
            data: data
        })
    },



    // 分享信息
    getShareMessage() {
        return db.collection('share-message').get().then(res => {
            const messages = res.data

            let idx = Math.floor(Math.random() * messages.length)

            return messages[idx]
        })
    },
    removeShareMessage(event) {
        let id = event.docid
        return db.collection('share-message').doc(id).remove()
    },
    addShareMessage(event) {
        let data = event.data
        return db.collection('share-message').add({
            data: data
        })
    },


    // 滚动信息
    updateNotice(event) {
        let id = event.docid
        let data = event.data
        return db.collection('notice').doc(id).update({
            data: data
        })
    },
    getNotice() {
        return db.collection('notice').get().then(res => {
            const notice = res.data
            return notice[0].notice
        })
    }

}

/**
 * 获取美团小程序分销链接
 * @param {*} url 
 * @param {*} appkey 
 * @param {*} sid 
 */
function createMeituanUrl(url, appkey, sid) {
    let url1 = `${url}?appkey=${appkey}:${sid}`
    url1 = encodeURIComponent(url1)
    let url2 = `https://runion.meituan.com/url?key=${appkey}&url=${url1}&sid=${sid}`
    url2 = encodeURIComponent(url2)

    return `/index/pages/h5/h5?weburl=${url2}&f_token=1&f_userId=1`
}

// 云函数入口函数
exports.main = async (event, context) => {

    if (!event.apitype) {
        const app = new TcbRouter({ event });

        const wxContext = cloud.getWXContext()

        app.use(async (ctx, next) => {
            //适用于所有的路由

            ctx.data = {}; //声明data为一个对象

            await next();
        });

        app.router('getCoupons', async (ctx, next) => {

            let sid = event.sid || utils.meituanSid
            let res = await db.collection('coupons-list').aggregate().sort({ index: 1 }).end()

            if (res.list) {
                let coupons = res.list
                utils.meitaunCoupons.forEach(item => {
                    let wxpath = createMeituanUrl(item.originUrl, utils.meituanAppkey, sid)

                    coupons[utils.meituanIndex].coupons.unshift(Object.assign({ wxpath, index: 0 }, item))
                })


                ctx.body = {
                    success: true,
                    data: coupons
                }
            }
        })

        app.router('getShareMessage', async (ctx, next) => {
            console.log('getShareMessage')
            let res = await db.collection('share-message').get()
            if (res.data) {
                console.log(res.data)
                const messages = res.data

                let idx = Math.floor(Math.random() * messages.length)

                ctx.body = {
                    success: true,
                    data: messages[idx]
                }
            }
        })

        app.router('getNotice', async (ctx, next) => {
            let res = await db.collection('notice').get()
            if (res.data) {
                const notice = res.data
                ctx.body = {
                    success: true,
                    data: notice[0].notice
                }
            }
        })

        return app.serve();
    } else {
        let apitype = event.apitype

        let apifunction = fun[apitype]

        let res = await apifunction(event)
        return res
    }




}



