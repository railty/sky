'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const User = use('App/Models/User');
const Trainer = use('App/Models/Trainer');
const Entry = use('App/Models/Entry');

class EntrySeeder {
  async run () {
    await Entry.query().delete();
    
    let users = await User.all();
    let trainers = await Trainer.all();
    
    for (let iUser = 0; iUser<10; iUser++){
      for (let iTrainer = 0; iTrainer<10; iTrainer++){
        let entry = new Entry();
        entry.user_id = users.rows[iUser].id;
        entry.trainer_id = trainers.rows[iTrainer].id;
        entry.amount = iUser*iTrainer;
        entry.client = `U ${iUser} T ${iTrainer}`;
        entry.method = entry.amount%3==0 ? 'Credit' : 'Cash';
        await entry.save();
      }
    }
    let entries = await Entry.all();
    console.log(`entriess = ${entries.rows.length}`);
  }
}

module.exports = EntrySeeder
