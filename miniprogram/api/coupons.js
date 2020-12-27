const db = wx.cloud.database(
    { env: 'test-b602t' }
)

export function getCoupons() {
    return wx.cloud.callFunction({
        name: 'coupons',
        data: {
            $url: 'getCoupons',
        }
    }).then(res => {
        return res.result
    })
}


export function getShareMessage() {
    return wx.cloud.callFunction({
        name: 'coupons',
        data: {
            apitype: 'getShareMessage'
        }
    }).then(res => {
        return res.result
    })
}

export function getNotice() {
    return wx.cloud.callFunction({
        name: 'coupons',
        data: {
            apitype: 'getNotice'
        }
    }).then(res => {
        return res.result
    })

}