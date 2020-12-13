const cloud = require('wx-server-sdk');

exports.main = async (event, context) => {
    cloud.init({ env: 'test-b602t' });
    const db = cloud.database();
    const $ = db.command.aggregate;


    try {
        const messages = await db.collection('messages')
            .aggregate()
            .match({
                done: false,
            })
            // .skip(20 * (pageNum - 1))
            .limit(10000)
            .group({
                "_id": '$touser',
                "idList": $.addToSet("$_id")
            })
            .end();

        // "config": "0 30 10 * * * *"
        // console.log(messages);
        const sendPromises = messages.list.map(async msg => {

            let data = {
                thing1: {
                    value: '您昨天预约的红包已经到啦~'
                },
                thing3: {
                    value: '每天都会更新, 节约从点滴做起'
                }
            }
            try {
                // 发送订阅消息
                await cloud.openapi.subscribeMessage.send({
                    "touser": msg._id,
                    "templateId": "OrFGUmg9vWaGoxBCU_2wnCUePX-AFGkwMg9LPUeWzUE",
                    "page": "pages/index/index",
                    "data": data
                });

                // 发送成功后将消息的状态改为已发送
                return db.collection('messages')
                    .doc(msg.idList[0])
                    .update({
                        data: {
                            done: true,
                        }
                    });
            } catch (e) {
                return e;
            }
        });

        return Promise.all(sendPromises);
    } catch (err) {
        console.log(err);
        return err;
    }

};