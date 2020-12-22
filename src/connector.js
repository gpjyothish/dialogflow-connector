var express = require('express')
var bodyParser = require('body-parser')
var http = require('http')
// load environment variables,
require('dotenv').config()

const { Facebook } = require('./channels/facebook/index')

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
                this.messageRouter(req.body)
            })
        }
        else {
            throw new Error('Cannot configure webhook endpoints when webserver is disabled');
        }
    }

    channelRouter () {
        if (this.config.chennels.facebook) {
            this.FacebookConnector = new Facebook(this.config, this.webserver)
        }
    }

    messageRouter (reqBody) {
        if (this.config.chennels.facebook) {
            this.FacebookConnector.messageHandler(reqBody)
        }
    }
}
exports.Connector = Connector