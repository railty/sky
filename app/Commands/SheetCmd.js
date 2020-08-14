'use strict'

const { Command } = require('@adonisjs/ace')
const Sheet = use('App/Models/Sheet.js');
const {accessToken} = require('../../googleToken.js');

class SheetCmd extends Command {
  static get signature () {
    return 'sheet'
  }

  static get description () {
    return 'google sheet'
  }

  async handle2 (args, options) {
    this.info('running ...')

    console.log(accessToken);
  }

  async handle (args, options) {
    this.info('running ...')
    //console.log(accessToken);
    let sheet = new Sheet(accessToken);
    let title = "Entries";
    try{
      let files = await sheet.list(title);
      let file = files[0];
      let res = await sheet.get(file.id);
  
      let spreadsheetId = res.spreadsheetId;
      let sheetId = res.sheets[0].properties.sheetId;
      
      //console.log(sheetId)
      let dataRangeName = 'Data';
      let ranges = res.namedRanges;
      let dataRange = ranges.find((r)=>{
        return r.name == dataRangeName;
      });
      if (dataRange){
        console.log(dataRange.range.startRowIndex);
        console.log(dataRange.range.endRowIndex);

        let deleteRequest = {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "rows",
              startIndex: dataRange.range.startRowIndex + 1,
              endIndex: dataRange.range.endRowIndex
            }
          }
        };
    
        let insertRequest = {
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'rows',
              startIndex: dataRange.range.startRowIndex,
              endIndex: dataRange.range.startRowIndex + 1 + 2,
            },
            inheritFromBefore: false
          }
        }
    
        let request = {
          spreadsheetId: spreadsheetId,
          resource: {
              //requests: [deleteRequest, insertRequest]
              requests: [insertRequest]
              //requests: [deleteRequest]
          }
        };
        res = await sheet.update(spreadsheetId, request);
  

      }
    }
    catch(e){
      console.log(e);
    }
  }
}

module.exports = SheetCmd
