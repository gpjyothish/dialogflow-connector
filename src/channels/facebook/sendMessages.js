const sendRequest = require('./sendRequest')
var options = {
    url: 'https://graph.facebook.com/v9.0/me/messages',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN
    }
}

module.exports = {
    sendTextMessage: async function (userId, messageObject) {
        options.body = JSON.stringify({
            'messaging_type': 'RESPONSE',
            'recipient': {
                'id': userId
            },
            'message': {
                'text': messageObject.text.text[0]
            }
        })
        return sendRequest.makeRequest(options)      
    },

    sendPayload: async function(userId, messageObject) {
        // ToDo: implemnt facebook send API
    }
}
