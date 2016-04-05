'use strict'

require('colors')

module.exports = require('ronin').Command.extend({
    desc: 'Start up a Remi server.',

    run: () => {
        const server = require('../lib/server')

        server.on('ready', () => {
            console.log(`${'[REMI]'.green} Server is ready.`)
            process.exit(0)
        })
    }
})