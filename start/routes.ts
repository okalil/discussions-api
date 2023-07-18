/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/users', 'UsersController.store')
  Route.post('/users/login', 'UsersController.login')

  Route.get('/discussions', 'DiscussionsController.index')
  Route.get('/discussions/:id/comments', 'CommentsController.index')

  Route.group(() => {
    Route.get('/profile', 'UsersController.profile')
    Route.put('/profile', 'UsersController.update')

    Route.post('/discussions', 'DiscussionsController.store')
    Route.put('/discussions/:id', 'DiscussionsController.update')
    Route.delete('/discussions/:id', 'DiscussionsController.delete')

    Route.post('/discussions/:id/comments', 'CommentsController.store')
    Route.put('/discussions/:id/comments/:commentId', 'CommentsController.update')
    Route.delete('/discussions/:id/comments/:commentId', 'CommentsController.destroy')

    Route.post('/discussions/:id/comments/:commentId/votes', 'VotesController.store')
    Route.delete('/discussions/:id/comments/:commentId/votes', 'VotesController.destroy')
  }).middleware('auth')
}).prefix('/api/v1')
