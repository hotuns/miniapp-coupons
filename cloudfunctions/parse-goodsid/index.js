// 云函数入口文件
const cloud = require("wx-server-sdk");
const axios = require("axios");
var crypto = require("crypto");

cloud.init({
  env: "test-b602t",
});

const db = cloud.database();

function getSign(params, client_secret) {
  let clientSecret = client_secret;
  let sorted = Object.keys(params).sort();
  let baseString = clientSecret;
  for (let i = 0, l = sorted.length; i < l; i++) {
    let k = sorted[i];
    let newString;
    if (Array.isArray(params[k])) {
      // newString = '["' + params[k].toString() + '"]';
      newString = params[k];
    } else {
      newString = params[k].toString();
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
    let pddConfig = await db.collection("pinduoduo-config").get();
    pddConfig = pddConfig.data[0];
    console.log(pddConfig);

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

    let {
      client_id,
      client_secret,
      p_id,
      bined_uid,
      get_pdd_goods_sort_type,
    } = pddConfig;
    let goods_id = [event.id];

    // 获取详情
    let detailQuery = {
      type: "pdd.ddk.goods.detail",
      client_id,
      client_secret,
      p_id,
      pid: p_id,
      search_id: "49f75d573541c4630a2c29b1b5a39f3b065",
      timestamp: new Date().getTime(),
      goods_id_list: JSON.stringify(goods_id),
      custom_parameters: JSON.stringify({
        pid: p_id,
        uid: bined_uid,
      }),
    };
    detailQuery["sign"] = getSign(detailQuery, client_secret);
    let detailRes = await axios.post(
      "https://gw-api.pinduoduo.com/api/router",
      detailQuery
    );
    detailRes = detailRes.data.goods_detail_response.goods_details[0];

    // 商品id

    let generateQuery = {
      type: "pdd.ddk.goods.promotion.url.generate",
      client_id,
      client_secret,
      p_id,
      pid: p_id,
      generate_we_app: true,
      timestamp: new Date().getTime(),
      goods_id_list: JSON.stringify(goods_id),
      search_id: "49f75d573541c4630a2c29b1b5a39f3b065",
      custom_parameters: JSON.stringify({
        pid: p_id,
        uid: bined_uid,
      }),
    };

    // debugger;
    generateQuery["sign"] = getSign(generateQuery, client_secret);

    let goodsRes = await axios.post(
      "https://gw-api.pinduoduo.com/api/router",
      generateQuery
    );

    let goodsInfo =
      goodsRes.data.goods_promotion_url_generate_response
        .goods_promotion_url_list[0];

    return Object.assign(detailRes, goodsInfo);
  } catch (error) {
    return { error };
  }
};
