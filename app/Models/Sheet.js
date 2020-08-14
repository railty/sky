'use strict'
var {google} = require('googleapis');
var {OAuth2Client} = require('google-auth-library');

class Sheet {
  constructor(accessToken){
    if (process.env.NODE_ENV == 'development'){
      //console.log(accessToken);
      const fs = require('fs');
      fs.writeFileSync("googleToken.js", `module.exports = { accessToken: '${accessToken}' };`);
    }
    
    var auth = new OAuth2Client();
    auth.credentials = {
      access_token: accessToken
    };
    this.sheetService = google.sheets({version: 'v4', auth: auth});
    this.driveService = google.drive({version: 'v3', auth});
  }

  create(title, columnCount){
    let p = new Promise((resolve, reject) => {
      let request = {
        resource: {
          properties: {
            title: title
          },
          sheets: [
            {
              properties: {
                title: 'Data',
                gridProperties: {
                  columnCount: columnCount,
                  frozenRowCount: 1
                }
              }
            },
          ]
        }
      };

      this.sheetService.spreadsheets.create(request, function(err, response) {
        if (err) {
          reject(err);
        }
        else{
          if (response.statusText=="OK"){
            resolve(response.data);
          }
          else{
            reject(response.statusText);
          }
        }
      });
    });
    return p;
  }


  update(spreadsheetId, request){
    let p = new Promise((resolve, reject) => {
      this.sheetService.spreadsheets.batchUpdate(request, function(err, response) {
        if (err) {
          reject(err);
        }
        else{
          if (response.statusText=="OK"){
            resolve(response.data);
          }
          else{
            reject(response.statusText);
          }
        }
      });
    });
    return p;
  }

  list(fileName, mimeType){
    mimeType = mimeType || 'application/vnd.google-apps.spreadsheet';

    let p = new Promise((resolve, reject) => {
      this.driveService.files.list({
        q: `mimeType='${mimeType}' and name contains '${fileName}'`,
        fields: 'files(id, name, modifiedTime)',
        orderBy: 'modifiedTime desc',
        //pageSize: 1
      }, (err, res) => {
        if (err) reject('drive files error: ' + err);
        else resolve(res.data.files);
      });
    });
    return p;
  }

  delete(fileId){
    let p = new Promise((resolve, reject) => {
      this.driveService.files.delete({
        fileId: fileId
      }, (err, res) => {
        if (err) reject('drive files error: ' + err);
        else resolve(res);
      });
    });
    return p;
  }

  get(spreadsheetId){
    let p = new Promise((resolve, reject) => {
      let request = {
        spreadsheetId: spreadsheetId,
      };

      this.sheetService.spreadsheets.get(request, function(err, response) {
        if (err) {
          reject(err);
        }
        else{
          if (response.statusText=="OK"){
            resolve(response.data);
          }
          else{
            reject(response.statusText);
          }
        }
      });
    });
    return p;
  }
}

module.exports = Sheet;
