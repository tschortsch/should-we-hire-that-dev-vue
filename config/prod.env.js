'use strict'
require('dotenv').config()

module.exports = {
  NODE_ENV: '"production"',
  GH_CLIENT_ID: JSON.stringify(process.env.GH_CLIENT_ID)
}
