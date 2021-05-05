'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */

const Route = use('Route')

Route.get('/','PagesController.main')
Route.get('/faq','PagesController.faq')
Route.get('/top','PagesController.top')
Route.get('/trades','PagesController.trades')
Route.get('/reviews','PagesController.reviews')
Route.get('/user/:id', 'PagesController.user')
Route.get('/case/:url', 'PagesController.box')
Route.get('/test','PagesController.test')

Route.group(() => {
  Route.post('/open','ActionController.open').middleware('throttle:1,1')
  Route.post('/sell','ActionController.sell').middleware('throttle:2,1')
  Route.post('/send','ActionController.send').middleware('throttle:2,1')
  Route.post('/savelink','ActionController.savelink').middleware('throttle:2,1')
}).prefix('/api')

Route.group(() => {
  Route.get('/steam', 'AuthController.SteamRedirect')
  Route.get('/callback', 'AuthController.SteamCallback')
  Route.get('/logout', 'AuthController.LogOut')
}).prefix('/login')