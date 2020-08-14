'use strict'


class EntryController {

    async index({view}) {
    }    

    async show({auth, request, response, view}) {
        await this.setup(auth)
        let fonts = this.profile.getEnabledFonts();

        let entryId = request.params.id;
        let entry = await Entry.findOrFail(entryId);

        const products = await Product.all();

        return view.render('entry.show', { entry: entry, products: JSON.stringify(products.rows), fonts: fonts })
    }    

    async edit({auth, request, response, view}) {
        await this.setup(auth)
        let fonts = this.profile.getEnabledFonts();

        let entryId = request.params.id;
        let entry = await Entry.findOrFail(entryId);
        entry.data = entry.data || "{}";
        return view.render('entry.edit', { entry: entry, fonts: fonts })
    }    

    async create({request, response}) {
        let entry = new Entry();
        entry.trainer_id = request.body.trainer_id;
        entry.user_id = request.body.user_id;
        entry.amount = request.body.amount;
        entry.method = request.body.method;
        entry.client = request.body.client;
        entry.time = request.body.time;

        await entry.save();
        response.send(JSON.stringify({code:'success', message: 'entry created'}));
    }    

    async export({request, response}) {
        let rc;
        var auth = request.header('Authorization');
        if (auth) {
            let title = "Entries";
            let headers = ['Date', 'Trainer', 'Client', 'Time', 'Staff', 'Amount', 'Method'];
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
    
                let updateHeaderRows = Entry.getGoogleSheetUpdateHeaders();
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

            let updateRows = await Entry.getGoogleSheetUpdateRows();
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
                            columnCount: Entry.headers.length
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
                            columnCount: Entry.headers.length
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

    async delete({request, response}) {
        let entryId = request.params.id;
        const entry = await Entry.find(entryId)
        await entry.delete()

        response.route('EntryController.index')
    }    

}

module.exports = EntryController
