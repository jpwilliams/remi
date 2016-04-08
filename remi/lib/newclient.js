'use strict'

process.on('beforeExit', () => {
    console.log('wtf happened?')
})

const net = require('net')
const json_socket = require('json-socket')
const Emitter = require('events').EventEmitter
const fs = require('fs')
const socket_path = '/Users/jackwilliams/.remi/client.sock'
const child = require('child_process')

let remit

const Client = module.exports = new Emitter()

Client.boot = function boot (start_master) {
    start_master = (start_master === 'true') ? true : false

    if (start_master) {
        return new MasterClient()
    }

    const socket = new json_socket(new net.Socket())

    socket.on('connect', () => {
        return new SlaveClient(socket)
    })

    socket.on('error', (err) => {
        return new MasterClient()
    })

    socket.connect(socket_path)
}

Client.boot(process.argv[2])






function MasterClient () {
    const self = this

    // If we're not a child...
    if (!process.send) {
        const p = child.fork(__dirname + '/newclient', ['true'])

        p.on('message', (data) => {
            if (data === 'online') {
                new SlaveClient()
            } else {
                throw new Error('Fuck')
            }
        })
    } else {
        self.type = 'master'

        fs.unlink(socket_path, () => {
            const server = net.createServer()

            server.on('connection', (socket) => {
                socket = new json_socket(socket)

                socket.on('message', (data) => {
                    self[data.event](data.args, (err, data) => {
                        socket.sendMessage({ err, data })
                    })
                })
            })

            server.on('error', (err) => {
                console.log('SERVER ERROR ::', err)
            })

            server.listen(socket_path, () => {
                self.set_events()
                process.send('online')
            })
        })
    }
}






MasterClient.prototype.set_events = function set_events () {
    const self = this

    self.test = function test (args, done) {
        console.log('Master got a test request with ::', args)

        return done(null, 'This the response from the real test.')
    }

    return self
}






function SlaveClient (socket) {
    const self = this

    self.type = 'slave'

    if (socket) {
        set_events(socket)
        Client.emit('ready', self)
    } else {
        socket = new json_socket(new net.Socket())

        socket.on('connect', () => {
            set_events(socket)
            Client.emit('ready', self)
        })

        socket.on('error', (err) => {
            console.log('Connection failed hahahahaha', err)
        })

        socket.connect(socket_path)
    }

    function set_events (socket) {
        const available_tasks = [
            'test'
        ]

        Array.from(available_tasks).forEach((task) => {
            self[task] = function (args, done) {
                function data_fetch (data) {
                    return done(data.err, data.data)
                }

                socket.removeAllListeners('message')
                socket.on('message', data_fetch)

                socket.sendMessage({
                    event: task,
                    args: args
                })
            }
        })
    }
}