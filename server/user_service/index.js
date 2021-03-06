const Hapi = require('@hapi/hapi')
const Boom = require('boom')

const UserController = require('./controllers/users')
const UsersDAO = require('./adapters/users-dao')

const { DATABASE_URL } = process.env

const userController = UserController({ UsersDAO: UsersDAO(DATABASE_URL) })

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: { cors: true },
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: async () => {
      try {
        return await userController.list()
      } catch (error) {
        throw Boom.badRequest(error)
      }
    },
  })

  server.route({
    method: 'GET',
    path: '/{id}',
    handler: async request => {
      const id = request.params.id
      try {
        const response = await userController.get(id)
        if (response === null) return Boom.notFound('User not found')
        else return response
      } catch (error) {
        throw Boom.badRequest(error)
      }
    },
  })

  server.route({
    method: 'POST',
    path: '/',
    handler: async request => {
      const name = request.payload.name
      try {
        return await userController.create(name)
      } catch (error) {
        throw Boom.badRequest(error)
      }
    },
  })

  server.route({
    method: 'PUT',
    path: '/{id}',
    handler: async request => {
      const name = request.payload.name
      const id = request.params.id
      try {
        return await userController.update(id, name)
      } catch (error) {
        throw Boom.badRequest(error)
      }
    },
  })

  server.route({
    method: 'DELETE',
    path: '/{id}',
    handler: async request => {
      const id = request.params.id
      try {
        return await userController.delete(id)
      } catch (error) {
        throw Boom.badRequest(error)
      }
    },
  })

  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
  console.log(err)
  process.exit(1)
})

init()
