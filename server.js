'use strict'

const knex = require('knex')({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  debug: true
})
const Promise = require('bluebird')
const logger = require('morgan')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const pets = express.Router()
const customers = express.Router()
const port = process.env.PORT || 4545
const isInt = n => n % 1 === 0

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/pets', pets)
app.use('/customers', customers)

pets.post('/', (req, res) => {
  knex('pet')
  .insert(req.body)
  .then(r => res.sendStatus(201))
  .catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})

pets.get('/:id', (req, res) => {
  const id = +req.params.id
  if (!isInt(id)) {
    return res.sendStatus(400)
  }
  knex('pet')
  .where({ id })
  .then(res.json)
  .catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})

// pets.get('/:id/matches', (req, res) => {
//   knex('customers')
//   .whereNotIn('id', () => this.select('cust_id').from('adopted'))
//   .andWhere()
// })

customers.post('/', (req, res) => {
  knex('customer')
  .insert(req.body)
  .then(r => res.sendStatus(201))
  .catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})

customers.get('/:id', (req, res) => {
  const id = +req.params.id
  if (!isInt(id)) {
    return res.sendStatus(400)
  }
  knex('customer')
  .where({ id })
  .then(res.json)
  .catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})

// customers.get('/:id/matches', (req, res) => {
//   knex('pets')
//   .whereNotIn('id', () => this.select('pet_id').from('adopted'))
//   .andWhere()
// })

customers.post('/:id/adopt', (req, res) => {
  const cust_id = +req.params.id
  const pet_id = +req.query.pet_id
  if (!isInt(cust_id) || !isInt(pet_id)) {
    return res.sendStatus(400)
  }
  knex('adopted')
  .insert({ cust_id, pet_id })
  .then(r => res.sendStatus(201))
  .catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})

app.listen(port, () => console.log(`Server started at http://localhost:${port}`))
