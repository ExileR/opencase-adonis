'use strict'

const Ws = use('Ws')
var online = 0

class LiveController {
	
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
	
	online++
	console.log('Update stats', online)
	const livestats = Ws.getChannel('livedrop').topic('livedrop')
	const stats = {
		"online":online
	}
	if(livestats){
		livestats.socket.broadcastToAll('stats', stats)
	}
  }
  
  onMessage(message) {
	 this.socket.broadcast('message', message)
  }
  
  onClose () {
	online--
    console.log('Re-update stats', this.socket.topic)
  }
  
}

module.exports = LiveController
