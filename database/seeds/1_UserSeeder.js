'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const User = use('App/Models/User');
const Profile = use('App/Models/Profile');

class UserSeeder {
  async run () {
    await User.query().delete();
    await Profile.query().delete();
    let users = await User.all();
    console.log(`users = ${users.rows.length}`);
    let profiles = await Profile.all();
    console.log(`profiles = ${profiles.rows.length}`);

    let user = new User();
    user.username = 'shawn ning';
    user.email = 'zxning@gmail.com';
    user.phone = '416-123-4567';
    user.password = '123456';

    await user.profile().create({ address: 'address' });
    await user.save();

    user = new User();
    user.username = 'cindy tu';
    user.email = 'cindy@gmail.com';
    user.phone = '647-123-4567';
    user.password = '123456';

    await user.profile().create({ address: 'address' });
    await user.save();

    for (let i=10; i<100; i++){
      await User.create({
        "username": `user ${i}`,
        "phone": `289-123-45${i}`,
        "email": `user${i}@skyfitness.ca`,
        'password': '123456'
      });
    }

    users = await User.all();
    console.log(`users = ${users.rows.length}`);
    profiles = await Profile.all();
    console.log(`profiles = ${profiles.rows.length}`);

  }
}

module.exports = UserSeeder
