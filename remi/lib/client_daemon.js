'use strict'

const net = require('net')
const json_socket = require('json-socket')
const keygen = require('ssh-keygen')
const Emitter = require('events').EventEmitter
const uuid = require('uuid').v4
const socket_path = '/Users/jackwilliams/.remi/client.sock'

const Client = module.exports = new Emitter()
Client.version = require('../package.json').version

Client.name = 'remi-client'
Client.amq_url = 'amqp://localhost'
Client.db_url = 'mongodb://localhost:27017/remi'
Client.server = null
Client.socket = null
Client.id = null

Client.boot = function boot () {
    require('fs').unlink(socket_path, () => {
        Client.server = net.createServer()

        Client.server.on('connection', (socket) => {
            socket = new json_socket(socket)

            socket.on('message', (data) => {
                const task = data.task

                Client[task](data.args, (err, data) => {
                    socket.sendEndMessage({ err, data, task })
                })
            })
        })

        Client.server.listen(socket_path, () => {
            Client.emit('ready')
        })
    })
}

Client.init = function init () {
    require('fs').readFile('/Users/jackwilliams/.remi/client_id', (err, data) => {
        if (!err && data) {
            Client.id = data

            return Client.boot()
        }

        Client.id = uuid()

        require('fs').writeFile('/Users/jackwilliams/.remi/client_id', Client.id, (err) => {
            return Client.boot()
        })
    }) 
}

Client.init()






Client.register = function (args, done) {
    return done(null, {reg: true})
}