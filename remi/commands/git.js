'use strict'

const inquirer = require('inquirer')
const colors = require('colors')
const cli = require('cli')
let server

module.exports = require('ronin').Command.extend({
    desc: `Displays the current master git key, generating a new one if it doesn't exist.`,

    options: {
        regen: {
            type: 'boolean',
            alias: 'r'
        }
    },

    run: (regen) => {
        if (regen) {
            inquirer.prompt([{
                type: 'confirm',
                name: 'continue',
                message: 'This will regenerate the master GIT key and make any current GIT connections redundant. Are you sure?',
                default: false
            }], (answers) => {
                if (!answers.continue) {
                    console.log('Aborted'.red)

                    process.exit(0)
                }

                

                generate_git_key((err, key) => {
                    console.log(`\n${key}\n`)
                    process.exit(0)
                })
            })
        } else {
            get_git_key((err, key) => {
                console.log(`\n${key}\n`)
                process.exit(0)
            })
        }
    }
})






function get_git_key (done) {
    server = require('../lib/server')

    server.on('ready', () => {
        cli.spinner(`${'[REMI]'.green} Retrieving GIT key... `)

        server.get_git_key((err, key) => {
            cli.spinner(`${'[REMI]'.green} Retrieving GIT key... ${'success'.green}.`, true)

            return done(err, key)
        })
    })
}






function generate_git_key (done) {
    server = require('../lib/server')

    server.on('ready', () => {
        cli.spinner(`${'[REMI]'.green} Regenerating GIT key... `)

        server.generate_git_key((err, key) => {
            cli.spinner(`${'[REMI]'.green} Regenerating GIT key... ${'success'.green}.`, true)

            return done(err, key)
        })
    })
}