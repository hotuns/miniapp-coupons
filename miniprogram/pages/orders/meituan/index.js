const { getOrders } = require("../../../api/orders");

// pages/orders/meituan/meituan.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        date: {
            type: Object,
            value: { start: '', end: '' }
        },
        orderType: Number,
        sort: String,
    },

    /**
     * 组件的初始数据
     */
    data: {
        minDate: new Date(new Date().getTime() - 24 * 3600 * 1000 * 30),
        maxDate: new Date().getTime(),
        dateString: '',
        datePickerShow: false,
        orderTypeOpt: [{ text: '外卖订单', value: 4 }, { text: '闪购订单', value: 6 }],// 0 团购订单; 2 酒店订单; 4 外卖订单; 5 话费订单; 6 闪购订单
        sortOpt: [{ text: '正序', value: 'positive' }, { text: '倒序', value: 'reverse' }],
        sid: undefined,
        page: 1,
        pageSize: 100,
        orderData: {}
    },

    /**
     * 组件的方法列表
     */
    methods: {

        onDisplay() {
            this.setData({ datePickerShow: true });
        },
        onClose() {
            this.setData({ datePickerShow: false });
        },
        formatDate(date) {
            date = new Date(date);
            return `${date.getMonth() + 1}月/${date.getDate()}日`;
        },
        onConfirm(event) {
            const [start, end] = event.detail;
            this.setData({
                datePickerShow: false,
                date: {
                    start: start,
                    end: end,

                },
                dateString: `${this.formatDate(start)} - ${this.formatDate(end)}`
            });

            this.loadOrders()
        },
        loadOrders() {

            wx.showLoading({
                title: '加载中',
            })


            const data = {
                name: 'meituan',
                startTime: this.data.date.start,
                endTime: this.data.date.end,
                page: this.data.page,
                pageSize: this.data.pageSize,
                sid: this.data.sid
            }
            console.log(data)

            getOrders(data).then(res => {
                console.log(res)
                res.data.totalProfit = 0
                if (res.success) {
                    res.data.orderList.forEach(item => {
                        let time = new Date(Math.floor(item.paytime))

                        item.paytime = `${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`

                        res.data.totalProfit += Number(item.profit)

                        switch (item.status) {
                            case 1:
                                item.statusStr = '已付款'
                                break;
                            case 8:
                                item.statusStr = '已完成'
                                break
                            case 9:
                                item.statusStr = '已退款或风控'
                                break
                            default:
                                item.statusStr = ''
                                break;
                        }
                    })

                    res.data.totalProfit = res.data.totalProfit.toFixed(2)

                    this.setData({
                        orderData: Object.assign(res.data)
                    })

                    wx.hideLoading()
                }

            })

        }
    },

    lifetimes: {
        ready() {
            let start = new Date()
            let end = new Date()
            start = new Date(start.getTime() - 24 * 3600 * 1000 * 1) //默认一天

            this.setData({
                date: {
                    start: start,
                    end: end,
                },
                dateString: `${this.formatDate(start)} - ${this.formatDate(end)}`,
                orderType: this.data.orderTypeOpt[0].value,
                sort: this.data.sortOpt[0].value
            })


            this.loadOrders()
        }
    }
})
