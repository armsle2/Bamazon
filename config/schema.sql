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

