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

        let { client_id, client_secret, p_id, bined_uid, get_pdd_goods_sort_type } = pddConfig

        let result_res = []
        let resource_type_array_str = ['限时秒杀', '百亿补贴', '领券中心']
        let resource_type_array = [4, 39996, 40000] //频道来源：4-限时秒杀,39997-充值中心, 39998-活动转链，39996-百亿补贴，40000-领券中心
        for (let index = 0; index < resource_type_array.length; index++) {
            const resource_type = resource_type_array[index];

            let query = {
                client_id,
                client_secret,
                pid: p_id,
                type: "pdd.ddk.resource.url.gen",
                timestamp: new Date().getTime(),
                data_type: 'JSON',
                generate_we_app: true,
                resource_type: resource_type,
                // limit: 10, //请求数量；默认值 ： 400
                // offset: 0, // 从多少位置开始请求；默认值 ： 0，offset需是limit的整数倍，仅支持整页翻页
            }
            query['sign'] = getSign(query, client_secret)

            let url_res = await axios.post(
                "https://gw-api.pinduoduo.com/api/router",
                query
            )

            let type = resource_type_array_str[index]
            if (url_res.status == 200) {

                result_res.push(Object.assign(url_res.data.resource_url_response, { type: type }))
            } else {
                result_res.push({
                    error: url_res
                })
            }
        }


        return result_res

    } catch (error) {
        return { error };
    }
};
