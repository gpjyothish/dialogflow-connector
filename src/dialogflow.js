const {SessionsClient} = require('@google-cloud/dialogflow-cx')
const client = new SessionsClient()

class Dialogflow {
    constructor(config, webserver) {
        this.config = config
        this.webserver = webserver
    }

    async detectIntentText(queryText) {
        const projectId = process.env.DIALOGFLOW_PROJECT_ID
        const location = process.env.DIALOGFLOW_AGENT_LOCATION
        const agentId = process.env.DIALOGFLOW_AGENT_ID
    
        const query = [`${queryText}`]
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
exports.Dialogflow = Dialogflow
