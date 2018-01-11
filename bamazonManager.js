const mysql = require('mysql');
const inquirer = require('inquirer');
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'bamazon'
});

connection.connect(err=>{
	if(err) throw err;
	console.log(`connected`);
	displayPrompt();
});

let displayPrompt = ()=>{
	connection.query('SELECT * FROM products', (err,results)=>{
			if(err){
				console.log(err)
			}else{inquirer.prompt([
				{
					type: 'list',
					choices: [`View Products For Sale`, `View Low Inventory`, `Add To Inventory`, `Add New Product`],
					name: 'options',
					message: 'What do you want to do?'
				}
				]).then(answers=>{
					if(answers.options===`View Products For Sale`){
						displayAllItems();
					}else if(answers.options===`View Low Inventory`){
						displayLowInventory();
					}else if(answers.options===`Add To Inventory`){
						updateQuantityPrompt(results);
					}else if(answers.options===`Add New Product`){
						addProductPrompt();
					}
				});
			}
	});		
}

let displayAllItems = ()=>{
	connection.query('SELECT item_id, product_name, price_usd FROM products', (err,results)=>{
		if(err){
			console.log(err)
		}else{
			results.forEach((results, index)=>{
				console.log('Item: '+results.item_id +'\n'+ 'Product: '+results.product_name+'\n'+ 'Price: $'+results.price_usd+'\n-----------------');
			});
		}
	});
}

let displayLowInventory = ()=>{
	connection.query('SELECT item_id, product_name, price_usd, stock_quantity FROM products WHERE stock_quantity < 5', (err,results)=>{
		if(err){
			console.log(err)
		}else{
			console.log('YOU HAVE '+results.length+' ITEMS LOW ON STOCK!');
			results.forEach((results, index)=>{
				console.log('Item: '+results.item_id +'\n'+ 'Product: '+results.product_name+'\n'+ 'Price: $'+results.price_usd+'\n'+ 'Stock: '+results.stock_quantity+'\n-----------------');
			});
		}
	});
}

let updateQuantityPrompt = (items) => {
	inquirer.prompt([
	{
		name: 'item',
		type: 'list',
		choices: ()=>{
			let itemsArr = [];
			items.forEach((results, index)=>{
				itemsArr.push(`${results.item_id} '${results.product_name}' Stock: ${results.stock_quantity}`);
			});
			return itemsArr;
		},
		message: 'Please select the product you would like to update the quantity on.'
	}, {
		name: 'quantity',
		type: 'input',
		message: 'Please enter a new quantity for this item.',
		validate: (value)=>{
			if(!isNaN(value)){
				return true;
			}else{
				return false;
			}
		}
	}]).then(answers=>{
		let quantity = parseFloat(answers.quantity);
		let item = answers.item.split(`'`)[1];
		updateQuantity(quantity, item);
	}) 
}

let addProductPrompt = ()=>{
	inquirer.prompt([
	{
		name: 'productName',
		type: 'input',
		message: 'Please enter the name of the product.'
	}, {
		name: 'department',
		type: 'input',
		message: 'Please enter the department of the product.'
	}, {
		name: 'price',
		type: 'input',
		message: 'Please enter the price of the product.(ex 300)',
		validate: (value)=>{
			if(!isNaN(value)){
				return true;
			}else{
				return false;
			}
		}
	}, {
		name: 'stock',
		type: 'input',
		message: 'Please enter the quantity of the product.',
	}	
	]).then(answers=>{
		let item = answers.productName;
		let department = answers.department;
		let price = parseFloat(answers.price);
		let quantity = answers.stock;
		addProducts(item, department, price, quantity);
	})	
}

let updateQuantity = (quantity, item) => {
    connection.query(`UPDATE products SET stock_quantity = ? WHERE product_name = ?;`, [quantity, item], (err, results) => {
        if (err) throw err;
        console.log(`The ${item} quantity has been updated to ${quantity}.`);
    })
}

let addProducts = (item, department, price, quantity)=>{
	connection.query('INSERT INTO products(product_name, department_name, price_usd, stock_quantity) VALUES(?, ?, ?, ?)', [item, department, price, quantity], (err, results)=>{
		console.log(`YOU SUCCESSFULLY ADDED A NEW ITEM!`);
		console.log('Item: '+item +'\n'+ 'Department: '+department+'\n'+ 'Price: $'+price+'\n'+ 'Stock: '+quantity+'\n-----------------');
	})
}

