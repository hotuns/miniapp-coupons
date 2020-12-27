// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({
    env: 'test-b602t'
})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        let res = await axios({
            url: 'https://yesno.wtf/api'
        })

        let fileres = await cloud.uploadFile({
            cloudPath: 'yesno/' + res.data.answer+ '-' + new Date().getTime() +'.gif',
            fileContent: res.data.image
        })

        console.log(fileres)

        let result = {
            success: true,
            data: {
                answer: res.data.answer,
                image: fileres.fileID
            }
        }

        return result
    } catch (error) {
        return {
            success: false
        }
    }



}