import env from '../env'

export function getAppConfig() {
  return new Promise((resolve, reject)=>{
    try {
      var value = wx.getStorageSync('key')
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