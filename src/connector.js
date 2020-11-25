var express = require('express')
var bodyParser = require('body-parser')
var dotenv = require('dotenv')
var http = require('http')

// load environment variables,
require('dotenv').config()

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
        // If a webserver has been configured, auto-configure the default webhook url
        if (this.webserver) {
            this.configureWebhookEndpoint()
        }
    }

    /*
     * Set up a web endpoint to receive incoming messages
     */
    configureWebhookEndpoint() {
        if (this.webserver) {
            this.webserver.post(this._config.webhook_uri, (req, res) => {
                res.send('ok')
                console.log(req.body)
            })
        }
        else {
            throw new Error('Cannot configure webhook endpoints when webserver is disabled');
        }
    }
}
exports.Connector = Connector