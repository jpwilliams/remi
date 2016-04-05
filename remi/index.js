'use strict'

const ronin = require('ronin')

const program = ronin({
    path: __dirname,
    desc: 'A node.js deployment platform.'
})

program.run()
