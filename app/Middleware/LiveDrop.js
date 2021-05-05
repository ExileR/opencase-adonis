'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class LiveDrop {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ view }, next) {
    const Controller = use('App/Controllers/Http/PagesController')
	const call = new Controller()
    view.share({
      winners: await call.livedrop(),
	  statgames: await call.games(),
	  statusers: await call.users()
    })
    await next()
  }
}

module.exports = LiveDrop
