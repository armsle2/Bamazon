CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products(
	item_id int AUTO_INCREMENT,
	product_name VARCHAR(100),
	department_name VARCHAR(100),
	price_usd int,
	stock_quantity int,
	PRIMARY KEY(item_id)
);
CREATE TABLE departments(
	department_id int AUTO_INCREMENT,
	department_name VARCHAR(100),
	over_head_costs int
	PRIMARY KEY(department_id)
);
ALTER TABLE products
ADD product_sales int;