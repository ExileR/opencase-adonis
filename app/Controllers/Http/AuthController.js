'use strict'

const User = use('App/Models/User')
const Env = use('Env')

const SteamWebAPI = require('steam-web');
const OpenID = require('openid');
const relyingParty = new OpenID.RelyingParty(
  'http://' + Env.get('DOMAIN') + '/login/callback', // Verification URL (yours)
  'http://' + Env.get('DOMAIN'), // Realm (optional, specifies realm for OpenID authentication)
  true, // Use stateless verification
  false, // Strict mode
  []
);


class AuthController {

  async LogOut({request, response, auth }) {
    await auth.logout()
    return response.redirect('/')
  }

  async SteamRedirect({ request, response }) {
		response.implicitEnd = false 
		relyingParty.authenticate('https://steamcommunity.com/openid', false, function(error, authUrl) 	{
  		if (error) {
  			return response.send('Authentication failed: ' + error.message)
  		}
  		else if (!authUrl) {
  			return response.send('Authentication failed')
  		}
  		else {
			response.redirect(authUrl)
  		}
  	});
  }

  async SteamCallback({ request, response, auth }) {

    let verify = await (
      new Promise(function(resolve, reject) {
        relyingParty.verifyAssertion(request.request, function(error, result) {
      		if(!error && result.authenticated) return resolve(result.claimedIdentifier)
          else return reject(error)
      	})
      })
    )

    let steamID = (/^https:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/).exec(verify)[1]
    let steam = new SteamWebAPI({ apiKey: Env.get('STEAM_WEBAPI'), format: 'json' })

    let playerInfo = await (
      new Promise(function(resolve, reject) {
        steam.getPlayerSummaries({
          steamids: [ steamID ],
          callback: function(err, result) {
            if(err) reject(err)
            else resolve(result.response.players[0])
          }
        })
      })
    )

    let searchUser = {
      steamid: playerInfo.steamid
    }

    let newUser = {
      steamid: playerInfo.steamid,
      nickname: playerInfo.personaname,
      avatar: playerInfo.avatarfull,
      status: 0,
      tradelink: '',
	  money: 0,
	  profit: 0
    }

    let loggedUser = await User.findOrCreate(searchUser, newUser)
	const authUser = await User.findBy('steamid', loggedUser.steamid)
	await auth.login(authUser.toJSON())
    return response.redirect('/')

  }

}

module.exports = AuthController