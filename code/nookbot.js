// var Discord = require('discord.io');
// var logger = require('winston');
// var auth = require('./auth/discord_auth.json');
// var c = require('./const.js')

import Discord from 'discord.io';
import logger from 'winston';
import auth from './auth/discord_auth.json';
import {constants as c} from './const.js';


// var nook = require('./utils/nookcmds.js')
import nookcmds from './utils/nookcmds.js';

// let nookc = new nookcmds();

// nooked.init();

var ncmds = null;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = c.LOG_LEVEL;

// Initialize Discord Bot
var nookbot = new Discord.Client({
    token: auth.token,
    autorun: true
});

// logger.info('NookBot Initializing...');

nookbot.on('ready', function (evt) {
    logger.info('[NookBot] Connected to Discord.');
    logger.info('[NookBot]  Logged in as: ' + nookbot.username + '#' + 
        nookbot.discriminator + ' - (' + nookbot.id + ')');

    var serverNames = [];
    Object.keys(nookbot.servers).forEach( 
        server_id => {
            serverNames.push(nookbot["servers"][server_id].name);
        });

    logger.info('[NookBot]  Connected to ' + 
        Object.keys(nookbot.servers).length + 
        ' server(s): [' + serverNames + ']');
    // logger.info('channels: ' + nookbot.channels.length);
    // logger.info('users: ' + nookbot.users);

    ncmds = new nookcmds(nookbot, logger);
    logger.info('[nookbot] nookc initialized.')
});

logger.info(c.CMD_PREFIX);



/**
 * 'Main' Polling Function -- Waits for User Commands in the form of 'n!command'
 *  Keeps listening for user input while alive.
 */
nookbot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, c.CMD_PREFIX.length) == c.CMD_PREFIX) {
        var args = message.substring(2).split(' ');
        var cmd = args[0];

        logger.debug( "    " + evt.d.author.username + "#" + 
            evt.d.author.discriminator + " sent command: " + message);
       
        args = args.splice(1);
        // args shows [0, 1, 2, 3] -> [1, 2, 3]
        switch(cmd) {
            // !ping
            case 'ping':
                logger.info('[NookBot] Got pinged by ' + user);
                nookbot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            case 'help':
                ncmds.help(channelID, args);
            break;
            case 'server':
                ncmds.server(evt);
            break;
            case 'hello':
                ncmds.hello(evt);
            break;
            case 'init':
                logger.info('received: init command.');
                logger.info(user);
                logger.info(userID);
                logger.info(channelID);
                logger.info(message);
                logger.info(evt);

                logger.info("get server id:");
                logger.info(evt.d.guild_id);
                logger.info("get channel id:");
                logger.info(evt.d.channel_id);

                logger.info("get author disc:");
                logger.info(evt.d.author.username);
                logger.info(evt.d.author.discriminator);
            break;
            case 'record':
                ncmds.record(evt);
            case 'test':
                ncmds.test(evt);
            break;
            default:
                ncmds.invalidCmd(channelID);
         }
     }
});