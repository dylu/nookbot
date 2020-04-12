// require('../nookbot.js');
// var Discord = require('discord.io');
// var c = require('../const.js');

import logger from 'winston';

var methods = {};

function helloWorld(nookbot, channelID, args)
{
	// nookbot.sendMessage({
 //        to: channelID,
 //        message: 'Hello World'
 //    });
}

// methods.helloWorld = helloWorld();

// module.exports = methods;


export default class nookcmds{
	// Initialize Discord Bot
	init() {
		// var nookbot = new Discord.Client({
		//     token: auth.token,
		//     autorun: true
		// });

		logger.info('AHHHH');
	}
}

