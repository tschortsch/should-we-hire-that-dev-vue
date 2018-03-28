var express = require('express')
var serveStatic = require('serve-static')
const request = require('request')
var enforce = require('express-sslify')
app = express()
app.use(serveStatic(__dirname + "/dist"))
app.use(enforce.HTTPS({ trustProtoHeader: true }))
require('dotenv').config()
var port = process.env.PORT || 5000
var clientId = process.env.GH_CLIENT_ID || ''
var clientSecret = process.env.GH_CLIENT_SECRET || ''
var router = express.Router()

router.get('/auth', function(req, res) {
  if (req.query.code) {
    var options = {
      url: 'https://github.com/login/oauth/access_token',
      method: 'POST',
      headers: {
        accept: 'application/json',
        'User-Agent': 'swhtd-app'
      },
      form: {
        'client_id': clientId,
        'client_secret': clientSecret,
        'code': req.query.code
      }
    }
    new Promise((resolve, reject) => {
      request(options, function (err, res, body) {
        let json = JSON.parse(body);
        if (json.error) {
          reject(json.error)
        }
        if (json.access_token) {
          resolve(json.access_token)
        }
      })
    }).then((accessToken) => {
      res.redirect('/token/' + accessToken)
    }).catch((error) => {
      console.log('There was an error during the authorization. Error: ' + error)
      res.redirect('/')
    })
  } else {
    console.log('Authorization code missing.')
    res.redirect('/')
  }
})

// Catch all routes and redirect to the index file
router.get('*', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
})

// Register the router
app.use('/', router)
// Start the server
app.listen(port, function () {
  console.log('Server listening on port ' + port)
});
