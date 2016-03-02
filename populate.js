'use strict'

const _ = require('lodash')
const faker = require('faker')

const allSpecies = [
  "'dog'",
  "'cat'",
  "'rabbit'",
  "'turtle'",
  "'hamster'",
]

const allBreeds = [
  "'chihuahua'",
  "'basset hound'",
  "'corgi'",
  "'german shepherd'",
  "'golden retriever'",
  "'chow chow'",
  "'beagle'",
  "'bulldog'",
  "'boxer'",
  "'poodle'",
  "'dachshund'"
]

for (let i = 1; i <= 1000000; i++) {
  let species = _.sample(allSpecies)
  let breed = species === "'dog'" ? _.sample(allBreeds) : 'null'
  console.log('INSERT INTO pet VALUES(DEFAULT, %s, %s, %s, %s, %s);',
    "'" + faker.name.firstName() + "'",              // name
    "'" + faker.date.future().toISOString() + "'",   // available_from
    _.random(1,20),                                  // age
    species,                                         // species
    breed)                                           // breed
}

for (let i = 1; i <= 500000; i++) {
  let species = _.sampleSize(allSpecies, _.random(allSpecies.length))
  species = species.length === 0 ? 'null' : `ARRAY[${species.valueOf()}]`
  let breeds = _.sampleSize(allBreeds, _.random(2))
  breeds = breeds.length === 0 ? 'null' : `ARRAY[${breeds.valueOf()}]`
  console.log('INSERT INTO customer VALUES(DEFAULT, %s, %s, %s, %s);',
    _.random(3, 5),                                 // prefMinAge
    _.random(10, 15),                               // prefMaxAge
    species,                                        // prefSpecies
    breeds)                                         // prefBreeds
}
