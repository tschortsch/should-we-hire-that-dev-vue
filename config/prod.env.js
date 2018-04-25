'use strict'
require('dotenv').config()

module.exports = {
  NODE_ENV: '"production"',
  GH_CLIENT_ID: JSON.stringify(process.env.GH_CLIENT_ID),
  GA_TRACKING_ID: JSON.stringify(process.env.GA_TRACKING_ID),
  SITE_URL: JSON.stringify(process.env.SITE_URL)
}
