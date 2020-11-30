// 云函数入口文件
const cloud = require("wx-server-sdk");
const axios = require("axios");
var crypto = require("crypto");
const { default: Axios } = require("axios");

let client_id = "8384e335471e475c951f76e2e8a0d69b";
let client_secret = "748f9cf9735049a5ab69e3eb2335ac615a3fb533";
let p_id = "13905439_182199298";

cloud.init();

function getSign(thequery) {
  const keys = Object.keys(thequery).sort();

  let sortQuery = client_secret;

  keys.forEach((item, index) => {
    //console.log(item,index)
    if (Array.isArray(thequery[item]) && thequery[item].length == 1) {
      sortQuery += `${item}[${thequery[item][0]}]`;
    } else {
      sortQuery = sortQuery + item + thequery[item];
    }
  });

  sortQuery += client_secret;

  console.log("格式化", sortQuery);

  let md5 = crypto.createHash("md5", "utf-8");
  let sign = md5.update(sortQuery).digest("hex").toUpperCase();

  return sign;
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  let query = {
    client_id,
    client_secret,
    p_id,
    limit: 10, //请求数量；默认值 ： 400
    offset: 0, // 从多少位置开始请求；默认值 ： 0，offset需是limit的整数倍，仅支持整页翻页
    sort_type: 1, // 1-实时热销榜；2-实时收益榜
    type: "pdd.ddk.top.goods.list.query",
    timestamp: new Date().getTime(),
  };

  let sign = getSign(query);

  try {
    let res = await axios.post(
      "https://gw-api.pinduoduo.com/api/router",
      Object.assign(query, { sign })
    );

    let generateQuery = {
      type: "pdd.ddk.goods.promotion.url.generate",
      client_id,
      client_secret,
      p_id,
      timestamp: new Date().getTime(),
    };

    let list = res.data.top_goods_list_get_response.list;

    for (const item of list) {
      let q = Object.assign(generateQuery, {
        goods_sign: item.goods_sign,
        goods_id_list: item.goods_id,
      });

      // debugger;
      let sign = getSign(q);
      console.log(Object.assign(q, { sign }));

      let detail = await Axios({
        method: "POST",
        url: "https://gw-api.pinduoduo.com/api/router",
        params: Object.assign(q, { sign }),
      });

      console.log("detail", detail);
    }

    return list;
  } catch (error) {
    return { error };
  }

  // return new Promise((resolve, reject) => {
  //   axios.post("https://gw-api.pinduoduo.com/api/router", Object.assign(query, {sign}))
  //   .then((res) => {
  //     resolve(res.data.top_goods_list_get_response)
  //   })
  //   .then(list =>{
  //     console.log(list)

  //   })
  //   .catch((err) => {
  //     reject(err)
  //   });
  // })
};
