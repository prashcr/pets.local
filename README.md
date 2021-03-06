Pets.local
=======

Pets.local is a REST API for a pet store app, that aims to match customers with pets, and vice versa.

Pets.local is written in `node.js` using `express`, with `postgres` as the database.

**Usage**
```
$ export PG_CONNECTION_STRING=<your postgres connection string here>
$ npm i
$ npm start
```

server.js
---------

* Basic functionality **complete**.
* Scale extension **complete**.
* Real-time extension **incomplete**. Currently, a websocket echo server is listening at `/customers/:id/matches`. Test using `wscat`
* Location extension **incomplete**

#### Additional info
`/pets/:id/matches` and `/customers/:id/matches` also take `limit` and `offset` as query parameters, without which they default to 50 and 0, respectively.

E.g. `/pets/:id/matches?limit=40&offset=6300`

populate.js
-----------

Script that randomly generates fake values to be inserted into the database.
Tweak script as necessary.

**Usage**
```
$ node populate.js > populate.sql
psql> \i populate.sql
```

*.sql
-----

My `CREATE TABLE` scripts

knexfile.js
-----------

Configuration for `knex`, which is an SQL query builder for `node.js`

my-helpers.js
-------------

Contains a few helper functions I wrote
