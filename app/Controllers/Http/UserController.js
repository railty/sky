'use strict'

const User = use('App/Models/User');

const ItemController = use('./ItemController')
class UserController extends ItemController {
    itemName(){
        return "user";
    }
    queryAll(){
        return User.query().setHidden(['password']);
    }
    queryOne(id){
        return User.findOrFail(id);
    }
    createOne(itemData){
        let item = new User();
        item.merge(itemData); 

        if (!item.password) item.password = '123456';
        return item;
    }
    async deleteAllowed(item){
        let entries = await item.entries().fetch();
        return entries.rows.length == 0;
    }
}

module.exports = UserController
