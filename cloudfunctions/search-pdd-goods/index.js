// 云函数入口文件
const cloud = require("wx-server-sdk");
const axios = require("axios");
var crypto = require("crypto");
const { debug } = require("console");

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

    let { client_id, client_secret, p_id, bined_uid } = pddConfig;

    //   // 本接口用于通过pid和自定义参数来查询是否已经绑定备案
    //   let authorityquery = {
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

    //获取授权链接
    // let bindautoquery = {
    //     client_id,
    //     client_secret,
    //     type: 'pdd.ddk.rp.prom.url.generate',
    //     channel_type: 10,
    //     generate_we_app: true,
    //     p_id_list: JSON.stringify([p_id]),
    //     timestamp: new Date().getTime(),
    //     custom_parameters: JSON.stringify({
    //         uid: 1,
    //     })
    // }
    // let bindautorul = await axios.post('https://gw-api.pinduoduo.com/api/router', Object.assign({}, bindautoquery, { sign: getSign(bindautoquery, client_secret) }))
    // console.log('授权链接', bindautorul)

    // 搜索
    let page = event.page || 1;
    let page_size = event.page_size || 10;
    let keyword = event.keyword || "手机";
    let list_id = event.list_id;

    let query = {
      client_id,
      client_secret,
      page,
      page_size,
      keyword, //搜索关键词
      pid: p_id,
      type: "pdd.ddk.goods.search",
      timestamp: new Date().getTime(),
      data_type: "JSON",
      sort_type: 2, //排序方式:0-综合排序;2-按佣金比例降序;3-按价格升序;4-按价格降序;6-按销量降序;9-券后价升序排序;10-券后价降序排序;16-店铺描述评分降序
      with_coupon: true, //是否只返回优惠券的商品，false返回所有商品，true只返回有优惠券的商品
      block_cat_packages: JSON.stringify([1]), //屏蔽商品类目包：1-拼多多小程序屏蔽类目;2-虚拟类目;3-医疗器械;4-处方药;5-非处方药
      custom_parameters: JSON.stringify({
        uid: 1,
      }),
    };

    // 如果翻页会用到
    if (list_id) query["list_id"] = list_id;

    let sign = getSign(query, client_secret);

    let res = await axios.post(
      "https://gw-api.pinduoduo.com/api/router",
      Object.assign(query, { sign })
    );

    let list = res.data.goods_search_response.goods_list;
    list_id = res.data.goods_search_response.list_id;

    let search_id = res.data.goods_search_response.search_id;

    let goods_list = [];
    for (const item of list) {
      let generateQuery = {
        type: "pdd.ddk.goods.promotion.url.generate",
        client_id,
        client_secret,
        p_id,
        pid: p_id,
        search_id,
        generate_we_app: true,
        timestamp: new Date().getTime(),
        goods_sign: item.goods_sign,
        goods_id_list: JSON.stringify([item.goods_id]),
        custom_parameters: JSON.stringify({
          pid: p_id,
          uid: bined_uid,
        }),
      };
      // debugger;
      generateQuery["sign"] = getSign(generateQuery, client_secret);

      let detail = await axios.post(
        "https://gw-api.pinduoduo.com/api/router",
        generateQuery
      );

      let goodsInfo =
        detail.data.goods_promotion_url_generate_response
          .goods_promotion_url_list[0];
      goods_list.push(Object.assign({}, goodsInfo, item));
    }

    return { goods_list, list_id };
  } catch (error) {
    return { error };
  }
};
