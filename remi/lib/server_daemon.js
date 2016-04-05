'use strict'

const net = require('net')
const json_socket = require('json-socket')
const keygen = require('ssh-keygen')
const Emitter = require('events').EventEmitter
const socket_path = '/Users/jackwilliams/.remi/server.sock'

const redis = require('redis')
const db = redis.createClient()
db.on('error', console.error)

const Server = module.exports = new Emitter()
Server.version = require('../package.json').version

Server.name = 'remi-server'
Server.amq_url = 'amqp://localhost'
Server.db_url = 'mongodb://localhost:27017/remi'
Server.server = null
Server.socket = null

Server.boot = function boot () {
    require('fs').unlink(socket_path, () => {
        Server.server = net.createServer()

        Server.server.on('connection', (socket) => {
            socket = new json_socket(socket)

            socket.on('message', (data) => {
                const task = data.task

                Server[task](data.args, (err, data) => {
                    socket.sendEndMessage({ err, key: data, task })
                })
            })
        })

        Server.server.listen(socket_path, () => {
            console.log('Hosting server')
            Server.emit('ready')
        })
    })
}

Server.boot()






Server.get_git_key = function (args, done) {
    db.get('git_key', (err, key) => {
        if (err || !key) {
            return Server.generate_git_key({}, (err, key) => {
                return done(err, key)
            })
        }

         return done(err, key)
    })
}






Server.generate_git_key = function (args, done) {
    keygen({
        location: `${process.env.HOME}/.remi/ssh_key`,
        comment: `remi@${require('os').hostname()}`,
        read: true,
        force: true
    }, (err, out) => {
        db.set('git_key', out.pubKey, (err) => {
            return done(err, out.pubKey)
        })
    })
}