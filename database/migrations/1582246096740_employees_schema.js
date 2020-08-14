'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EmployeesSchema extends Schema {
  up () {
    this.create('employees', (table) => {
      table.increments()
      table.string('name').notNullable().unique()
      table.string('phone').notNullable().unique()
      table.string('email').notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('employees')
  }
}

module.exports = EmployeesSchema
