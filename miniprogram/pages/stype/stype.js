// pages/stype/stype.js

//获取应用实例
const app = getApp()

Page({
    data: {
        banner: null,
        type: 1,
        productions: [],
        list_id: "",
        request_id: "",
        search_id: "",
        total_count: 0,
        // 排序方式:0-综合排序;3-按价格升序;4-按价格降序;6-按销量降序;12-按照加入多多进宝时间降序;;8-优惠券金额排序降序
        offset: 0,
        limit: 10,
    },
    onPullDownRefresh: function () {
        this.reloadData();
        setTimeout(() => {
            wx.stopPullDownRefresh();
        }, 1000);
    },
    onReachBottom: function () {
        this.loadNext();
    },
    reloadData() {
        wx.showLoading({
            title: '加载中...',
        })
        this.data.offset = 0;
        wx.cloud.callFunction({
            name: "pdd-api",
            data: {
                stype: true,
                limit: this.data.limit,
                offset: this.data.offset,
                channel_type: this.data.type,
            }
        })
            .then(res => {
                if (res.result && res.result.success && res.result.data && res.result.data.goods_basic_detail_response && res.result.data.goods_basic_detail_response.list) {
                    const list = res.result.data.goods_basic_detail_response.list;
                    this.setData({
                        productions: list,
                        list_id: res.result.data.goods_basic_detail_response.list_id,
                        request_id: res.result.data.goods_basic_detail_response.request_id,
                        search_id: res.result.data.goods_basic_detail_response.search_id,
                        total_count: res.result.data.goods_basic_detail_response.total_count,
                    });
                }
                wx.hideLoading();
            }).catch(err => {
                wx.hideLoading();
            });
    },
    loadNext() {
        wx.showLoading({
            title: '加载中...',
        });
        wx.cloud.callFunction({
            name: "pdd-api",
            data: {
                stype: true,
                limit: this.data.limit,
                offset: this.data.offset + this.data.limit,
                channel_type: this.data.type,
            }
        }).then(res => {
            wx.hideLoading();
            if (res.result && res.result.success && res.result.data && res.result.data.goods_basic_detail_response && res.result.data.goods_basic_detail_response.list) {
                const list = res.result.data.goods_basic_detail_response.list;
                this.setData({
                    productions: this.data.productions.concat(list),
                    list_id: res.result.data.goods_basic_detail_response.list_id,
                    request_id: res.result.data.goods_basic_detail_response.request_id,
                    search_id: res.result.data.goods_basic_detail_response.search_id,
                    total_count: res.result.data.goods_basic_detail_response.total_count,
                    offset: this.data.offset + this.data.limit,
                });
            }
        }).catch(err => {
            wx.hideLoading();
        });
    },
    onLoad: function (option) {
        this.data.type = option.type;
        wx.setNavigationBarTitle({
            title: option.title,
        });
        if (option.banner) {
            this.setData({
                banner: option.banner.trim()
            });
        }
        this.reloadData();
    },
})
