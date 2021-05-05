'use strict'

const Ws = use('Ws')
const User = use('App/Models/User')
const Case = use('App/Models/Case')
const Game = use('App/Models/Game')
const Item = use('App/Models/Item')
const Logger = use('Logger')
const Controller = use('App/Controllers/Http/PagesController')
const call = new Controller()

class ActionController {
	
	async open({ request, response, auth }) {
		const current = request.input('case')
		const box = await Case.findBy('url', current)
		const user = await auth.getUser()
		if(user.money < box.price) 
			return response.json({
				status:'error',
				msg:'<div><div><strong>Ошибка</strong><br>Недостаточно средств!</div></div>'
			})
		if(!user.tradelink) 
			return response.json({
				"status":"error",
				"msg":"<div><div><strong>Ошибка</strong><br>Введите ссылку на трейд!</div></div>"
			})	
		var items = []
		for (let i = 0; i < box.items.length; i++) {
			const item = await Item.findBy('id', box.items[i])
			if(item.price == 0) continue
			if ((box.price * 5 > box.profit && item.price > box.price) || (item.price > box.price * 3 && item.price < box.price)) { continue;}
			items.push(item);
		}
		this.shuffle(items)
		var item = items[0]
		let newGame = {
		userid: user.steamid,
		item: item.id,
		price: item.price,
		caseid: current,
		status: 0
		}
		user.money = user.money - box.price
		user.profit = user.profit + item.price
		user.opened = user.opened += 1
		await user.save()
		box.profit = box.profit + (box.price - item.price)
		await box.save()
		let game = await Game.create(newGame)
		const livedrop = Ws.getChannel('livedrop').topic('livedrop')
		const drop = {
		"userid":user._id,
		"caseid":current,
		"name":item.name_ru, 
		"images":box.images,
		"rar":item.rar,
		"price":item.price, 
		"classid":item.classid 
		}
		const stats = {
		"users":await call.users(),
		"games":await call.games()
		}
		if(livedrop){
		livedrop.socket.broadcastToAll('drop', drop)
		livedrop.socket.broadcastToAll('stats', stats)
		}
		return response.json({
			status:'success',
			id:game._id,
			balance:user.money,
			name:item.name_ru,
			rar:item.rar,
			price:item.price,
			classid:item.classid
		})
	}
	
	async sell({ request, response, auth }) {
		const current = request.input('order_id')
		let game = await Game.findBy('_id', current)
		const user = await auth.getUser()
		if(game.userid == user.steamid && game.status == 0){
			game.status = 1
			user.money = user.money + game.price
			await game.save()
			await user.save()
			return response.json({
				status: 'success', 
				msg: '<div><div><strong>Предмет продан</strong><br>На ваш счёт зачислено ' + game.price  + 'Р!</div></div>', 
				balance: user.money
			});
		}
		return response.json({status: 'error', msg: 'Ошибка'});
	}
	
	async send({ request, response, auth }) {
		const current = request.input('order_id')
		let game = await Game.findBy('_id', current)
		const box = await Case.findBy('url', game.caseid)
		const user = await auth.getUser()
		Logger.info('Новая заявка на вывод предмета')
		if(game.userid == user.steamid && game.status == 0){
			game.status = 2
			await game.save()
			return response.json({
				status: 'success', 
				msg: '<div><div><strong>Предмет отправлен</strong><br>Совсем скоро он будет доставлен!</div></div>', 
			});
		}
		return response.json({status: 'error', msg: 'Ошибка'});
	}
	
	async savelink({ request, response, auth }) {
		const link = request.input('trade_link')
		if(link != null && link.length >= 16){
			const user = await auth.getUser()
			user.tradelink = link
			await user.save()
			return response.json({
				status: 'success', 
				msg: '<div><div><strong>Ссылка успешно сохранена.</strong><br>Не забудьте открыть свой инвентарь в настройках steam!</div></div>', 
			});
		}
		return response.json({status: 'error', msg: '<div><div><strong>Ошибка</strong><br>Введите корректную ссылку обмена!</div></div>'});
	}
	
	shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
		return a;
	}
	
}

module.exports = ActionController
