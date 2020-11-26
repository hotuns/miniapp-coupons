const db = wx.cloud.database()


Page({
  data: {
    tabs: [],
    activeTab: 0,
    msg:{

    }
  },

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
  },

  onLoad() {


    db.collection('coupons').get().then(res=>{
      const tabs = res.data
      console.log(tabs)
      this.setData({tabs})
    })
    
    db.collection('share-message').get().then(res=>{
      const messages = res.data

      let idx = Math.floor( Math.random() * messages.length)

      this.data.msg = messages[idx]
      console.log('分享信息', this.data.msg)
    })
    
   
  },

  onTabCLick(e) {
    const index = e.detail.index
    this.setData({activeTab: index})
  },

  onChange(e) {
    const index = e.detail.index
    this.setData({activeTab: index})
  },

  toCoupon(e) {
    
    const couponIdx = e.currentTarget.dataset.index
    const wxappinfo = this.data.tabs[this.data.activeTab].coupon[couponIdx].minapp


    console.log('miniinfo', wxappinfo)

    wx.navigateToMiniProgram({
      appId: wxappinfo.appid,
      path: wxappinfo.path,
      success(res) {
        // 打开成功
        console.log('打开成功',res)
      }
    })
  }



})
