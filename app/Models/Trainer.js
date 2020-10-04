'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Trainer extends Model {
    static headers = [
        {
            title: 'Name',
            v: (trainer)=>{
                return {
                    stringValue: trainer.name
                };
            }
        },
        {
            title: 'Phone',
            v: (trainer)=>{
                return {
                    stringValue: trainer.phone
                };
            }
        },
        {
            title: 'Email',
            v: (trainer)=>{
                return {
                    stringValue: trainer.email
                };
            }
        },
    ];

    entries () {
        return this.hasMany('App/Models/Entry')
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
        let trainers = await Trainer.all();
    
        let requests = trainers.rows.map(function(trainer){
            let cells = this.headers.map(function(column) {
                let v = column.v(trainer);
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

module.exports = Trainer
