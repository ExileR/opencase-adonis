'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Game extends Model {
	
	static get createdAtColumn () {
		return 'created_at'
	}
	
	static get updatedAtColumn () {
		return 'updated_at'
	}
}

module.exports = Game
