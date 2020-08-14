'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Trainer extends Model {
    entries () {
        return this.hasMany('App/Models/Entry')
    }
}

module.exports = Trainer
