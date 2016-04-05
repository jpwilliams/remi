'use strict'

const net = require('net')
const json_socket = require('json-socket')
const Emitter = require('events').EventEmitter
const daemon = require('daemon')
const colors = require('colors')
const cli = require('cli')
const socket_path = '/Users/jackwilliams/.remi/server.sock'

const Server = module.exports = new Emitter()
Server.connection = null
Server.socket = null
Server.triggered = false
Server.callbacks = {}

init()

function init () {
    Server.socket = new json_socket(new net.Socket())

    Server.socket.on('connect', () => {
        if (Server.triggered) {
            cli.spinner(`${'[REMI]'.green} No master daemon found; starting... ${'success'.green}.`, true)
        }

        console.log(`${'[REMI]'.green} Connected to ${'master'.yellow} daemon.`)

        set_events()
        start()
    })

    Server.socket.on('error', () => {
        Server.socket = null

        if (Server.triggered) {
            return setTimeout(() => {
                init()
            }, 1000)
        }

        cli.spinner(`${'[REMI]'.green} No master daemon found; starting... `)
        daemon.daemon(`${process.cwd()}/lib/server_daemon.js`)
        Server.triggered = true

        init()
    })

    Server.socket.connect(socket_path)
}

function start () {
    Server.emit('ready')
}

function set_events () {
    Server.test = function () {
        Server.socket.on('message', (data) => {
            console.log('got back test data ::', data)
        })

        Server.socket.sendMessage({a:1, b:14})
    }






    Server.generate_git_key = function (callback) {
        Server.socket.on('message', (data) => {
            return callback(data.key)
        })

        Server.socket.sendMessage({
            task: 'generate_git_key'
        })
    }






    Server.get_git_key = function (callback) {
        Server.socket.on('message', (data) => {
            return callback(data.key)
        })

        Server.socket.sendMessage({
            task: 'get_git_key'
        })
    }
}