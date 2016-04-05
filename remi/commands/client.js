'use strict'

require('colors')

module.exports = require('ronin').Command.extend({
    desc: 'Start up a Remi client.',

    run: () => {
        const client = require('../lib/client')

        client.on('ready', () => {
            console.log(`${'[REMI]'.green} Client is ready.`)
            process.exit(0)
        })
    }
})