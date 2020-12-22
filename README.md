# Dialogflow CX: Social Media Channels Connector
The Dialogflow CX is a great place to build more complex conversational assistants. But one of the challenges that developers face is that of limited channel support. At present, it only supports several telephony partners and beta support for Dialogflow messenger (web platform).

The **dialogflow-connector** focuses to provide different social media channel connections that you can use with your Dialogflow CX agent. You can focus on designing the agent with responses as custom payloads.

Right now we provide support for only the below channels:
- Facebook messenger

## Quickstart
### Before you begin
- [Select or create a Cloud Platform project](https://console.cloud.google.com/project).
- [Enable billing for your project](https://support.google.com/cloud/answer/6293499#enable-billing).
- [Enable the Dialogflow CX API API](https://console.cloud.google.com/flows/enableapi?apiid=dialogflow.googleapis.com).
- [Set up authentication with a service account](https://cloud.google.com/docs/authentication/getting-started) so you can access the API from your local workstation.

## Installing the library

Install the library with **npm**
```bash
npm install dialogflow-connector --save
```
## Using the client library
As part of the **Before you begin** step, you have set-up the authentication with a service account. Now, you have to set-up some other environment variables for your application.

- DIALOGFLOW_PROJECT_ID (The project id the agent uses)
- DIALOGFLOW_AGENT_LOCATION (The location that the agent uses. You can set this variable as **global** or any other specific location that you want to use.)
- DIALOGFLOW_AGENT_ID (The dialogflow agent id which can be found in the service account that you have created.)

Now, create a file named **index.js** or any name that you preder and paste the below script with the facebook app and page credentials to connect with dialogflow agent.

``` bash
const { Connector } = require('dialogflow-connector')

const ChannelConnector = new Connector({
    webhook_uri: '/api/messages',
    chennels: {
        'facebook': {
            verify_token: <FACEBOOK_VERIFY_TOKEN>,
            access_token: <FACEBOOK_ACCESS_TOKEN>
        }
    }
})
```
Now, run the application with ngrok and you can now receive the facebook events from your page using the ngrok tunnel.

## Supported Message Types
- Simple Text messages
- Quick replies
- Button Template
- Generic Template

## Custom Payload Structure

For the simple text messages, you can define the responses as normal text responses in the agent.

### Quick replies
``` bash
{
    "facebook": {
        "quick_replies": [
            {
                "text": "Reply 1",
                "payload": "PayloadOne"
            },
            {
                "text": "Reply 2",
                "payload": "PayloadTwo"
            }
        ],
        "text": "These are quick replies."
    }
}
```
### Button template
``` bash
{
    "facebook": {
        "attachment": {
            "payload": {
                "template_type": "button",
                "text": "This is button template.",
                "buttons": [
                    {
                        "payload": "PayloadOne",
                        "title": "Button 1",
                        "type": "postback"
                    },
                    {
                        "url": "https://github.com/gpjyothish/dialogflow-connector",
                        "title": "Open Page",
                        "type": "web_url"
                    }
                ]
            },
            "type": "template"
        }
    }
}
```
### Generic Template
``` bash
{
    "facebook": {
        "attachment": {
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "buttons": [
                            {
                                "payload": "ButtonPayload",
                                "title": "Button Name",
                                "type": "postback"
                            }
                        ],
                        "title": "Sample Card 1",
                        "subtitle": "Sample subtitle",
                        "image_url": "https://ibb.co/rsg2q5t"
                    },
                    {
                        "buttons": [
                            {
                                "url": "https://github.com/gpjyothish/dialogflow-connector",
                                "title": "Open Page",
                                "type": "web_url"
                            }
                        ],
                        "title": "Sample Card 2",
                        "subtitle": "Sample subtitle",
                        "image_url": "https://ibb.co/rsg2q5t"
                    }
                ]
            },
            "type": "template"
        }
    }
}
```
