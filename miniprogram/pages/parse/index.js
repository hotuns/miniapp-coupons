// miniprogram/pages/parse/index.js
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    originUrl: "",
    apiRes: "",
    parsedUrl: "",
    goodsInfo: undefined,
  },

  bindFormSubmit(e) {
    console.log(e.detail.value.textarea);

    let id = 69115772399;
    this.parsePinduoduoUrl(id).then((res) => {
      this.goodsInfo = res;
      console.log("解析后", this.goodsInfo);

      this.setData({ goodsInfo: this.goodsInfo });
    });
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
