'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Trainer = use('App/Models/Trainer');

class TrainerSeeder {
  async run() {
    await Trainer.query().delete();
    let trainers = await Trainer.all();
    console.log(`trainers = ${trainers.rows.length}`);

    for (let i=10; i<100; i++){
      await Trainer.create({
        "name": `trainer ${i}`,
        "phone": `289-123-45${i}`,
        "email": `trainer${i}@skyfitness.ca`,
      });
    }

    trainers = await Trainer.all();
    console.log(`trainers = ${trainers.rows.length}`);
  }
}

module.exports = TrainerSeeder
