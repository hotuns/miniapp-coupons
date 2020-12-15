// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: "test-b602t",
});

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    let distribution = await db.collection('distribution-users').where({ openid: wxContext.OPENID }).get()

    console.log(distribution.data)
    if (distribution.data.length != 0) {

    }

    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}