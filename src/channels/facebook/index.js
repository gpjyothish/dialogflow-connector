const { Dialogflow } = require('../../dialogflow')
const sendMessage = require('./sendMessages')

class Facebook {
    constructor(config, webserver) {
        this.config = config
        this.webserver = webserver

        if (!this.config.webhook_uri) {
            this.config.webhook_uri = 'api/messages'
        }
        this.hubVerification ()
        this.dialogflow = new Dialogflow (this.config, this.webserver)
    }

    // verify the hub signature
    hubVerification () {
        let verifyToken = this.config.chennels.facebook.verify_token
        this.webserver.get(this.config.webhook_uri, function (req, res) {

            // This enables subscription to the webhooks
            if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === verifyToken) {
                res.send(req.query['hub.challenge'])
            }
            else {
                res.send('Incorrect verify token')
            }
        })
    }

    async messageHandler (reqBody) {
        for (var e = 0; e < reqBody.entry.length; e++) {
            for (var m = 0; m < reqBody.entry[e].messaging.length; m++) {
                var facebookMessage = reqBody.entry[e].messaging[m]
                let userId = facebookMessage.sender.id

                // quick replies
                if (facebookMessage.message.quick_reply) {
                    var result = this.dialogflow.detectIntentText(facebookMessage.message.quick_reply.payload)
                    var responseArray = result.queryResult.responseMessages
                    this.messageRouter(responseArray, userId)
                }
                // normal text messages
                else if (facebookMessage.message) {
                    var result = await this.dialogflow.detectIntentText(facebookMessage.message.text)
                    var responseArray = result.queryResult.responseMessages
                    this.messageRouter(responseArray, userId)
                }
                // post back messages
                else if (facebookMessage.postback) {
                    var result = this.dialogflow.detectIntentText(facebookMessage.message.postback.payload)
                    var responseArray = result.queryResult.responseMessages
                    this.messageRouter(responseArray, userId)
                }
                else {
                    console.log('Got an unexpected message from Facebook: ', facebookMessage)
                }
            }
        }
    }

    async messageRouter (responseArray, userId) {
        for (const response of responseArray) {
            if (response.message === 'text') {
                await sendMessage.sendTextMessage(userId, response)
            }
            else if (response.message === 'payload') {
                await sendMessage.sendPayload(userId, response)
            }
            else {
                console.log('Unexpected response from Dialogflow: ', response)
            }
        }
    }
}
exports.Facebook = Facebook
