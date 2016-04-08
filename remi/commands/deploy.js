'use strict'

require('colors')

const inquirer = require('inquirer')

module.exports = require('ronin').Command.extend({
    desc: 'Deploy a new application to Remi slaves.',

    run: () => {
        const server = require('../lib/server')

        server.on('ready', () => {
            console.log(`${'[REMI]'.green} Server is ready.`)
            
            inquirer.prompt([{
                type: 'input',
                name: 'name',
                message: 'Application name:'
            }, {
                type: 'input',
                name: 'git',
                message: 'SSH GIT URL:'
                // git ls-remote to test this
            }, {
                type: 'checkbox',
                name: 'tags',
                choices: ['app','db','processing'],
                message: 'Choose tags:'
            }, {
                type: 'input',
                name: 'scale',
                message: 'Scale:',
                default: 1,
                filter: (input) => {
                    return parseInt(input)
                }
            }], (answers) => {
                console.log(answers)
                
                server.deploy(answers, (err, data) => {
                    console.log('DEPLOY GOT ::', err, data)

                    process.exit(0)
                })
            })
        })
    }
})