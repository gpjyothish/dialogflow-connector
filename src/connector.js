var express = require('express')
var bodyParser = require('body-parser')
var http = require('http')
const {SessionsClient} = require('@google-cloud/dialogflow-cx')
const client = new SessionsClient()

const { Facebook } = require('./channels/facebook')

class Connector {
    constructor(config) {
        this.config = config
        
        if (!this.config.webhook_uri) {
            this.config.webhook_uri = 'api/messages'
        }
        this.webserver = express()
        
        // parsing
        this.webserver.use(bodyParser.json())
        this.webserver.use(bodyParser.urlencoded({ extended: true }))

        this.http = http.createServer(this.webserver)

        this.http.listen(process.env.port || process.env.PORT || 4000, () => {
            console.log('Express webserver configured and listening at ' + process.env.PORT || 4000)
        })
        
        this.configureWebhookEndpoint()
        this.channelRouter()
    }

    /*
     * Set up a web endpoint to receive incoming messages
     */
    configureWebhookEndpoint() {
        if (this.webserver) {
            this.webserver.post(this.config.webhook_uri, async (req, res) => {
                res.send('ok')
                console.log(JSON.stringify(req.body))
                var result = await this.detectIntentText()
            })
        }
        else {
            throw new Error('Cannot configure webhook endpoints when webserver is disabled');
        }
    }

    channelRouter () {
        if (this.config.chennels.facebook) {
            const FacebookConnector = new Facebook(this.config, this.webserver)
        }
    }

    async detectIntentText() {
        const projectId = process.env.DIALOGFLOW_PROJECT_ID
        const location = process.env.DIALOGFLOW_AGENT_LOCATION
        const agentId = process.env.DIALOGFLOW_AGENT_ID
        const query = ['start']
        const languageCode = 'en'

        const sessionId = Math.random().toString(36).substring(7)
        const sessionPath = client.projectLocationAgentSessionPath(
            projectId,
            location,
            agentId,
            sessionId
        )
        const request = {
            session: sessionPath,
            queryInput: {
              text: {
                    text: query
                },
                languageCode
            }
        }

        const [response] = await client.detectIntent(request)
        console.log(`User Query: ${query}`)

        for (const message of response.queryResult.responseMessages) {
            if (message.text) {
                console.log(`Agent Response: ${message.text.text}`)
            }
        }
        if (response.queryResult.match.intent) {
            console.log(`Matched Intent: ${response.queryResult.match.intent.displayName}`)
        }
        console.log(`Current Page: ${response.queryResult.currentPage.displayName}`)
    }
}
exports.Connector = Connector