'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TrainersSchema extends Schema {
  up () {
    this.create('trainers', (table) => {
      table.increments()
      table.string('name').notNullable().unique()
      table.string('phone').notNullable().unique()
      table.string('email').notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('trainers')
  }
}

module.exports = TrainersSchema
