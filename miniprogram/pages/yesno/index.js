// miniprogram/pages/yesno/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false,
        audit: false,
        showAnswer: false,
        showClear: false,
        answerLoaded: false,
        answer: undefined,
        loading: false,
        msg: {
            title: '你有什么纠结的问题, 就让我来帮你做决定吧'
        }
    },

    bindFormSubmit(e) {
        this.setData({
            showAnswer: true
        })
        wx.cloud.callFunction({
            name: 'yesno'
        }).then(res => {
            if (res.result.success) {
                console.log(res.result.data)
                this.setData(
                    {
                        answer: res.result.data,
                        showAnswer: true
                    }
                )
            }
        }).catch(err => {
            console.log(err)
            wx.showToast({
                title: '请求失败',
                icon: 'none',
                duration: 1000
            })
        })
    },
    answerLoad() {
        // 图片加载完成
        console.log('完成')
        this.setData({ answerLoaded: true })
    },
    onClickHideAnswer() {
        this.setData({
            showAnswer: false,
            answerLoaded: false
        })
    },
    onTextareaInput(event) {
        let { value, cursor, keyCode } = event.detail
        if (value.length == 0) {
            this.setData({
                showClear: false
            })
        } else {
            this.setData({
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {


    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        setTimeout(() => {
            this.setData({
                show: true
            })
        }, 300);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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
    onShareAppMessage: function () {

    }
})