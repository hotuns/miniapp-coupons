// 云函数入口文件
const { default: Axios } = require('axios');
const cloud = require('wx-server-sdk')
const utils = require("./utils");

cloud.init(
    { env: "test-b602t", }
);


// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let start = new Date(new Date().getTime() - (24 * 3600 * 1000) * 3)
    let end = new Date()

    let { name, sid, full = 1, type = 4, page = 1, pageSize = 100, startTime = start, endTime = end } = event

    try {
        switch (name) {
            case 'meituan':
                // if (sid) {
                //     // 查询某个sid下的全部订单, 旧的接口

                //     let oldurl = 'https://runion.meituan.com/api/rtnotify'

                //     let query2 = {
                //         key: utils.appkey,
                //         sid: sid,
                //         type: type,
                //         full: full,
                //         page: page,
                //         limit: pageSize
                //     }
                //     query2['sign'] = utils.sign(query2)
                //     let res = await Axios({
                //         url: oldurl,
                //         method: 'get',
                //         params: query2
                //     })

                //     return {
                //         success: true,
                //         data: res.data
                //     }

                // } else {

                let url = 'https://runion.meituan.com/api/orderList'

                let query = {
                    key: utils.appkey,
                    ts: new Date().getTime().toString().slice(0, 10),
                    type: type, // 查询订单类型  0 团购订单;2 酒店订单;4 外卖订单;5 话费订单;6 闪购订单
                    startTime: startTime.getTime().toString().slice(0, 10),
                    endTime: endTime.getTime().toString().slice(0, 10),
                    page: page,
                    limit: pageSize,
                }

                query['sign'] = utils.sign(query)


                let res = await Axios({
                    url: url,
                    method: "get",
                    params: query,
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                let orderList = []

                if (sid) {
                    // 筛选出某个sid的数据
                    orderList = res.data.dataList.filter(item => {
                        console.log(item.sid)
                        return item.sid === sid
                    })
                }

                return {
                    success: true,
                    data: {
                        orderList,
                        total: orderList.length
                    }
                }

                // }
                break;

            default:
                break;
        }




    } catch (error) {
        console.log(error)
        return {
            success: false
        }
    }




    // let oldurl = 'https://runion.meituan.com/api/rtnotify'

    // let query2 = {
    //     key: utils.appkey,
    //     sid: 1179601966,
    //     type: 4
    // }
    // query2['sign'] = utils.sign(query2)
    // Axios({
    //     url: oldurl,
    //     method: 'get',
    //     params: query2
    // }).then(res => {
    //     console.log(res)
    // })

    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}