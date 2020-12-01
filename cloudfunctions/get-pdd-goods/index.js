// 云函数入口文件
const cloud = require("wx-server-sdk");
const axios = require("axios");
var crypto = require("crypto");


cloud.init({
    env: 'test-b602t'
});

const db = cloud.database()






function getSign(params, client_secret) {

    let clientSecret = client_secret
    let sorted = Object.keys(params).sort();
    let baseString = clientSecret;
    for (let i = 0, l = sorted.length; i < l; i++) {
        let k = sorted[i];
        let newString
        if (Array.isArray(params[k])) {
            // newString = '["' + params[k].toString() + '"]';
            newString = params[k]
        } else {
            newString = params[k].toString()
        }
        // console.log(`${params[k]} ======encode ====>  ${newString}`)

        // console.log('增加----------: ', k + newString)
        baseString += k + newString;
    }
    baseString += clientSecret;

    const md5 = crypto.createHash("md5", "utf-8");

    return md5.update(baseString).digest("hex").toUpperCase();
}


// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext();

    try {

        let pddConfig = await db.collection('pinduoduo-config').get()
        pddConfig = pddConfig.data[0]
        console.log(pddConfig)

        // 本接口用于通过pid和自定义参数来查询是否已经绑定备案
        // let authorityquery = {
        //     client_id,
        //     client_secret,
        //     type: 'pdd.ddk.member.authority.query',
        //     pid: p_id,
        //     timestamp: new Date().getTime(),
        //     custom_parameters: JSON.stringify({
        //         uid: 1
        //     })
        // }
        // let author = await axios.post('https://gw-api.pinduoduo.com/api/router', Object.assign({}, authorityquery, { sign: getSign(authorityquery,client_secret) }))
        // console.log('是否授权', author)


        // 获取授权链接
        // let bindautoquery = {
        //     client_id,
        //     client_secret,
        //     type: 'pdd.ddk.rp.prom.url.generate',
        //     channel_type: 10,
        //     generate_we_app: true,
        //     p_id_list: JSON.stringify([p_id]),
        //     timestamp: new Date().getTime(),
        //     custom_parameters: JSON.stringify({
        //         uid: 1
        //     })
        // }
        // let bindautorul = await axios.post('https://gw-api.pinduoduo.com/api/router', Object.assign({}, bindautoquery, { sign: getSign(bindautoquery,client_secret) }))
        // console.log('授权链接', bindautorul)


        let { client_id, client_secret, p_id, bined_uid, get_pdd_goods_sort_type } = pddConfig

        let pageNum = event.pageNum || 0
        let list_id = event.list_id
        const limit = 10
        let offset = pageNum * limit

        let query = {
            client_id,
            client_secret,
            p_id,
            limit, //请求数量；默认值 ： 400
            offset, // 从多少位置开始请求；默认值 ： 0，offset需是limit的整数倍，仅支持整页翻页
            sort_type: get_pdd_goods_sort_type, // 1-实时热销榜；2-实时收益榜
            type: "pdd.ddk.top.goods.list.query",
            timestamp: new Date().getTime(),
            data_type: 'JSON'
        };

        // 如果翻页会用到
        if (list_id) query['list_id'] = list_id

        let sign = getSign(query, client_secret);


        let res = await axios.post(
            "https://gw-api.pinduoduo.com/api/router",
            Object.assign(query, { sign })
        );

        let list = res.data.top_goods_list_get_response.list;

        let result_list = []
        for (const item of list) {
            let generateQuery = {
                type: "pdd.ddk.goods.promotion.url.generate",
                client_id,
                client_secret,
                p_id,
                pid: p_id,
                generate_we_app: true,
                timestamp: new Date().getTime(),
                goods_sign: item.goods_sign,
                goods_id_list: JSON.stringify([item.goods_id]),
                custom_parameters: JSON.stringify({
                    pid: p_id,
                    uid: bined_uid
                })
            };
            // debugger;
            generateQuery['sign'] = getSign(generateQuery, client_secret);

            let detail = await axios.post("https://gw-api.pinduoduo.com/api/router", generateQuery);

            let goodsInfo = detail.data.goods_promotion_url_generate_response.goods_promotion_url_list[0]
            result_list.push(Object.assign({}, goodsInfo, item))
        }

        return result_list;

    } catch (error) {
        return { error };
    }
};
