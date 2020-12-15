// 云函数入口文件
const cloud = require("wx-server-sdk");
const axios = require("axios");
const utils = require("./pdd/utils");
cloud.init(
    { env: "test-b602t", }
);

// 云函数入口函数
exports.main = async (event, context) => {
    // 默认搜索
    let is_search = true;
    let args = {
        client_id: utils.CLIENTID,
        data_type: "JSON",
        sort_type: event.sort_type ? event.sort_type : 0,
        timestamp: utils.timestamp(),
        type: "pdd.ddk.goods.search",
        pid: utils.PDDPID,
        page: event.page ? event.page : 1,
        block_cat_packages: `[1]`,//屏蔽商品类目包：1-拼多多小程序屏蔽类目;2-虚拟类目;3-医疗器械;4-处方药;5-非处方药
    };
    // 子分类
    if (event.stype) {
        is_search = false;
        args = {
            // 0-1.9包邮, 1-今日爆款, 2-品牌好货,3-相似商品推荐,4-猜你喜欢,5-实时热销,6-实时收益,7-今日畅销,8-高佣榜单，默认1
            channel_type: event.channel_type,
            client_id: utils.CLIENTID,
            data_type: "JSON",
            timestamp: utils.timestamp(),
            type: "pdd.ddk.goods.recommend.get",
            pid: utils.PDDPID,
            offset: event.offset,
            limit: event.limit,
        };
    }
    // 生成推广
    if (event.generate) {
        is_search = false;
        args = {
            client_id: utils.CLIENTID,
            data_type: "JSON",
            timestamp: utils.timestamp(),
            type: "pdd.ddk.goods.promotion.url.generate",
            p_id: utils.PDDPID,
            goods_id_list: event.goods_id_list,
            search_id: event.search_id,
            generate_we_app: true,
        };
    }
    // 详情
    if (event.detail) {
        is_search = false;
        args = {
            client_id: utils.CLIENTID,
            data_type: "JSON",
            timestamp: utils.timestamp(),
            type: "pdd.ddk.goods.detail",
            pid: utils.PDDPID,
            goods_id_list: event.goods_id_list,
            search_id: event.search_id,
        };
    }
    if (event.opt_id) {
        args["opt_id"] = event.opt_id;
    }
    if (event.list_id) {
        args["list_id"] = event.list_id;
    }
    if (event.keyword) {
        args["keyword"] = event.keyword;
    }
    if (event.with_coupon !== null && event.with_coupon !== undefined) {
        args["with_coupon"] = event.with_coupon;
    }
    args.sign = utils.sign(args);
    console.log(args);
    try {
        let result = await axios.get("https://gw-api.pinduoduo.com/api/router", {
            params: args,
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (is_search) {
            let r = result.data;
            if (r.goods_search_response && r.goods_search_response.goods_list) {
                let t_list = [];
                for (let g of r.goods_search_response.goods_list) {
                    // if (
                    //     g.goods_desc.indexOf("电子书") !== -1 ||
                    //     g.goods_name.indexOf("电子书") !== -1
                    // ) { } else {
                    //     t_list.push(g);
                    // }
                    t_list.push(g);
                }
                r.goods_search_response.goods_list = t_list;
                return {
                    success: true,
                    data: result.data,
                };
            }
        }
        return {
            success: true,
            data: result.data,
        };
    } catch (err) {
        return {
            success: false,
        };
    }
};
