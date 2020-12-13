// pages/detail/detail.js

Page({

    /**
     * 页面的初始数据
     */
    data: {
        goods_id: [],
        search_id: "",
        detail: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.goods_id = options["gid"];
        this.data.search_id = options["search_id"];
        this.setData({
            goods_id: options["gid"],
            search_id: options["search_id"],
        });
        this.reloadData();
    },
    formatDate(datetime) {
        var date = new Date(datetime);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var year = date.getFullYear(),
            month = ("0" + (date.getMonth() + 1)).slice(-2),
            sdate = ("0" + date.getDate()).slice(-2);
        var result = year + "-" + month + "-" + sdate;
        return result;
    },
    reloadData() {
        wx.showLoading({
            title: '加载中...',
        });
        wx.cloud.callFunction({
            name: "pdd-api",
            data: {
                detail: true,
                goods_id_list: `[${this.data.goods_id}]`,
                search_id: this.data.search_id,
            }
        })
            .then(res => {
                if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_detail_response && res.result.data.goods_detail_response.goods_details) {
                    const list = res.result.data.goods_detail_response.goods_details;
                    if (list && list.length > 0) {
                        list[0].coupon_start_time_format = this.formatDate(list[0].coupon_start_time * 1000);
                        list[0].coupon_end_time_format = this.formatDate(list[0].coupon_end_time * 1000);
                        this.setData({
                            detail: list[0],
                        });
                    }
                }
                wx.stopPullDownRefresh();
                wx.hideLoading();
            }).catch(err => {
                wx.stopPullDownRefresh();
                wx.hideLoading();
            });
    },
    onPullDownRefresh: function () {
        this.reloadData();
    },
    onShareAppMessage: function (e) {
        let path = '/pages/detail/detail?gid=' + this.data.goods_id + '&search_id=' + this.data.search_id;
        return {
            title: this.data.detail.goods_name,
            path: path,
            imageUrl: this.data.detail.goods_thumbnail_url,
        };
    },
    buy() {
        wx.showLoading({
            title: '处理中...',
        });
        wx.cloud.callFunction({
            name: "pdd-api",
            data: {
                generate: true,
                goods_id_list: `[${this.data.goods_id}]`,
                search_id: this.data.search_id,
            }
        }).then(res => {
            wx.hideLoading();
            if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_promotion_url_generate_response && res.result.data.goods_promotion_url_generate_response.goods_promotion_url_list) {
                const list = res.result.data.goods_promotion_url_generate_response.goods_promotion_url_list;
                if (list.length > 0) {
                    const r = list[0];
                    if (r.we_app_info) {
                        wx.navigateToMiniProgram({
                            appId: r.we_app_info.app_id,
                            path: r.we_app_info.page_path,
                        });
                    }
                }
            }
        }).catch(err => {
            wx.hideLoading();
        });
    },
    gohome() {
        wx.switchTab({
            url: '/pages/pddindex/index',
        });
    }
})