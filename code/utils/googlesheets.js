// const fs = require('fs');
// const readline = require('readline');
// const {google} = require('googleapis');
// var c = require('../const.js')

import fs from 'fs';
import readline from 'readline'
import googleapis from 'googleapis';
import {constants as c} from '../const.js';

let google = googleapis.google;


// If modifying these scopes, delete token.json.
// const OAUTH_SCOPES = ['https://www.googleapis.com/auth/spreadsheets',
//                       'https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'code/auth/google_token.json';
const CREDS_PATH = 'code/auth/google_credentials.json';

// Load client secrets from a local file.

// fs.readFile('auth/goog_credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Sheets API.
//   authorize(JSON.parse(content), listMajors);
// });


export default class googlesheets {

    constructor(logger)
    {
        this.logger = logger;
        fs.readFile(CREDS_PATH, (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Sheets API.
            this.authorize(JSON.parse(content), 
                // logger.info(" [Gsheets] Finished Initializing Google Sheets."));
                
                (auth) => {
                    logger.info(" [Gsheets] Finished Initializing Google Sheets.");
                    this.sheets = google.sheets({version: 'v4', auth})
                    this.drive  = google.drive({version: 'v3', auth})
                    this.auth = auth;
                });
                // this.refreshAuth);
        });
    }

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return this.getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }


    refreshAuth()
    {
        if (typeof this.auth == 'undefined' || this.auth == null
            || typeof this.sheets == 'undefined' || this.sheets == null
            || typeof this.drive == 'undefined' || this.drive == null)
        {
            fs.readFile(CREDS_PATH, (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                // Authorize a client with credentials, then call the Google Sheets API.
                this.authorize(JSON.parse(content), 
                    function(auth) {
                        this.sheets = google.sheets({version: 'v4', auth});
                        this.drive  = google.drive({version: 'v3', auth})
                        this.auth = auth;
                    });
            });
        }
    }


    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: c.OAUTH_SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error while trying to retrieve access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    serverCheckExists(serverID)
    {
        this.refreshAuth();

        this.sheets.spreadsheets.values.get({
            spreadsheetId: c.NOOKBOT_METADATA_TABLE,
            range: 'ServerList!B2:D',
        }, (err, res) => {
            if (err) 
            {
                this.logger.error('The API returned an error: ' + err)
                return false;
            } // else
            var exists = false;
            const rows = res.data.values;
            if (rows.length) {
                console.log('ServerID, Server_Name:');
                rows.map((row) => {
                    if (row[0] == serverID)
                    {
                        exists = true;
                        this.logger.error('Server Already Exists');
                        return false;
                    }
                    this.logger.debug(`ServerID, ServerName: ${row[0]}, ${row[1]}`);
                });
            } else {
                // No Data, move on.
            }

            if (!exists)
            {

            }
        });
    }

    getServerSheet(serverID, callback)
    {
        this.refreshAuth();

        this.sheets.spreadsheets.values.get({
            spreadsheetId: c.NOOKBOT_METADATA_TABLE,
            range: 'ServerList!B2:D',
        }, (err, res) => {
            if (err) 
            {
                this.logger.error('The API returned an error: ' + err)
                return callback(-1);
            } // else
            const rows = res.data.values;
            if (rows.length) {
                rows.map((row) => {
                    if (row[0] == serverID)
                    {
                        var spreadsheetID = row[2];
                        this.logger.debug('Spreadsheet ID: ' + spreadsheetID);
                        return callback(spreadsheetID);
                    }
                });
            }
            // return callback(-1);
        });
    }

    userExists(serverID, user, callback)
    {
        this.refreshAuth();

        this.getServerSheet(serverID, (spreadsheetID) => {
            this.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetID,
                range: 'Hello!B2:D',
            }, (err, res) => {
                if (err) 
                {
                    console.log("\n\t\t uhhhhh  01 \n\n");
                    console.log(err);
                    this.logger.error('The API returned an error: ' + err)
                    return callback(-1);
                } // else
                if (res)
                {
                    console.log("\n\t\t wtf  02 \n\n");
                    console.log(res);
                    const rows = res.data.values;
                    // if (rows.length) {
                    if (typeof rows != 'undefined' && rows != null && rows.length) {
                        let rowNum = 1;
                        console.log('ServerID, Server_Name:');
                        rows.map((row) => {
                            rowNum++;
                            let rowUser = row[0] + '#' + row[1];
                            if (rowUser == user)
                            {
                                this.logger.debug('Found user: ' + rowUser);
                                return callback(rowNum);
                            }
                        });
                    }
                }
                

                return callback(-1);
            });
        });
    }

    createUserEntry(serverID, user)
    {
        let userDiscord = user.split('#')[0];
        let userDiscrim = user.split('#')[1];

        this.getServerSheet(serverID, (spreadsheetID) => {
            this.sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetID,
                range: 'Hello!A2:J',
                insertDataOption: 'INSERT_ROWS',
                valueInputOption: 'RAW',
                resource: {
                    range: 'Hello!A2:J',
                    majorDimension: 'ROWS',
                    values: [
                        [, userDiscord, userDiscrim]
                    ]
                },
                auth: this.auth
            }, (err, res) => {
                if (err) 
                {
                    console.log("\n\t\t uhhhhh  03 \n\n");
                    console.log(err);
                    this.logger.error('  googlesheets.createUserEntry: '
                        + 'The API returned an error: ' 
                        + err)
                    return false;
                } // else
                if (res)
                {
                    console.log("\n\t\t uhhhhh  04 \n\n");
                    console.log(res);
                    // passed.
                    this.logger.debug('  googlesheets.createUserEntry: ' 
                        + 'write completed:');
                    this.logger.debug(res);
                }

            });
        });

        return true;
    }


    updateUser(serverID, user, updateReq)
    {
        let userDiscord = user.split('#')[0];
        let userDiscrim = user.split('#')[1];

        this.getServerSheet(serverID, (spreadsheetID) => {
            this.sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetID,
                range: 'Hello!D2:J',
                insertDataOption: 'INSERT_ROWS',
                valueInputOption: 'RAW',
                resource: {
                    range: 'ServerList!D2:J',
                    majorDimension: 'ROWS',
                    values: [
                        [updateReq.name]
                    ]
                },
                auth: this.auth
            }, (err, res) => {
                if (err) 
                {
                    this.logger.error('The API returned an error: ' 
                        + err)
                    return false;
                } // else

                // passed.
                this.logger.debug('  googlesheets.updateUser: ' 
                    + 'write completed:');
                this.logger.debug(res);
            });
        });

        return callback();
    }

    /**
     * Creates a new Spreadsheet, representing a new discord server init.
     */
    newServer(serverID, serverName, callback)
    {
        this.refreshAuth();

        // Check if sheet already exists.
        this.sheets.spreadsheets.values.get({
            spreadsheetId: c.NOOKBOT_METADATA_TABLE,
            range: 'ServerList!B2:D',
        }, (err, res) => {
            if (err) 
            {
                this.logger.error('The API returned an error: ' + err)
                return callback(false);
            } // else
            var serverExists = false;
            const rows = res.data.values;
            if (rows.length) {
                console.log('ServerID, Server_Name:');
                rows.map((row) => {
                    if (row[0] == serverID)
                    {
                        serverExists = true;
                        this.logger.error('Server Already Exists');
                        return callback(false);
                    }
                    this.logger.debug(`ServerID, ServerName: ${row[0]}, ${row[1]}`);
                });
            }


            // Start New Sheet Process.
            if (!serverExists)
            {
                let sheetName = "[NookBot Server] " + serverName; 
                // this.sheets.spreadsheets.create({
                //     resource: {
                //         properties: {
                //             title:sheetName
                //     }},
                //     auth: this.auth
                // }, (err, res) => {
                this.drive.files.copy({
                    fileId: c.NOOKBOT_SERVER_TEMPLATE,
                    requestBody: {
                        name: sheetName,
                        parents: [c.NOOKBOT_SERVER_FOLDER]
                    }
                }, (err, res) => {
                    // if (err) {
                    //     this.logger.error('The API returned an error: ' + err);
                    // } else {
                    //     this.logger.debug(res);
                    // }
                    if (err) {
                        this.logger.error('The API returned an error: ' + err);
                        return callback(false);
                    } else {
                        let sheetID = res.data.id;
                        this.logger.debug('  googlesheets.newServer: ' 
                            + 'clone completed:');
                        this.logger.debug(`    Spreadsheet ID: ${sheetID}`);
                        
                        // let moveReq =
                        // {
                        //     addParents: [c.NOOKBOT_SERVER_FOLDER],
                        //     removeParents: 'root',
                        //     fileId: sheetID
                        // }
                        // this.drive.files.update(moveReq, (err, res) => {
                            // if (err) {
                            //     this.logger.error('The API returned an error: ' 
                            //         + err);
                            //     return callback(false);
                            // } else {
                        if (res.status == 200)
                        {
                            // passed.
                            this.logger.debug('  googlesheets.newServer: ' 
                                + 'move completed:');
                            this.logger.debug(res);

                            this.sheets.spreadsheets.values.append({
                                spreadsheetId: c.NOOKBOT_METADATA_TABLE,
                                range: 'ServerList!A2:H',
                                insertDataOption: 'INSERT_ROWS',
                                valueInputOption: 'RAW',
                                resource: {
                                    range: 'ServerList!A2:H',
                                    majorDimension: 'ROWS',
                                    values: [
                                        ['NookBot', serverID, serverName, 
                                            sheetID, c.NOOKBOT_CURRENT_VERSION, 
                                            0, Date.now(), Date.now()]
                                    ]
                                },
                                auth: this.auth
                            }, (err, res) => {
                                if (err) 
                                {
                                    this.logger.error('The API returned an error: ' 
                                        + err)
                                    return false;
                                } // else

                                // passed.
                                this.logger.debug('  googlesheets.newServer: ' 
                                    + 'write completed:');
                                this.logger.debug(res);
                                return callback(true);
                            });
                        }
                            // }
                        // });     // moveUpdate end.
                    }
                });     // copyFile end.
            }
        });
        // return callback(false);
    } // newServer end


    initServer(serverID, callback)
    {
        this.logger.debug('  googlesheets.newServer: test init');

        let addSheetReq = {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: "Hello",
                            gridProperties: {
                                rowCount: 50,
                                columnCount: 10
                            }
                        }
                    }
                }
            ]
        }

        this.sheets.spreadsheets.values.append({
            spreadsheetId: serverID,
            range: 'Hello!A1:I',
            insertDataOption: 'INSERT_ROWS',
            valueInputOption: 'RAW',
            resource: {
                range: 'Hello!A1:I',
                majorDimension: 'ROWS',
                values: [
                    ['Num', 'Discord', 'Discriminator', 'Name', 'Player', 
                    'Island', 'Fruit', 'Flowers', 'SW', 'Timezone']
                ]
            },
            auth: this.auth
        }, (err, res) => {
            if (err) 
            {
                this.logger.error('The API returned an error: ' + err)
                return false;
            } // else

            // passed.
            this.logger.debug('  googlesheets.newServer: write completed:');
            this.logger.debug(res);
            return callback(true);
        });
    }




    /**
     * Prints the names and majors of students in a sample spreadsheet:
     * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
     */
    listMajors(auth) {
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            range: 'Class Data!A2:E',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                console.log('Name, Major:');
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    console.log(`${row[0]}, ${row[4]}`);
                });
            } else {
                console.log('No data found.');
            }
        });
    }
}

