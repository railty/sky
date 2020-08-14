'use strict'

const User = use('App/Models/User');
const Trainer = use('App/Models/Trainer');
const Entry = use('App/Models/Entry');
const Sheet = use('App/Models/Sheet.js');
const Database = use('Database');

const ItemController = use('./ItemController')
class EntryController extends ItemController {
    itemName(){
        return "entry";
    }

    async index({view, request, response}) {
        let pageSize = 20;
        let page = 1;
        if (request.qs['page']){
            page = parseInt(request.qs['page']);
        }

        let sortBy = request.qs['sort'] || '';
        sortBy = sortBy.replace('id ', 'entries.id ');

        if (request.url().match(/\.json$/)){

            let fromClause = `from entries 
            join trainers on entries.trainer_id=trainers.id 
            join users on entries.user_id=users.id`;
            
            let countSql = `select count(*) as Count ${fromClause}`;
            let total = await Database.raw(countSql);
            total = total[0]['Count'];

            let baseSql = `select 
            entries.id,
            trainer_id, 
            user_id, 
            trainers.name as Trainer, 
            users.username as Staff, 
            client as Client, 
            time as Time, 
            amount as Amount, 
            method as Method ${fromClause}`;
            
            let orderBySql = baseSql;
            if (sortBy){
                orderBySql = `${baseSql} order by ${sortBy}`;
            }
            let limitSql = `${orderBySql} limit ${pageSize*(page-1)}, ${pageSize}`;
            let items = await Database.raw(limitSql);

            const trainers = (await Trainer.query().orderBy("name").fetch()).rows;
            const users = (await User.query().orderBy("username").fetch()).rows;

            let rc = {
                code: 'success',
                message: 'success',
                rows: items,
                pages: {
                    total: total,
                    page: page,
                    perPage: pageSize,
                    lastPage: (total/pageSize+0.5).toFixed(),
                },
                users: users,
                trainers: trainers
            }
            response.send(JSON.stringify(rc));
        }
        else{
            return view.render(this.itemName() + '.index')
        }
    }    

    queryOne(id){
        return Entry.findOrFail(id);
    }

    /*
        let moment = require('moment');
        let tm = moment()
        let date = tm.format("YYYY-MM-DD")

        return view.render('entry.index', { entries: entries, trainers: trainers.rows, users: users.rows, date: date, includeDate: true })
        return Entry.query();
    */

    async update({request, response}) {
        let data = request.body.data;
        let itemId = request.params.id;
        let item = await Entry.findOrFail(itemId);

        item.trainer_id = data.trainer_id; 
        item.user_id = data.user_id;
        item.client = data.Client; 
        item.amount = data.Amount; 
        item.method = data.Method; 
        item.time = data.Time; 

        let rc;
        try{
            await item.save()
            rc = {
                code: 'success',
                message: this.itemName() + ' updated'
            }
        }
        catch(e){
            rc = {
                code: 'warning',
                message: e.message
            }
        }

        response.send(JSON.stringify(rc));
    }    

    async create({request, response}) {
        let data = request.body.data;
        let item = new Entry();
        item.trainer_id = data.trainer_id; 
        item.user_id = data.user_id;
        item.client = data.Client; 
        item.amount = data.Amount; 
        item.method = data.Method; 
        item.time = data.Time; 

        let rc;
        try{
            await item.save()
            rc = {
                code: 'success',
                message: this.itemName() + ' created'
            }
        }
        catch(e){
            rc = {
                code: 'warning',
                message: e.message
            }
        }

        response.send(JSON.stringify(rc));
    }

    async deleteAllowed(item){
        return true;
    }

    async public({request, response, view}) {
        if (request.url().match(/\.json$/)){
            const trainers = (await Trainer.query().orderBy("name").fetch()).rows;
            const users = (await User.query().orderBy("username").fetch()).rows;
            let rc = {
                code: 'success',
                message: 'success',
                users: users,
                trainers: trainers
            }
            response.send(JSON.stringify(rc));
        }
        else{
            return view.render('entry.public')
        }
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

}

module.exports = EntryController
