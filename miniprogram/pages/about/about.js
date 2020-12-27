// pages/about/about.js
import env from "../../env";
import { getAppConfig, getUserInfo } from '../../util/util'
const app = getApp()

Page({
    /**
     * 页面的初始数据
     */
    data: {
        otherMiniPrograms: env.otherMiniPrograms,
        appConfig: {},
        userInfo: {}
    },

    /**
   * 订阅消息
   */
    subscribeMessage() {
        console.log('1')
        let tmplId = env.tmplIds
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        getAppConfig().then(res => {
            this.setData({
                appConfig: res
            })
        })

        getUserInfo().then(res => {
            this.setData({
                userInfo: res
            })

        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () { },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
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
    topdd: function () {
        wx.navigateToMiniProgram({
            appId: env.pddAppId,
        });
    },
    toOtherMiniPrograms: function (e) {
        const index = e.currentTarget.dataset.index;
        wx.navigateToMiniProgram({
            appId: this.data.otherMiniPrograms[index].appId,
            path: this.data.otherMiniPrograms[index].path
        });
    }
});