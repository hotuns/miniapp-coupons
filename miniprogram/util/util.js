import env from '../env'

export function getAppConfig() {
    return new Promise((resolve, reject) => {
        try {
            var value = wx.getStorageSync('config')
            if (value) {
                // Do something with return value
                resolve(value)
            } else {
                const db = wx.cloud.database(
                    {
                        env: env.wxCloudEnv
                    }
                )
                db.collection('app-config').get().then(res => {
                    const config = res.data[0]

                    wx.setStorage({
                        key: "config",
                        data: config,
                        success() {
                            resolve(config)
                        },
                        fail() {
                            console.log('setStorage失败')
                            reject('setStorage失败')
                        }
                    })
                })
            }
        } catch (e) {
            // Do something when catch error
            reject(e)
        }


    })

}

export function getUserInfo() {
    return new Promise((resolve, reject) => {
        try {
            var value = wx.getStorageSync('userInfo')
            if (value) {
                // Do something with return value
                resolve(value)
            } else {
                const db = wx.cloud.database(
                    {
                        env: env.wxCloudEnv
                    }
                )
                wx.cloud.callFunction({
                    name: 'login'
                }).then(res => {
                    const userInfo = res.result

                    wx.setStorage({
                        key: "userInfo",
                        data: userInfo,
                        success() {
                            resolve(userInfo)
                        },
                        fail() {
                            console.log('setStorage失败: userinfo')
                            reject('setStorage失败: userinfo')
                        }
                    })
                })

            }
        } catch (e) {
            // Do something when catch error
            reject(e)
        }


    })
}