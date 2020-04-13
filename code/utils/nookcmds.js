// require('../nookbot.js');
// var Discord = require('discord.io');
// var c = require('../const.js');

// import logger from 'winston';
import Discord from 'discord.io';
import auth from '../auth/discord_auth.json';
import googlesheets from './googlesheets.js';


export default class nookcmds {

    constructor(nookbot, logger)
    {
        this.nookbot = nookbot;
        this.logger = logger;
        this.gsheets = new googlesheets(logger);
    }

    sendMsg(channelID, msg)
    {
        if (typeof msg == 'undefined' || msg == null) {
            return;
        } else {
            this.nookbot.sendMessage({
                to: channelID,
                message: msg
            });
        }
    }

    invalidCmd(channelID, addmsg)
    {
        if (typeof addmsg == 'undefined' || addmsg == null)
        {
            addmsg = "";
        }
        this.sendMsg('Invalid Command' + addmsg);
    }

    /**
     * Help Command -- Sends the user a list of usable commands.
     */
    help(channelID, args)
    {
        this.logger.info('  [ncmd] help');
        this.nookbot.sendMessage({
            to: channelID,
            message: 'Available Commands: \n ' + 
                    'n!help \n n!hello'
        });
    }

    /**
     * Hello Command
     * Accepts the following arguments:
     *      [name, player, island, fruit, sw, timezone, batch, sync]
     */
    hello(evt)
    {
        var channelID = evt.d.channel_id;
        var msg = evt.d.content;
        var invalidMsg = "\n - n!hello accepts one of the following: \n " + 
                "   [name, player, island, fruit, sw, timezone, batch, sync]";
        if (msg.split(' ').length < 3)
        {
            this.invalidCmd(channelID, invalidMsg);
            return;
        }

        var subcmd = msg.split(' ')[1];
        var author = evt.d.author.username + "#" + evt.d.author.discriminator;
        var authorID = evt.d.author.id;

        // this.logger.debug( "    " + evt.d.author.username + "#" + 
        //     evt.d.author.discriminator + " sent command: " + message);
       
        args = args.splice(1);
        switch(subcmd) {
            case 'name':

            break;
            case 'player':
            break;
            case 'island':
            break;
            case 'fruit':
            break;
            case 'sw':
            break;
            case 'timezone':
            break;
            case 'batch':
            break;
            case 'sync':
            break;
            default:
                this.invalidCmd(channelID);
         }
    }


    server(evt)
    {
        var channelID = evt.d.channel_id;
        var msg = evt.d.content;
        var invalidMsg = "\n - n!server accepts one of the following: \n " + 
                "   [init, update, migrate]";
        if (msg.split(' ').length < 2)
        {
            this.invalidCmd(channelID, invalidMsg);
            return;
        }

        var subcmd = msg.split(' ')[1];
        var args = msg.split(' ').splice(1);
        var author = evt.d.author.username + "#" + evt.d.author.discriminator;
        var authorID = evt.d.author.id;
        var serverID = evt.d.guild_id;
        var serverName = this.nookbot.servers[serverID].name;

        // this.logger.debug( "    " + evt.d.author.username + "#" + 
        //     evt.d.author.discriminator + " sent command: " + message);
       
        // args = args.splice(1);
        switch(subcmd) {
            case 'init':
                // Initiaizes a server in the db.
                this.logger.info('creating new server with name: ' + args[0]);
                this.logger.debug(args);
                this.logger.debug(msg.split(' '));
                // if (this.gsheets.newServer(serverID, serverName)) {
                //     this.sendMsg(channelID, 
                //         `Server [${serverName}] Initialized Successfully.`);
                // } else {
                //     this.sendMsg(channelID, "Server Failed to Initialize.");
                // }
                this.gsheets.newServer(serverID, serverName, (success) => {
                    if (success) {
                        this.sendMsg(channelID, 
                            `Server [${serverName}] Initialized Successfully.`);
                    } else {
                        this.sendMsg(channelID, "Server failed to initialize.");
                    }
                });
            break;
            case 'update':
            // break;
            case 'migrate':
            // break;
            default:
                this.invalidCmd(channelID);
         }
    }

}

// nookcmds.nookbot = new Discord.Client({
//  token: auth.token,
//  autorun: true
// });

