# Should we hire that dev?

[![Build Status](https://travis-ci.org/tschortsch/should-we-hire-that-dev-vue.svg?branch=master)](https://travis-ci.org/tschortsch/should-we-hire-that-dev-vue)
[![dependencies Status](https://david-dm.org/tschortsch/should-we-hire-that-dev-vue/status.svg)](https://david-dm.org/tschortsch/should-we-hire-that-dev-vue)
[![devDependencies Status](https://david-dm.org/tschortsch/should-we-hire-that-dev-vue/dev-status.svg)](https://david-dm.org/tschortsch/should-we-hire-that-dev-vue?type=dev)

Gathers public information of a given GitHub user and generates statistics about it.
It also shows the most used programming languages.

Try it out: https://shouldwehi.re

## Development

1. Install dependencies
   ``` bash
   $ yarn install
   or
   $ npm install
   ```
1. Copy & configure environment variables
   ``` bash
   $ cp .env.dist .env
   ```
1. Run development server with hot reload
   ``` bash
   $ yarn start
   or
   $ npm run start
   ```
1. Open browser with [http://localhost:5000](http://localhost:5000) (or defined port)

### Further npm commands

``` bash
# serve with hot reload at localhost:5000
yarn start

# build for production with minification
yarn build

# build for production and view the bundle analyzer report
yarn build --report

# run unit tests
yarn unit

# run all tests
yarn test
```
