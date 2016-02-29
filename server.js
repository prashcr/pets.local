'use strict'

const knex = require('knex')({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: {
    min: 2,
    max: 10
  }
})
const Promise = require('bluebird')
const logger = require('morgan')
const bodyParser = require('body-parser')
const express = require('express')
const customerPreferences = require('./lib/customer-preferences')
const isInt = Number.isInteger
const app = express()
const pets = express.Router()
const customers = express.Router()
const port = process.env.PORT || 4545

const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.json({ error: err })
}

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/pets', pets)
app.use('/customers', customers)
app.use(logErrors)
app.use(errorHandler)

pets.post('/', (req, res, next) => {
  knex('pet')
    .insert(req.body)
    .then(r => res.status(201).json({ message: 'Pet created' }))
    .catch(next)
})

pets.get('/:id', (req, res, next) => {
  const id = +req.params.id
  if (!isInt(id)) {
    return res.status(400).json({ error: 'Make sure ids are integers' })
  }
  knex('pet')
    .where({ id }) // ES6 Object Literal Property Value Shorthand, for {id: id}
    .then(r => res.json(r))
    .catch(next)
})

//TODO Paginate for efficiency
pets.get('/:id/matches', (req, res, next) => {
  const pet_id = +req.params.id
  if (!isInt(pet_id)) {
    return res.status(400).json({ error: 'Make sure ids are integers' })
  }
  // Gets all customers not in Adopted that either have null preference
  // Or have this pet in their matches
  knex('customer')
    .whereNotIn('id', function() {
      this.select('cust_id').from('adopted')
    })
    .then(r => r)
    .filter(customer => {
      if (customer.preference === null) {
        return true
      }
      const matchedPets = knex('pet')
        .select('pet.id')
        .whereNotIn('id', function() {
          this.select('pet_id').from('adopted')
        })
        .whereRaw(customerPreferences(customer.preference))
      return matchedPets
        .map(pet => pet.id)
        .then(ids => ids.indexOf(pet_id) !== -1)
    })
    .then(r => res.json(r))
    .catch(next)
})

customers.post('/', (req, res, next) => {
  // Validate customer's preference before insertion
  try {
    customerPreferences(req.body.preference)
  } catch (e) {
    return next(e)
  }
  knex('customer')
    .insert(req.body)
    .then(r => res.status(201).json({ message: 'Customer created' }))
    .catch(next)
})

customers.get('/:id', (req, res, next) => {
  const id = +req.params.id
  if (!isInt(id)) {
    return res.status(400).json({ error: 'Make sure ids are integers' })
  }
  knex('customer')
    .where({ id })
    .then(r => res.json(r))
    .catch(next)
})

//TODO Paginate for efficiency
customers.get('/:id/matches', (req, res, next) => {
  const id = +req.params.id
  if (!isInt(id)) {
    return res.status(400).json({ error: 'Make sure ids are integers' })
  }
  // Find customer matching id who isn't in Adopted, then either match customer
  // with all pets if preference is null or run another query to find matches
  knex('customer')
    .where({ id })
    .whereNotIn('id', function() {
      this.select('cust_id').from('adopted')
    })
    .map(customer => {
      const notAdoptedPets = knex('pet')
        .whereNotIn('id', function() {
          this.select('pet_id').from('adopted')
        })
      if (customer.preference === null) {
        return notAdoptedPets
      }
      return notAdoptedPets
        .whereRaw(customerPreferences(customer.preference))
    })
    .reduce((prev, cur) => prev.concat(cur), []) // flatten by one level
    .then(r => res.json(r))
    .catch(next)
})

//TODO Add websocket route
//customer.ws...

customers.post('/:id/adopt', (req, res, next) => {
  const cust_id = +req.params.id
  const pet_id = +req.query.pet_id
  if (!isInt(cust_id) || !isInt(pet_id)) {
    return res.status(400).json({ error: 'Make sure ids are integers' })
  }
  knex('adopted')
    .insert({ cust_id, pet_id })
    .then(r => res.status(201).json({ message: 'Pet adopted' }))
    .catch(next)
})

app.listen(port, () => console.log(`Server started at http://localhost:${port}`))
