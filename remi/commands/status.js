'use strict'

const async = require('async')
require('colors')

module.exports = require('ronin').Command.extend({
    desc: 'Show the status of Remi masters and slaves on this server.',

    run: () => {
        process.exit(0)
    }
})