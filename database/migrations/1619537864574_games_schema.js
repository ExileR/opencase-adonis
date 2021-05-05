'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class GamesSchema extends Schema {
  up () {
	this.create('games', (collection) => {})
  }

  down () {
    this.drop('games')
  }
}

module.exports = GamesSchema
