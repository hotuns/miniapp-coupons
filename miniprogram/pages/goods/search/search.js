// miniprogram/pages/goods/search/search.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodsList: [],
        searchValue: '',
        page: 1,
        pageSize: 10,
        loading: false,
        initDone: false,
        onReachBottomLock: false, // 正在触底加载
    },

    /**
     * 搜索商品
     */
    _getSearchGoods(keyword) {
        return new Promise((resolve, reject) => {
            let data = {
                page: this.data.page,
                page_size: this.data.pageSize,
                keyword
            }
            if (this.data.list_id) data['list_id'] = this.data.list_id

            wx.cloud.callFunction({
                name: 'search-pdd-goods',
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


    /**
    * 加载全部数据
    */
    async loadData() {
        try {
            this.setData({
                goodsList: [],
                initDone: false,
                loading: true,
            })
            // 加载商品列表
            let goodslistres = await this._getSearchGoods(this.data.searchValue)

            this.data.list_id = goodslistres.list_id
            // 更新数据
            this.data.goodsList = goodslistres.goods_list

            this.setData({
                goodsList: this.data.goodsList,
                initDone: true,
                loading: false,
            })

            console.log(this.data.goodsList)
        } catch (error) {
            console.log('loadData错误:', error)
        }
    },

    /**跳转到pdd */
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
    onSearch(event) {
        this.data.searchValue = event.detail
        this.data.page = 1
        this.loadData()
    },

    onCancel() {
        this.data.searchValue = ''
        console.log(this.data.searchValue)
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
                _this.data.pageSize = config['search-page-size']
            },
            fail() {
                _this.data.pageSize = 10
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

            this.data.page += 1

            this._getSearchGoods(this.data.searchValue).then(res => {
                // 更新数据
                let list = this.data.goodsList.concat(res.goods_list)
                this.data.goodsList = list

                this.setData({
                    loading: false,
                    onReachBottomLock: false,
                    goodsList: this.data.goodsList,

                })
            }).catch(err => {
                console.log(err)
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})