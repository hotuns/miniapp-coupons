// miniprogram/pages/parse/index.js
import { getAppConfig } from '../../util/util'
// 在页面中定义插屏广告
let interstitialAd = null


Page({
    /**
     * 页面的初始数据
     */
    data: {
        audit: false,
        originUrl: "",
        parsedUrl: "",
        goodsInfo: undefined,
        showClear: false,
        msg: {
            title: '复制你的商品链接, 我帮你找到最棒的优惠券~'
        }
    },

    bindFormSubmit(e) {
        console.log(e.detail.value.textarea);

        let id = this.parseUrl(e.detail.value.textarea);

        if (id) {
            this.parsePinduoduoUrl(id).then((res) => {
                this.goodsInfo = res;
                console.log("解析后", this.goodsInfo);

                this.setData({ goodsInfo: this.goodsInfo, dialogShow: true });
            });
        } else {
            wx.showToast({
                title: '优惠券获取失败, 请检查你的商品链接是否错误',
                icon: 'none',
                duration: 2000
            })
        }
    },
    onTextareaInput(event) {
        let { value, cursor, keyCode } = event.detail
        if (value.length == 0) {
            this.setData({
                showClear: false
            })
        } else {
            this.setData({
                originUrl: value,
                showClear: true
            })
        }
    },
    bindFormReset() {
        this.setData({
            originUrl: '',
            showClear: false
        })
    },

    parseUrl(url) {
        let index = url.indexOf('goods_id=')
        if (index == -1) {
            return false
        }

        let id = url.slice(index + 9)

        return id
    },
    /**
     * 本接口用于解析拼多多的商品链接
     */
    parsePinduoduoUrl(id) {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: "parse-goodsid",
                data: {
                    id: id,
                },
                complete: (res) => {
                    resolve(res.result);
                },
                fail: (err) => {
                    reject(err);
                },
            });
        });
    },

    /**
     * 跳转到其他小程序
     */
    dialogConfirm() {
        const wxappinfo = this.data.goodsInfo.we_app_info
        console.log('miniinfo', wxappinfo)
        wx.navigateToMiniProgram({
            appId: wxappinfo.app_id,
            path: wxappinfo.page_path,
            success(res) {
                // 打开成功
                console.log('打开成功', res)
            }
        })
    },


    /**
     * 复制链接
     */
    dialogClose(event) {
        let detail = event.detail
        if (detail == 'confirm') {
            return
        }
        let url = this.data.goodsInfo.mobile_short_url
        wx.setClipboardData({
            data: url,
            success(res) {
                wx.showToast({
                    title: '现在可以把链接转发,或者自己的微信中打开',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getAppConfig().then(config => {
            this.setData({
                audit: config.audit
            })
        })



        if (wx.createInterstitialAd) {
            interstitialAd = wx.createInterstitialAd({
                adUnitId: 'adunit-4093c8ab33e81632'
            })
            interstitialAd.onLoad(() => { })
            interstitialAd.onError((err) => { })
            interstitialAd.onClose(() => { })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () { },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const _this = this
        wx.getClipboardData({
            success(res) {
                console.log(res.data) // data
                if (_this.data.originUrl == res.data) { return }

                let id = _this.parseUrl(res.data);
                if (id) {
                    wx.showModal({
                        title: '提示',
                        content: '你复制了一个拼多多商品, 是否要直接获取优惠信息?',
                        success(res) {
                            if (res.confirm) {
                                console.log('用户点击确定')

                                _this.parsePinduoduoUrl(id).then((res) => {
                                    _this.goodsInfo = res;
                                    console.log("解析后", _this.goodsInfo);

                                    _this.setData({
                                        goodsInfo: _this.goodsInfo,
                                        dialogShow: true,
                                        originUrl: res.data
                                    });
                                });


                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }
            }
        })



        // 在适合的场景显示插屏广告
        if (interstitialAd) {
            interstitialAd.show().catch((err) => {
                console.error(err)
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () { },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () { },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () { },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () { },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: this.data.msg.title,
            path: '/pages/parse/index',
        }
    },
});
