// miniprogram/pages/goods/index.js

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [],
        msg: {
            title: '不用找人拼，直接拿到全网最低价，不再浪费一分钱'
        },
        searceValue: '',
        activeTab: 0,
        pageNum: 0, //翻页,从0 开始
        pageSize: 10,
        loading: true,
        onReachBottomLock: true, //触底加载  锁
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
            let data = {
                pageNum: this.data.pageNum,
                pageSize: this.data.pageSize
            }
            if (this.data.list_id) data['list_id'] = this.data.list_id

            wx.cloud.callFunction({
                name: 'get-pdd-goods',
                data: data,
                complete: res => {
                    resolve(res.result)
                },
                fail: err => {
                    reject(err)
                }
            })
        })
    },

    /**跳转到搜索页 */
    toSearch() {
        console.log('toSearch')
        wx.navigateTo({
            url: '/pages/goods/search/search',
            // events: {
            //     // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
            //     acceptDataFromOpenedPage: function (data) {
            //         console.log(data)
            //     },
            //     someEvent: function (data) {
            //         console.log(data)
            //     }
            // },
            success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                // res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
            }
        })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const _this = this

        wx.getStorage({
            key: 'config',
            success(res) {
                let config = res.data
                _this.data.pageSize = config['goods-page-size']
                _this.loadData()
            },
            fail() {
                _this.data.pageSize = 10
                _this.loadData()
            }
        })


    },


    /**
     * 加载全部数据
     */
    async loadData() {
        try {
            // 加载商品列表
            let goodslistres = await this.getPddGoods()
            let goodsList = {
                title: '拼多多爆款',
                type: 'goods',
                items: goodslistres.goods_list
            }
            this.data.list_id = goodslistres.list_id
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
                onReachBottomLock: false
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

        if (!this.data.onReachBottomLock) {
            this.setData({
                loading: true,
                onReachBottomLock: true
            })

            this.data.pageNum += 1

            this.getPddGoods().then(res => {
                // 更新数据
                this.data.list_id = res.list_id

                let items = this.data.tabs[0].items.concat(res.goods_list)
                this.data.tabs[0].items = items

                console.log(this.data.tabs[0].items)

                this.setData({
                    loading: false,
                    onReachBottomLock: false,
                    tabs: this.data.tabs,
                })
            }).catch(err => {
                console.log(err)
            })
        }


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