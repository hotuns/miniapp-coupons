// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      preSearchVal: "",
      searchVal: "",
      historys: [],
      productions: [],
      list_id: "",
      request_id: "",
      search_id: "",
      total_count: 0,
      // 排序方式:0-综合排序;3-按价格升序;4-按价格降序;6-按销量降序;12-按照加入多多进宝时间降序;;8-优惠券金额排序降序
      sort_type: 0,
      page: 1,
      filterYH: false,
  },
  onlyFilterChange: function (e) {
      this.setData({
          filterYH: e.detail.value,
      });
      this.reloadData();
  },
  onTapHistory: function (e) {
      this.setData({
          searchVal: e.currentTarget.dataset.val,
      });
      this.reloadData();
  },
  bindKeyInput: function (e) {
      this.setData({
          searchVal: e.detail.value
      })
  },
  clearSearchContent: function () {
      wx.setStorageSync('historys', JSON.stringify([]));
      this.reloadHistory();
  },
  searchContent: function () {
      if (!this.data.searchVal || this.data.searchVal.trim() === "") {
          this.setData({
              productions: [],
          });
          return;
      }
      let hs = [this.data.searchVal.trim()];
      for (let h of this.data.historys) {
          if (h !== this.data.searchVal) {
              hs.push(h);
          }
          if (hs.length === 0) {
              break;
          }
      }
      wx.setStorageSync('historys', JSON.stringify(hs));
      this.reloadHistory();
      this.reloadData();
  },
  reloadHistory: function () {
      try {
          var historys = wx.getStorageSync('historys')
          if (historys) {
              this.setData({
                  historys: JSON.parse(historys)
              });
          }
      } catch (e) {
      }
  },
  onPullDownRefresh: function () {
      this.reloadHistory();
      this.reloadData();
      setTimeout(() => {
          wx.stopPullDownRefresh();
      }, 1000);
  },
  onReachBottom: function () {
      this.loadNext();
  },
  reloadData() {
      if (!this.data.searchVal || this.data.searchVal.trim() === "") {
          wx.stopPullDownRefresh();
          return;
      }
      wx.showLoading({
          title: '加载中...',
      })
      this.data.page = 1;

      wx.cloud.callFunction({
          name: "pdd-api",
          data: {
              sort_type: this.data.sort_type,
              keyword: this.data.searchVal.trim(),
              with_coupon: this.data.filterYH,
          }
      })
          .then(res => {
              if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_search_response && res.result.data.goods_search_response.goods_list) {
                  wx.stopPullDownRefresh();
                  const list = res.result.data.goods_search_response.goods_list;
                  if (list.length === 0) {
                      wx.hideLoading();
                      wx.showModal({
                          title: '提示',
                          content: '搜索不到相关的商品',
                          showCancel: false,
                      });
                      this.setData({
                          productions: [],
                      });
                      return;
                  }
                  this.setData({
                      productions: list,
                      list_id: res.result.data.goods_search_response.list_id,
                      request_id: res.result.data.goods_search_response.request_id,
                      search_id: res.result.data.goods_search_response.search_id,
                      total_count: res.result.data.goods_search_response.total_count,
                  });
              }
              wx.hideLoading();
          }).catch(err => {
              wx.stopPullDownRefresh();
              wx.hideLoading();
          });
  },
  loadNext() {
      if (!this.data.searchVal || this.data.searchVal.trim() === "") {
          return;
      }
      wx.showLoading({
          title: '加载中...',
      });
      wx.cloud.callFunction({
          name: "pdd-api",
          data: {
              sort_type: this.data.sort_type,
              page: this.data.page + 1,
              list_id: this.data.list_id,
              keyword: this.data.searchVal.trim(),
              with_coupon: this.data.filterYH,
          }
      }).then(res => {
          wx.hideLoading();
          if (res.result && res.result._status === 0 && res.result.data && res.result.data.goods_search_response && res.result.data.goods_search_response.goods_list) {
              const list = res.result.data.goods_search_response.goods_list;
              this.setData({
                  productions: this.data.productions.concat(list),
                  list_id: res.result.data.goods_search_response.list_id,
                  request_id: res.result.data.goods_search_response.request_id,
                  search_id: res.result.data.goods_search_response.search_id,
                  total_count: res.result.data.goods_search_response.total_count,
                  page: this.data.page + 1
              });
          }
      }).catch(err => {
          wx.hideLoading();
      });
  },
  changeSortType: function (event) {
      let isChange = false;
      if (event && event.target && event.target.dataset) {
          if (event.target.dataset.type) {
              switch (event.target.dataset.type) {
                  case "zh":
                      if (this.data.sort_type !== 0) {
                          this.setData({
                              sort_type: 0
                          });
                          isChange = true;
                      }
                      break;
                  case "yhq":
                      if (this.data.sort_type !== 8) {
                          this.setData({
                              sort_type: 8
                          });
                          isChange = true;
                      }
                      break;
                  case "xl":
                      if (this.data.sort_type !== 6) {
                          this.setData({
                              sort_type: 6
                          });
                          isChange = true;
                      }
                      break;
                  case "jg":
                      if (this.data.sort_type !== 3 && this.data.sort_type !== 4) {
                          this.setData({
                              sort_type: 3
                          });
                          isChange = true;
                      } else {
                          this.setData({
                              sort_type: this.data.sort_type === 3 ? 4 : 3
                          });
                          isChange = true;
                      }
                      break;
                  default:
                      break;
              }
              if (isChange) {
                  this.reloadData();
              }
          }
      }
  },
  onLoad: function () {
      this.reloadHistory();
  },
})