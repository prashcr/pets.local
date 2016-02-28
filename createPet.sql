create table Pet (
  id int primary key,
  name varchar not null,
  available_from timestamp not null,
  age int not null,
  species varchar not null,
  breed varchar
);
