const express = require('express')
const sslRedirect = require('heroku-ssl-redirect')
const serveStatic = require('serve-static')
const request = require('request')
const path = require('path')

// Configuration
require('dotenv').config()
const port = process.env.PORT || 5000
const clientId = process.env.GH_CLIENT_ID || ''
const clientSecret = process.env.GH_CLIENT_SECRET || ''
const distPath = path.join(__dirname, '/../dist')

// initialize server
let app = express()

// enforce https
app.use(sslRedirect())

app.get('/auth', function (req, res) {
  if (req.query.code) {
    const options = {
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
        if (err) {
          reject(err)
        }
        let json = JSON.parse(body)
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

app.use(serveStatic(distPath))

// Catch all routes and redirect to the index file
app.get('*', function (req, res) {
  res.sendFile(path.join(distPath, '/index.html'))
})

// Start the server
app.listen(port, function () {
  console.log('Server listening on port ' + port)
})
