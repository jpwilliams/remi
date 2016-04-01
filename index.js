'use strict'

const Emitter = require('events').EventEmitter
const joi = require('joi')
const colors = require('colors')
const ssh = require('./ssh')
const os = require('os')
const cli = require('cli')
require('console-group').install()

const pm2 = require('pm2')

const api = module.exports = new Emitter()
api.version = require('./package.json').version

const remit = require('remit')({
    name: 'remi-client',
    url: process.env.REMI_URL || 'amqp://localhost',
    exchange: 'remi'
})

pm2.pm2Init()

pm2.connect(() => {
    api.emit('ready')
})

// const config = require('./config.json')

api.add_server = function add_server (url) {
    console.log(`Adding a new server at ${url.green}.`)
    console.log(`Trying to SSH to server...`)

    ssh(url, (con) => {
        console.log(`Connected to ${url.green}.`)

        con.exec('pm2 jlist', (err, stream) => {
            let data = ''

            stream.on('data', (chunk) => {
                data += chunk.toString()
            })

            stream.on('close', () => {
                console.log(data)
            })
        })
    })
}

api.remove_server = function remove_server (args) {}

api.register = function register (done) {
    cli.spinner(`Registering this server as a new ${'Remi'.yellow} client...`)

    remit.req('remis.register', {
        hostname: os.hostname()
    }, (err, data) => {
        if (err) {
            console.group()
            console.log(JSON.stringify(err, null, 2).blue)
            console.groupEnd()

            cli.spinner(`Registering this server as a new ${'Remi'.yellow} client... failed.`, true)

            return done(err)
        }

        cli.spinner(`Registering this server as a new ${'Remi'.yellow} client... ${'success'.green}.`, true)

        return done()
    })
}