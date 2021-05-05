'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CasesSchema extends Schema {
  up () {
	this.create('cases', (collection) => {})
  }

  down () {
    this.drop('cases')
  }
}

module.exports = CasesSchema
