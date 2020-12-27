const db = wx.cloud.database(
    { env: 'test-b602t' }
)


export function getOrders(data) {
    return wx.cloud.callFunction({
        name: 'orders-api',
        data: data
    }).then(res => {
        return res.result
    })
}