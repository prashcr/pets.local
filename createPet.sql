CREATE TABLE Pet (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  available_from TIMESTAMP NOT NULL,
  age INT NOT NULL,
  species VARCHAR NOT NULL,
  breed VARCHAR CONSTRAINT only_dogs_have_breeds CHECK (breed = NULL or species = 'dog')
);
