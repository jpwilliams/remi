'use strict'

module.exports = require('ronin').Command.extend({
    desc: `Scale a deployed application across Remi slaves.`,

    run: (app, amount) => {
        if (!app) {
            throw new Error('An app name must be specified')
        }

        if (!amount) {
            throw new Error('A scaling amount must be specified')
        }
        
        process.exit(0)
    }
})