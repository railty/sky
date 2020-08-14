'use strict'

const Trainer = use('App/Models/Trainer');

const ItemController = use('./ItemController')
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
}

module.exports = TrainerController
