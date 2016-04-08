'use strict'

const net = require('net')
const json_socket = require('json-socket')
const keygen = require('ssh-keygen')
const Emitter = require('events').EventEmitter
const uuid = require('uuid').v4
const colors = require('colors')
const async = require('async')
const socket_path = `${process.env.HOME}/.remi/server.sock`

const mongodb = require('mongodb')
const ObjectID = mongodb.ObjectID
let db

const remit = require('remit')({
    name: 'remi-server',
    url: 'amqp://localhost'
})

const Server = module.exports = new Emitter()
Server.version = require('../package.json').version

Server.name = 'remi-server'
Server.amq_url = 'amqp://localhost'
Server.db_url = 'mongodb://localhost:27017/remi'
Server.server = null
Server.socket = null
Server.id = null

Server.boot = function boot () {
    async.waterfall([
        function mongo (next) {
            mongodb.MongoClient.connect(Server.db_url, (err, connection) => {
                if (err) {
                    throw new Error(err)
                }

                db = connection

                return next()
            })
        },

        function socket (next) {
            require('fs').unlink(socket_path, () => {
                Server.server = net.createServer()

                Server.server.on('connection', (socket) => {
                    socket = new json_socket(socket)

                    socket.on('message', (data) => {
                        const task = data.task

                        Server[task](data.args, (err, data) => {
                            socket.sendEndMessage({ err, data, task })
                        })
                    })
                })

                Server.server.on('error', (err) => {
                    console.error(`${'[REMI]'.green} ${err.toString().red}`)

                    return next(true)
                })

                Server.server.listen(socket_path, () => {
                    console.log('Hosting server')
                    
                    return next()
                })
            })
        }
    ], (err) => {
        if (err) {
            process.exit(1)
        }

        Server.emit('ready')
    })
}

Server.init = function init () {
    require('fs').readFile('/Users/jackwilliams/.remi/server_id', (err, data) => {
        if (!err && data) {
            Server.id = data

            return Server.boot()
        }

        Server.id = uuid()

        require('fs').writeFile('/Users/jackwilliams/.remi/server_id', Server.id, (err) => {
            return Server.boot()
        })
    }) 
}

Server.init()






Server.get_git_key = function (args, done) {
    db.collection('config').find().limit(1).next((err, config) => {
        console.log('tuyrg', err, config)

        if (err) {
            return done(err)
        }

        if (config && config.key) {
            return done(null, config.key)
        }

        console.log('genning git key')

        Server.generate_git_key({}, (err, key) => {
            console.log('gugg', err, key)

            return done(err, key)
        })
    })
}






Server.generate_git_key = function (args, done) {
    keygen({
        location: `${process.env.HOME}/.remi/ssh_key`,
        comment: `remi@${require('os').hostname()}`,
        read: true,
        force: true
    }, (err, out) => {
        db.collection('config').updateOne({}, {
            $setOnInsert: {key: out.pubKey}
        }, {upsert: true}, (err, result) => {
            return done(err, out.pubKey)
        })
    })
}






Server.deploy = function deploy (args, done) {
    return done(null, 'OKTHENDPLEOEd')
}






remit.res('remi.register', (args, done, extra) => {
    console.log(args)

    if (!args.id) {
        return done('No ID provided')
    }

    args.tags = args.tags || []

    if (args.tags.length < 1) {
        console.log('errrr')

        return done('At least 1 tag must be provided')
    }

    let query = [`slaves:${args.id}`].concat(args.tags)

    db.collection('slaves').updateOne({uuid: args.id}, {
        $setOnInsert: {
            uuid: args.id,
            tags: args.tags
        }
    }, {
        upsert: true
    }, (err, result) => {
        return done(err, true)
    })
})






remit.res('remi.key', (args, done, extra) => { 
    Server.get_git_key({}, (key) => {
        return done(null, key)
    })
})