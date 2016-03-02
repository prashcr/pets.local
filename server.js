'use strict'

const _ = require('lodash')
const logger = require('morgan')
const express = require('express')
const Promise = require('bluebird')
const myh = require('./my-helpers')
const bodyParser = require('body-parser')
const app = require('express-ws-routes')()
const wsStream = require('websocket-stream')
const knex = require('knex')(require('./knexfile'))

const port = process.env.PORT || 4545
const customers = express.Router()
const pets = express.Router()

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/pets', pets)
app.use('/customers', customers)
app.use(myh.logErrors)
app.use(myh.errorHandler)

pets.post('/', (req, res, next) => {
  knex('pet')
    .insert(req.body)
    .then(r => res.status(201).json({ message: 'Pet created' }))
    .catch(next)
})

pets.get('/:id', (req, res, next) => {
  const id = +req.params.id
  knex('pet')
    .where({ id })
    .then(r => res.json(r))
    .catch(next)
})

pets.get('/:id/matches', (req, res, next) => {
  const qs = req.query
  const pet_id = +req.params.id
  knex('customer')
    .select('customer.*')
    .joinRaw(`JOIN pet
      ON (customer.prefMinAge IS NULL OR pet.age >= customer.prefMinAge)
      AND (customer.prefMaxAge IS NULL OR pet.age <= customer.prefMaxAge)
      AND (
        (customer.prefSpecies IS NULL OR pet.species = ANY(customer.prefSpecies)) OR
        (customer.prefBreeds IS NULL OR pet.species = ANY(customer.prefBreeds))
      )`)
    .whereNotIn('customer.id', function() {
      this.select('cust_id').from('adopted')
    })
    .whereNotIn('pet.id', function() {
      this.select('pet_id').from('adopted')
    })
    .orderBy('id', 'desc')
    .limit(myh.getLimit(req.query))
    .offset(myh.getOffset(req.query))
    .then(r => res.json(r))
    .catch(next)
})

customers.post('/', (req, res, next) => {
  knex('customer')
    .insert(req.body)
    .then(r => res.status(201).json({ message: 'Customer created' }))
    .catch(next)
})

customers.get('/:id', (req, res, next) => {
  const id = +req.params.id
  knex('customer')
    .where({ id })
    .then(r => res.json(r))
    .catch(next)
})

customers.get('/:id/matches', (req, res, next) => {
  console.log('limit', req.query.limit)
  const id = +req.params.id
  knex('customer')
    .select('pet.*')
    .joinRaw(`JOIN pet
      ON (customer.prefMinAge IS NULL OR pet.age >= customer.prefMinAge)
      AND (customer.prefMaxAge IS NULL OR pet.age <= customer.prefMaxAge)
      AND (
        (customer.prefSpecies IS NULL OR pet.species = ANY(customer.prefSpecies)) OR
        (customer.prefBreeds IS NULL OR pet.species = ANY(customer.prefBreeds))
      )`)
    .where('customer.id', id)
    .whereNotIn('customer.id', function() {
      this.select('cust_id').from('adopted')
    })
    .whereNotIn('pet.id', function() {
      this.select('pet_id').from('adopted')
    })
    .limit(myh.getLimit(req.query))
    .offset(myh.getOffset(req.query))
    .then(r => res.json(r))
    .catch(next)
})

customers.websocket('/:id/matches', (info, cb, next) => {
  const id = +info.req.params.id
  console.log('WEBSOCKET %s using origin %s',
    info.req.originalUrl || info.req.url,
    info.origin)

  //TODO find some way (triggers?) to push matches' deltas from pg on insert
  cb(socket => {
    const wss = wsStream(socket)
    wss.pipe(wss) // For now, echooo!
  })
})

customers.post('/:id/adopt', (req, res, next) => {
  const cust_id = +req.params.id
  const pet_id = +req.query.pet_id
  knex('adopted')
    .insert({ cust_id, pet_id })
    .then(r => res.status(201).json({ message: 'Pet adopted' }))
    .catch(next)
})

const server = app.listen(port, () => console.log('Server started at http://localhost:%s', port))
