'use strict'

const Trainer = use('App/Models/Trainer');
const Sheet = use('App/Models/Sheet.js');
const ItemController = use('./ItemController')
const Database = use('Database');

class TrainerController extends ItemController {
    itemName(){
        return "trainer";
    }
    queryAll(){
        return Trainer.query();
    }
    queryOne(id){
        return Trainer.findOrFail(id);
    }
    createOne(itemData){
        let item = new Trainer();
        item.merge(itemData);        
        return item;
    }
    async deleteAllowed(item){
        let entries = await item.entries().fetch();
        return entries.rows.length == 0;
    }

    async export({request, response}) {
        let rc;
        var auth = request.header('Authorization');
        if (auth) {
            let title = "Trainers";
            let headers = ['Name', 'Phone', 'EMail'];
            let accessToken = auth.split(' ')[1];
            let sheet = new Sheet(accessToken);

            let files = await sheet.list(title);
            //console.log(files);

            let spreadsheetId;
            let sheetId;
            let file = files[0];
            let res;
            if (file){
                res = await sheet.get(file.id);
                spreadsheetId = res.spreadsheetId;
                sheetId = res.sheets[0].properties.sheetId;
            }
            else{
                res = await sheet.create(title, headers.length);
                spreadsheetId = res.spreadsheetId;
                sheetId = res.sheets[0].properties.sheetId;
    
                let updateHeaderRows = Trainer.getGoogleSheetUpdateHeaders();
                let updateCellRequest = {
                    updateCells: {
                        start: {
                            sheetId: sheetId,
                            rowIndex: 0,
                            columnIndex: 0
                        },
                        rows: updateHeaderRows,
                        fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
                    }
                };
    
                let request = {
                    spreadsheetId: spreadsheetId,
                    resource: {
                        requests: updateCellRequest
                    }
                };

                res = await sheet.update(spreadsheetId, request);
            }

            let updateRows = await Trainer.getGoogleSheetUpdateRows();
            let updateCellRequest = {
                updateCells: {
                    start: {
                        sheetId: sheetId,
                        rowIndex: 1,
                        columnIndex: 0
                    },
                    rows: updateRows,
                    fields: '*'
                }
            };

            let updateSizeRequest = {
                updateSheetProperties: {
                    properties: {
                        sheetId: sheetId,
                        gridProperties: {
                            rowCount: updateRows.length + 1,    //1 for header, 1 for bottom sum
                            columnCount: Trainer.headers.length
                        }
                    },
                    fields: 'gridProperties(rowCount,columnCount)'
                }
            };

            //first resize and then add 1 extra column. if we put both resize into 1, it will not auto clear the bottom rows (due to remove)
            let updateSizeRequestAfter = {                      
                updateSheetProperties: {
                    properties: {
                        sheetId: sheetId,
                        gridProperties: {
                            rowCount: updateRows.length + 2,
                            columnCount: Trainer.headers.length
                        }
                    },
                    fields: 'gridProperties(rowCount,columnCount)'
                }
            };

            let request = {
                spreadsheetId: spreadsheetId,
                resource: {
                  requests: [updateSizeRequest, updateCellRequest, updateSizeRequestAfter]  //
                }
            };

            try{
                res = await sheet.update(spreadsheetId, request);
                rc = {
                    code: "success",
                    message: "Success"
                }
            }
            catch(e){
                //console.log(e);
                rc = {
                    code: "warning",
                    message: e.message,
                }
            }
            
            /*
            for (let f of files){
                let x = await sheet.delete(f.id);
                console.log(x);
            }
            */

            //todo
            // add a formule sum a the bottom
            //SUM(OFFSET(Score_range,1,0,1,COLUMNS(Score_range)))
            
        }
        else{
            rc = {
                code: 'warning',
                message: 'Authorization required.'
            };
        }

        response.send(JSON.stringify(rc));
    }

}

module.exports = TrainerController
