const express = require('express')
const sslRedirect = require('heroku-ssl-redirect')
const serveStatic = require('serve-static')
const request = require('request')
const path = require('path')
const history = require('connect-history-api-fallback')

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

// History API fallback
app.use(history())

// Enable hot middleware on dev environment
if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const webpackConfig = require('../build/webpack.dev.conf')
  const compiler = webpack(webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    stats: {
      colors: true
    }
  }))

  app.use(require('webpack-hot-middleware')(compiler))
}

app.use(serveStatic(distPath))

// Start the server
let server = app.listen(port, function () {
  console.log('Server listening on port ' + port)
}).on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Error: Port ' + port + ' already in use!')
  } else {
    console.log('Error: ' + e)
  }
  server.close()
  process.exit()
})
