// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: "test-b602t",
});

const db = cloud.database()
const _ = db.command

const fun = {
    getCoupons() {
        return db.collection('coupons').get().then(res => {
            const tabs = res.data
            return tabs
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

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let apitype = event.apitype

    let apifunction = fun[apitype]

    let res = await apifunction(event)

    return res

    // return {
    //     event,
    //     openid: wxContext.OPENID,
    //     appid: wxContext.APPID,
    //     unionid: wxContext.UNIONID,
    // }
}



