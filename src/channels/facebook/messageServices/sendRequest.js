var request = require('request')

module.exports = {
	makeRequest(options) {
	  	return new Promise(function(resolve, reject) {
			request(options, function (err, res, body) {
				if (err) {
					console.log('error in api: ', err)
					reject(err)
				}
				try {
					resolve({'status': res.statusCode, 'body': body})
				}
				catch (ex) {
					reject(ex)
				}
			})
	  	})
	}
}
