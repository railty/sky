'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('trainers', 'TrainerController.index')
Route.get('trainers.json', 'TrainerController.index')
Route.post('trainers', 'TrainerController.create')
Route.get('trainers/:id', 'TrainerController.show').middleware('auth')
Route.put('trainers/:id', 'TrainerController.update')
Route.delete('trainers/:id', 'TrainerController.delete')

Route.get('users', 'UserController.index')
Route.get('users.json', 'UserController.index')
Route.post('users', 'UserController.create')
Route.get('users/:id', 'UserController.show').middleware('auth')
Route.put('users/:id', 'UserController.update')
Route.delete('users/:id', 'UserController.delete')

Route.get('entries', 'EntryController.index')
Route.get('entries.json', 'EntryController.index')
Route.post('entries', 'EntryController.create')
Route.get('entries/:id', 'EntryController.show').middleware('auth')
Route.put('entries/:id', 'EntryController.update')
Route.delete('entries/:id', 'EntryController.delete')

Route.get('/', 'EntryController.public')
Route.get('entriesPublic', 'EntryController.public')
Route.get('entriesPublic.json', 'EntryController.public')

Route.post('entries/export', 'EntryController.export')