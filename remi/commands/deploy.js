'use strict'

module.exports = require('ronin').Command.extend({
    desc: `Deploy a new application to Remi slaves.`,

    run: () => {
        process.exit(0)
    }
})