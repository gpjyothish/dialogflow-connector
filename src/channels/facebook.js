class Facebook {
    constructor(config, webserver) {
        this.config = config
        this.webserver = webserver

        if (!this.config.webhook_uri) {
            this.config.webhook_uri = 'api/messages'
        }
        this.hubVerification ()
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
}
exports.Facebook = Facebook
