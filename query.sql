create table users(
fname varchar(30) not null,
lname varchar(30) not null,
username varchar(30) not null,
password varchar(30) not null,
address varchar(100) not null,
city varchar(30) not null,
state varchar(20) not null,
zip varchar(5) not null,
role int(1) default 0,
email varchar(100) not null,
CONSTRAINT pk_username PRIMARY KEY(username),
CONSTRAINT u_name UNIQUE(fname,lname)
);


create table products(
productId int(10) not null,
name varchar(30) not null,
productDescription varchar(1000) not null,
`group` varchar(30) not null,
CONSTRAINT pk_productId PRIMARY KEY(productId)
);


insert into users values ("Jenny","Admin","jadmin","admin",'201 conover road',"pittsburgh","PA","15208",1,"jadmin@cmu.edu");


insert into products values ("1","Beatles Music","sound of heaven","Music");
