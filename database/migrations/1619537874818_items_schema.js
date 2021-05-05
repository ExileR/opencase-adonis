'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ItemsSchema extends Schema {
  up () {
	this.create('items', (collection) => {})
  }

  down () {
    this.drop('items')
  }
}

module.exports = ItemsSchema
