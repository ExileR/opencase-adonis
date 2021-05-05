'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PromoSchema extends Schema {
  up () {
	this.create('promos', (collection) => {})
  }

  down () {
    this.drop('promos')
  }
}

module.exports = PromoSchema
