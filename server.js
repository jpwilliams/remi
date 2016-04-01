'use strict'

const service_name = 'remi-server'

const remit = require('remit')({
    name: service_name,
    url: process.env.REMI_URL || 'amqp://localhost',
    exchange: 'remi'
})

const log = require('remit-bunyan')(service_name, remit)

const colors = require('colors')

remit.res('remis.register', register_new_server)






function register_new_server (args, done, extra) {
    console.log(`New server ${args.hostname.green} asking to be registered...`)

    return done()
}