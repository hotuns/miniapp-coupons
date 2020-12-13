//index.js

//获取应用实例
const app = getApp()
import env from "../../env";

Page({
    onShareAppMessage: function () {
        return {
            title: this.data.msg.title,
            path: "/pages/pddindex/index",
        }
    },
    data: {
        env: env,
        s_category_oid: 8569,
        categorys: [
            {
                text: "精选",
                oid: 8569,
            },
            {
                text: "百货",
                oid: 15,
            },
            {
                text: "母婴",
                oid: 4,
            },
            {
                text: "食品",
                oid: 1,
            },
            {
                text: "女装",
                oid: 14,
            },
            {
                text: "电器",
                oid: 18,
            },
            {
                text: "鞋包",
                oid: 1281,
            },
            {
                text: "内衣",
                oid: 1282,
            },
            {
                text: "美妆",
                oid: 16,
            },
            {
                text: "男装",
                oid: 743,
            },
            {
                text: "水果",
                oid: 13,
            },
            {
                text: "家纺",
                oid: 818,
            },
            {
                text: "文具",
                oid: 2478,
            },
            {
                text: "运动",
                oid: 1451,
            },
            {
                text: "汽车",
                oid: 2048,
            },
            {
                text: "家装",
                oid: 1917,
            },
            {
                text: "家具",
                oid: 2974,
            },
            {
                text: "医药",
                oid: 3279,
            },
        ],
        msg: {
            title: '不用四处找人拼，直接给你找出最大的满减红包优惠券'
        },
        productions: [],
        list_id: "",
        request_id: "",
        search_id: "",
        total_count: 0,
        // 排序方式:0-综合排序;3-按价格升序;4-按价格降序;6-按销量降序;12-按照加入多多进宝时间降序;;8-优惠券金额排序降序
        sort_type: 0,
        page: 1,
    },
    gotowaimai: function (event) {
        wx.switchTab({
            url: '/pages/index/index'
        })

    },
    gotoSearch() {
        wx.navigateTo({
            url: '/pages/search/search'
        })
    },
    gotoStype: function (event) {
        console.log(event);
        wx.navigateTo({
            url: '/pages/stype/stype?type=' + event.currentTarget.dataset.type + "&title=" + event.currentTarget.dataset.title + "&banner=" + event.currentTarget.dataset.banner,
        });
    },
    onPullDownRefresh: function () {
        this.reloadData();
    },
    onReachBottom: function () {
        this.loadNext();
    },
    reloadData() {
        wx.showLoading({
            title: '加载中...',
        })
        this.data.page = 1;
        wx.cloud.callFunction({
            name: "pdd-api",
            data: {
                sort_type: this.data.sort_type,
                opt_id: this.data.s_category_oid,
            }
        })
            .then(res => {
                if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_search_response && res.result.data.goods_search_response.goods_list) {
                    const list = res.result.data.goods_search_response.goods_list;
                    this.setData({
                        productions: list,
                        list_id: res.result.data.goods_search_response.list_id,
                        request_id: res.result.data.goods_search_response.request_id,
                        search_id: res.result.data.goods_search_response.search_id,
                        total_count: res.result.data.goods_search_response.total_count,
                    });
                }
                wx.stopPullDownRefresh();
                wx.hideLoading();
            }).catch(err => {
                wx.stopPullDownRefresh();
                wx.hideLoading();
            });
    },
    loadNext() {
        wx.showLoading({
            title: '加载中...',
        })
        wx.cloud.callFunction({
            name: "pdd-api",
            data: {
                sort_type: this.data.sort_type,
                opt_id: this.data.s_category_oid,
                page: this.data.page + 1,
                list_id: this.data.list_id,
            }
        }).then(res => {
            wx.hideLoading();
            if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_search_response && res.result.data.goods_search_response.goods_list) {
                const list = res.result.data.goods_search_response.goods_list;
                this.setData({
                    productions: this.data.productions.concat(list),
                    list_id: res.result.data.goods_search_response.list_id,
                    request_id: res.result.data.goods_search_response.request_id,
                    search_id: res.result.data.goods_search_response.search_id,
                    total_count: res.result.data.goods_search_response.total_count,
                    page: this.data.page + 1
                });
            }
        }).catch(err => {
            wx.hideLoading();
        });
    },
    changeCategoryId: function (event) {
        if (event && event.target && event.target.dataset) {
            if (event.target.dataset.oid) {
                if (this.data.s_category_oid !== event.target.dataset.oid) {
                    this.setData({
                        s_category_oid: event.target.dataset.oid
                    });
                    this.reloadData();
                }
            }
        }
    },
    changeSortType: function (event) {
        let isChange = false;
        if (event && event.target && event.target.dataset) {
            if (event.target.dataset.type) {
                switch (event.target.dataset.type) {
                    case "zh":
                        if (this.data.sort_type !== 0) {
                            this.setData({
                                sort_type: 0
                            });
                            isChange = true;
                        }
                        break;
                    case "yhq":
                        if (this.data.sort_type !== 8) {
                            this.setData({
                                sort_type: 8
                            });
                            isChange = true;
                        }
                        break;
                    case "xl":
                        if (this.data.sort_type !== 6) {
                            this.setData({
                                sort_type: 6
                            });
                            isChange = true;
                        }
                        break;
                    case "jg":
                        if (this.data.sort_type !== 3 && this.data.sort_type !== 4) {
                            this.setData({
                                sort_type: 3
                            });
                            isChange = true;
                        } else {
                            this.setData({
                                sort_type: this.data.sort_type === 3 ? 4 : 3
                            });
                            isChange = true;
                        }
                        break;
                    default:
                        break;
                }
                if (isChange) {
                    this.reloadData();
                }
            }
        }
    },
    onLoad: function () {
        this.reloadData();
    }
})
