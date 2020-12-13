// miniprogram/pages/index/index.js
import { getCopons, getShareMessage, getNotice } from '../../api/coupons'
import {getAppConfig} from '../../util/util'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [],
        msg: {},
        activeTab: 0,
        notice: '领完券记得要收藏哦, 以便下次再领',
        tmplIds: 'OrFGUmg9vWaGoxBCU_2wnCUePX-AFGkwMg9LPUeWzUE',
        subscribeShow: false,
        audit: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadData()

    },

    /**
     * 加载所需的数据
     */
    loadData() {

        getCopons().then(res => {
            console.log(res)
            let tabs = res


            let all = {
                title: '全部',
                icon: '../../images/all.png',
                coupon: []
            }

            res.forEach(item => {
                let c = item.coupon
                c.forEach(citem => {
                    all.coupon.push(citem)
                })
            })


            tabs.unshift(all)


            this.setData({ tabs: tabs })

            getAppConfig().then(confit=>{
                console.log(confit)
                this.setData({
                    audit: confit.audit
                })
                if(!confit.audit) {
                    this.setData({
                        subscribeShow: true,
                    })
                }
            })

        })

        getShareMessage().then(res => {
            this.data.msg = res
        })


        getNotice().then(res => {
            this.setData({ notice: res })
        })
    },


    subscribeMessageConfirm() {
        this.subscribeMessage()
    },
    subscribeMessageClose() { },

    /**
     * 订阅消息
     */
    subscribeMessage() {
        let tmplId = this.data.tmplIds
        wx.requestSubscribeMessage({
            tmplIds: [tmplId],
            success(res) {
                // 申请订阅成功
                if (res.errMsg === 'requestSubscribeMessage:ok') {
                    // 这里将订阅的课程信息调用云函数存入云开发数据
                    wx.cloud
                        .callFunction({
                            name: 'subscribe',
                            data: {
                                templateId: tmplId,
                            },
                        })
                        .then(() => {
                            wx.showToast({
                                title: '订阅成功',
                                icon: 'success',
                                duration: 2000,
                            });
                        })
                        .catch(() => {
                            wx.showToast({
                                title: '订阅失败',
                                icon: 'success',
                                duration: 2000,
                            });
                        });
                }
            },
        })
    },

    onChange(e) {
        console.log(e)
        console.log(this.data.activeTab)
        const index = e.detail.index
        this.setData({ activeTab: parseInt(index) })
    },


    /**
     * 跳转到其他小程序
     * @param {} e 
     */
    toCoupon(e) {
        const couponIdx = e.currentTarget.dataset.index
        const wxappinfo = this.data.tabs[this.data.activeTab].coupon[couponIdx].minapp


        console.log('miniinfo', wxappinfo)


        wx.navigateToMiniProgram({
            appId: wxappinfo.appid,
            path: wxappinfo.path,
            success(res) {
                // 打开成功
                console.log('打开成功', res)
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const options = wx.getLaunchOptionsSync()
        console.log('show',options)
        if(options.scene == 1038 || options.scene == 1001) {

            

            if(options.referrerInfo && options.referrerInfo.appId) {

            }
        }
        
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

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
            path: this.data.msg.path,
            imageUrl: this.data.msg.imageUrl,
        }
    }
})