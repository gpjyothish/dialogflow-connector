const sendRequest = require('./sendRequest')
var options = {
    url: 'https://graph.facebook.com/v9.0/me/messages',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    qs: {
        access_token: process.env.FACEBOOK_ACCESS_TOKEN
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
        var facebookMessageObj = messageObject.payload.fields.facebook.structValue.fields
        // ToDo: implemnt facebook send API
        if (facebookMessageObj.quick_replies) {
            let replyText = facebookMessageObj.text.stringValue
            let repliesList = facebookMessageObj.quick_replies.listValue.values
            await sendQuickReplies(userId, replyText, repliesList)
        }
        else if (facebookMessageObj.attachment.structValue.fields.type.stringValue === 'template') {
            var templetePayload = facebookMessageObj.attachment.structValue.fields.payload
            var templateType = templetePayload.structValue.fields.template_type.stringValue
            
            // check the type of template
            if (templateType === 'generic') {
                var cardElements = templetePayload.structValue.fields.elements.listValue.values
                await sendGenericTemplate(userId, cardElements)
            }
        }
        else {
            console.log('Unexpected response from Dialogflow: ', messageObject)
        }
    }
}

async function sendQuickReplies (userId, replyText, repliesList) {
    var repliesObj = []
    // form the replies
    for (const replies of repliesList) {
        var reply = {
            'content_type': 'text',
            'title': `${replies.structValue.fields.text.stringValue}`,
            'payload': `${replies.structValue.fields.payload.stringValue}`
        }
        repliesObj.push(reply)
    }
    options.body = JSON.stringify({
        'messaging_type': 'RESPONSE',
        'recipient': {
            'id': userId
        },
        'message': {
            'text': `${replyText}`,
            'quick_replies': repliesObj
        }
    })
    return sendRequest.makeRequest(options)
}

async function sendGenericTemplate (userId, cardElements) {
    var elementList = []

    // loop through the elements and form the element list
    for (const element of cardElements) {
        var title = element.structValue.fields.title.stringValue
        
        if (element.structValue.fields.subtitle) {
            var subtitle = element.structValue.fields.subtitle.stringValue
        }
        if (element.structValue.fields.image_url) {
            var image = element.structValue.fields.image_url.stringValue
        }
        if (element.structValue.fields.buttons) {
            var buttonObj = element.structValue.fields.buttons.listValue.values
            var buttonList = []
            
            // loop through the buttonObj and form buttonList
            for (const button of buttonObj) {
                var buttonType = button.structValue.fields.type.stringValue
                if (buttonType === 'postback') {
                    var buttonItem = {
                        'type': 'postback',
                        'title': `${button.structValue.fields.title.stringValue}`,
                        'payload': `${button.structValue.fields.payload.stringValue}`
                    }
                }
                else if (buttonType === 'web_url') {
                    var buttonItem = {
                        'type': 'web_url',
                        'title': `${button.structValue.fields.title.stringValue}`,
                        'url': `${button.structValue.fields.url.stringValue}`
                    }
                }
                else {
                    console.log('Sorry, invalid button type: ', buttonType)
                    return
                }
                buttonList.push(buttonItem)
            }
        }
        var elementItem = {
            'title': `${title}`
        }
        if (subtitle) {
            elementItem.subtitle = `${subtitle}`
        }
        if (image) {
            elementItem.image_url = `${image}`
        }
        if (buttonList) {
            elementItem.buttons = buttonList
        }
        elementList.push(elementItem)
    }

    options.body = JSON.stringify({
        'messaging_type': 'RESPONSE',
        'recipient': {
            'id': userId
        },
        'message': {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'generic',
                    'elements': elementList
                }
            }
        }
    })
    return sendRequest.makeRequest(options)
}