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

let nooked = new nookcmds();

// nooked.init();


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

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
});

logger.info(c.cmd_prefix);


logger.info('Initializing Google Sheets.');

logger.info('Skipping Google Sheets, lmao.');

// var gsheets = require('./googletest.js');
// var gsheets = require('./utils/googlesheets.js');


logger.info('Finished Google Sheets Initialization.');



/**
 * 'Main' Polling Function -- Waits for User Commands in the form of 'n!command'
 *  Keeps listening for user input while alive.
 */
nookbot.on('message', function (user, userID, channelID, message, evt) {
    // if (message.substring(0, c.cmd_len) == c.cmd_prefix) {
    if (message.substring(0, 2) == 'n!') {
        var args = message.substring(2).split(' ');
        var cmd = args[0];

        logger.debug( "    " + evt.d.author.username + "#" + 
            evt.d.author.discriminator + " sent command: " + message);
       
        args = args.splice(1);
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
                nookbot.sendMessage({
                    to: channelID,
                    message: 'Available Commands: \n ' + 
                            'n!help \n n!server'
                });
            break;
            case 'hello':
                nook.helloWorld(nookbot, channelID, args);
            break;
            // Just add any case commands if you want to..
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
         }
     }
});