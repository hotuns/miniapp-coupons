// pages/about/about.js
import env from "../../env";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    otherMiniPrograms: env.otherMiniPrograms,
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