'use strict'

const proper = require('./newclient')

proper.on('ready', (api) => {
    console.log(api)

    api.test({username: 'jack'}, (err, data) => {
        console.log('WOOOO CALLBACK ::', err, data)

        api.test({}, (err, data) => {
            console.log('and again!')

            process.exit(0)
        })
    })
})