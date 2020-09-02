'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Entry extends Model {
    static headers = [
        {
            title: 'Date',
            v: (entry)=>{
                return {
                    stringValue: entry.time.split(' ')[0]
                };
            }
        },
        {
            title: 'Time',
            v: (entry)=>{
                return {
                    stringValue: entry.time.split(' ')[1]
                };
            }
        },
        {
            title: 'Trainer',
            v: (entry)=>{
                return {
                    stringValue: entry.trainerName
                };
            }
        },
        {
            title: 'Client',
            v: (entry)=>{
                return {
                    stringValue: entry.client
                };
            }
        },
        {
            title: 'Staff',
            v: (entry)=>{
                return {
                    stringValue: entry.userName
                };
            }
        },
        {
            title: 'Amount',
            v: (entry)=>{
                return {
                    numberValue: entry.amount,
                };
            },
            format: {
                numberFormat: {
                    type: 'CURRENCY',
                    pattern: '"$"#,##0.00'
                    //type: 'NUMBER',
                    //pattern: '#,##0'
                }
            },
        },
        {
            title: 'Method',
            v: (entry)=>{
                let m = entry.method;
                return {
                    stringValue: m.charAt(0).toUpperCase() + m.slice(1)
                };
            }
        },
    ];
    
    trainer () {
        return this.belongsTo('App/Models/Trainer')
    }
    user () {
        return this.belongsTo('App/Models/User')
    }

    static getGoogleSheetUpdateHeaders() {
        let cells = this.headers.map(function(column) {
            return {
                userEnteredValue: {
                    stringValue: column.title
                },
                userEnteredFormat: {
                    textFormat: {
                        bold: true
                    }
                }
            };
        });

        return [
            {
                values: cells
            }
        ];
    }

    static async getGoogleSheetUpdateRows() {
        let entries = await this.query().with('trainer').with('user').fetch();
    
        entries = entries.rows.map((e)=>{
            e.trainerName = e.getRelated("trainer").name;
            let user = e.getRelated("user");
            if (user) e.userName = user.username;
            return e;
        });
    
        let requests = entries.map(function(entry){
            let cells = this.headers.map(function(column) {
                let v = column.v(entry);
                return {
                    userEnteredValue: v,
                    userEnteredFormat: column.format
                };
            });
            return {
                values: cells
            };
        }.bind(this));
    
        return requests;
    }
    
}

module.exports = Entry;
