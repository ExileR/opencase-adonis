'use strict'

const User = use('App/Models/User')
const Case = use('App/Models/Case')
const Game = use('App/Models/Game')
const Item = use('App/Models/Item')

class PagesController {
	
	async main({ view }){
		const cases = await Case.all();
		return view.render('pages.main',{
			info:cases.toJSON()
		})
	}	
		
	async faq({ view }){
		return view.render('pages.faq')
	}	
	
	async reviews({ view }){
		return view.render('pages.reviews')
	}
	
	async top({ view }){
		var top = []
		const users = await User.where({ profit: { $gt: 0 } }).sort({ "profit": -1 }).limit(25).fetch()
		const data = users.toJSON()
		for (let i = 0; i < data.length; i++) {
			const user = await User.findBy('steamid', data[i].steamid)
			user.place = i + 1
			top.push(user)
		}
		return view.render('pages.top', {
			users: top
		})
	}
	
	async trades({ view }){
		var trades = []
		var users = []
		var items = []
		var games = []
		const last = await Game.where({ "status": 2 }).sort({ "updated_at": -1 }).limit(25).fetch()
		const data = last.toJSON()
		for (let i = 0; i < data.length; i++) {
			const user = await User.findBy('steamid', data[i].userid)
			const item = await Item.findBy('id', data[i].item)
			const game = await Game.findBy('_id', data[i]._id)
			users.push(user)
			items.push(item)
			games.push(game)
		}
		for (let i = 0; i < data.length; i++) {
			const trade = {}
			const num = games[i]._id
			const date = new Date(games[i].updated_at)
			trade.num = num.toString().slice(-8)
			trade._id = users[i]._id
			trade.nickname = users[i].nickname
			trade.avatar = users[i].avatar
			trade.classid = items[i].classid
			trade.name_ru = items[i].name_ru
			trade.time = ("0" + date.getDate()).slice(-2)+
          "/"+("0" + (date.getMonth()+1)).slice(-2)+
          "/"+date.getFullYear()+
          " в "+("0" + date.getHours()).slice(-2)+
          ":"+("0" + date.getMinutes()).slice(-2)+
          ":"+("0" + date.getSeconds()).slice(-2)
			trades.push(trade)
		}
		return view.render('pages.trades', {
			trades:trades
		})
	}
	
	async box({ params, view }) {
		const box = await Case.findBy('url', params.url)
		const itemsbox = box.items
		var itemsinfo = [];
		for (let i = 0; i < itemsbox.length; i++) {
			const item = await Item.findBy('id', itemsbox[i])
			item.key = this.getItemRarity(item.rar)
			itemsinfo.push(item)
		}
		itemsinfo.sort(function(a, b) { 
		return a.key - b.key;
		});
		return view.render('pages.case', {
			info: box,
			items: itemsinfo,
			casedrop: await this.livedropcase(params.url)
		})
	}
	
	async user({ params, view, auth }) {
		const user = await User.findBy('_id', params.id)
		const games = await Game.where({ userid: user.steamid }).sort({"created_at": -1}).fetch()
		const game = games.toJSON()
		var items = []
		var order = []
		var status = []
		for (let i = 0; i < game.length; i++) {
			items.push(game[i].item)
			status.push(game[i].status)
			order.push(game[i]._id)
		}
		var inventory = [];
		for (let i = 0; i < items.length; i++) {
			const item = await Item.findBy('id', items[i])
			item.order = order[i]
			item.status = status[i]
			inventory.push(item)
		}
		try {
			const current = await auth.getUser()
			if(current._id == params.id){
				return view.render('pages.profile', {
					profile:user,
					items:inventory
				})	
			} else {
				return view.render('pages.user', {
					profile:user,
					items:inventory
				})	
			}
		} catch (error) {
			return view.render('pages.user', {
				profile:user,
				items:inventory
			})
		}
	}
	
	getItemRarity(info) {
		switch (info) {
		  case 'milspec':
			return 1;
			break;
		  case 'restricted':
			return 2;
			break;
		  case 'classified':
			return 3;
			break;
		  case 'covert':
			return 4;
			break;
		  case 'rare':
			return 6;
			break;
		  default:
			return 0;
		}
	}

	async test({ request, auth, response }){
		try {
			await auth.check()
		} catch (error) {
			response.send('You are not logged in')
		}
	}	
	
	async livedrop(){
		const games = await Game.sort({"created_at": -1}).limit(25).fetch()
		const game = games.toJSON()
		var lastdrop = []
		var items = []
		var users = []
		var images = []
		for (let i = 0; i < game.length; i++) {
			items.push(game[i].item)
			users.push(game[i].userid)
		}
		var dropitems = []
		for (let i = 0; i < items.length; i++) {
			const item = await Item.findBy('id', items[i])
			dropitems.push(item)
		}
		var dropusers = []
		for (let i = 0; i < users.length; i++) {
			const user = await User.findBy('steamid', users[i])
			dropusers.push(user._id)
		}
		var dropbox = []
		for (let i = 0; i < game.length; i++) {
			const box = await Case.findBy('url', game[i].caseid)
			dropbox.push(box.images)
		}
		for (let i = 0; i < dropitems.length; i++) {
			const drop = {}
			drop.userid = dropusers[i]
			drop.rar = dropitems[i].rar
			drop.name_ru = dropitems[i].name_ru
			drop.classid = dropitems[i].classid
			drop.images = dropbox[i]
			lastdrop.push(drop)
		}
		return lastdrop
	}	
	
	async livedropcase(info){
		const games = await Game.where({ caseid: info }).sort({"created_at": -1}).limit(25).fetch()
		const game = games.toJSON()
		var lastdropcase = []
		var items = []
		var users = []
		for (let i = 0; i < game.length; i++) {
			items.push(game[i].item)
			users.push(game[i].userid)
		}
		var dropitems = []
		for (let i = 0; i < items.length; i++) {
			const item = await Item.findBy('id', items[i])
			dropitems.push(item)
		}
		var dropusers = []
		var avatars = []
		var nicknames = []
		for (let i = 0; i < users.length; i++) {
			const user = await User.findBy('steamid', users[i])
			dropusers.push(user._id)
			avatars.push(user.avatar)
			nicknames.push(user.nickname)
		}
		for (let i = 0; i < dropitems.length; i++) {
			const drop = {}
			drop.userid = dropusers[i]
			drop.avatar = avatars[i]
			drop.nickname = nicknames[i]
			drop.rar = dropitems[i].rar
			drop.name_ru = dropitems[i].name_ru
			drop.classid = dropitems[i].classid
			lastdropcase.push(drop)
		}
		return lastdropcase
	}

	async games(){
	const statgames = await Game.count()
	return statgames
	}
  
	async users(){
	const statusers = await User.count()
	return statusers
	}	
	
}

module.exports = PagesController
