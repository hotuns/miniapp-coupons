// miniprogram/pages/goods/index.js
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [],
        msg: {
            title:'不用找人拼，直接拿到全网最低价，不再浪费一分钱'
        },
        activeTab: 0,
        pageNum: 0, //翻页,从0 开始
        loading: true,
        initDone: false,
        notice: '领完券记得要收藏哦, 以便下次再领',
        resourceUrlList: [],// 平台大促活动链接
        resourceUrlListActiveId: 0,
        mainActiveIndex: 0,
    },

    /**
     * 本接口用于进行平台大促活动（如618、双十一活动）、平台优惠频道转链（电器城、限时秒杀等）
     */
    getPddResourceUrl() {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'get-resource-url',
                complete: res => {
                    resolve(res.result)
                },
                fail: err => {
                    reject(err)
                }
            })
        })
    },

    /**
     * 多多进宝推广链接生成
     */
    getPddGoods() {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'get-pdd-goods',
                data: {
                    pageNum: this.data.pageNum
                },
                complete: res => {
                    resolve(res.result)
                },
                fail: err => {
                    reject(err)
                }
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadData()
    },


    /**
     * 加载全部数据
     */
    async loadData() {
        try {
            // let sharemessageres = await db.collection('share-message').get()
            // let messages = sharemessageres.data
            // let idx = Math.floor(Math.random() * messages.length)
            // this.data.msg = messages[idx]
            // console.log('分享信息', this.data.msg)


            let notice = await db.collection('notice').get()
            if (notice[0]) this.setData({ notice: notice[0].notice })
            console.log('顶部轮播信息', this.data.notice)


            // 加载商品列表
            let goodslistres = await this.getPddGoods()
            let goodsList = {
                title: '拼多多爆款',
                type: 'goods',
                items: goodslistres
            }
            // 更新数据
            this.data.tabs.push(goodsList)


            // 优惠链接列表 处理
            let urlres = await this.getPddResourceUrl()
            let resourceUrlList = {
                title: '拼多多优惠频道',
                type: 'link',
                items: urlres
            }
            // 更新数据
            this.data.tabs.push(resourceUrlList)


            this.setData({
                tabs: this.data.tabs,
                initDone: true,
                loading: false,
            })

            console.log(this.data.tabs)
        } catch (error) {
            console.log('loadData错误:', error)
        }




    },


    toMiniProgram(e) {
        const wxappinfo = e.currentTarget.dataset.appinfo
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
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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
        console.log('触底')

        this.setData({
            loading: true
        })

        this.data.pageNum += 1

        this.getPddGoods().then(res => {
            // 更新数据
            let items = this.data.tabs[0].items.concat(res)
            this.data.tabs[0].items = items

            console.log(this.data.tabs[0].items)

            this.setData({
                loading: false,
                tabs: this.data.tabs
            })
        }).catch(err => {
            console.log(err)
        })
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
            path: '/pages/goods/index',
        }
    }
})