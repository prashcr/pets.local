CREATE TABLE Customer (
  id SERIAL PRIMARY KEY,
  prefMinAge INT,
  prefMaxAge INT,
  prefSpecies TEXT[] CONSTRAINT prefSpecies_not_empty CHECK (array_length(prefSpecies, 1) > 0),
  prefBreeds TEXT[] CONSTRAINT prefBreeds_not_empty CHECK (array_length(prefBreeds, 1) > 0)
);
