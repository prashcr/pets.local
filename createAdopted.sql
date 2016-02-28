create table Adopted (
  cust_id int references Customer on delete cascade,
  pet_id int references Pet on delete cascade
);
