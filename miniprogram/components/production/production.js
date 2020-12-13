// components/production.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    productions: Array,
  },

  attached: function() {
  },
  /**
   * 组件的方法列表
   */
  methods: {
    clickOnProduction: function(event) {
      wx.navigateTo({
        url: '/pages/detail/detail?gid=' + event.currentTarget.dataset.gid + '&search_id=' + event.currentTarget.dataset.searchid,
      });
    },
  }
})
