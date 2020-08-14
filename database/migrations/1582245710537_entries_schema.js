'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EntriesSchema extends Schema {
  up () {
    this.create('entries', (table) => {
      table.increments()
      table.integer('trainer_id').notNullable()
      table.integer('user_id').notNullable()
      table.datetime('time')
      table.string('client').notNullable()
      table.decimal('amount', 5, 2)
      table.string('paid')
      table.string('method')
      table.timestamps()
    })
  }

  down () {
    this.drop('entries')
  }
}

module.exports = EntriesSchema
