'use strict'

const net = require('net')
const json_socket = require('json-socket')
const Emitter = require('events').EventEmitter
const daemon = require('daemon')
const colors = require('colors')
const cli = require('cli')
const socket_path = '/Users/jackwilliams/.remi/client.sock'

const Client = module.exports = new Emitter()
Client.connection = null
Client.socket = null
Client.triggered = false
Client.callbacks = {}

init()

function init () {
    Client.socket = new json_socket(new net.Socket())

    Client.socket.on('connect', () => {
        if (Client.triggered) {
            cli.spinner(`${'[REMI]'.green} No slave daemon found; starting... ${'success'.green}.`, true)
        }

        console.log(`${'[REMI]'.green} Connected to ${'slave'.yellow} daemon.`)

        set_events()
        start()
    })

    Client.socket.on('error', () => {
        Client.socket = null

        if (Client.triggered) {
            return setTimeout(() => {
                init()
            }, 1000)
        }

        cli.spinner(`${'[REMI]'.green} No slave daemon found; starting... `)
        daemon.daemon(`${process.cwd()}/lib/client_daemon.js`)
        Client.triggered = true

        init()
    })

    Client.socket.connect(socket_path)
}

function start () {
    Client.emit('ready')
}

function set_events () {
    Client.register = function (callback) {
        Client.socket.on('message', (data) => {
            return callback(data)
        })

        Client.socket.sendMessage({
            task: 'register'
        })
    }
}