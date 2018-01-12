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
	displayAllItems(askUser);
});

let displayAllItems = (cb)=>{
	connection.query('SELECT item_id, product_name, price_usd FROM products', (err,results)=>{
		if(err){
			console.log(err)
		}else{
			results.forEach((results, index)=>{
				console.log('Item: '+results.item_id +'\n'+ 'Product: '+results.product_name+'\n'+ 'Price: $'+results.price_usd+'\n-----------------');
			});
			cb(results);
		}
	});
}

let askUser = (items)=>{
	inquirer.prompt([
	{
		name: 'item',
		type: 'list',
		choices: ()=>{
			let itemsArr = [];
			items.forEach((results, index)=>{
				itemsArr.push(`${results.item_id} '${results.product_name}' Price: $${results.price_usd}`);
			});
			return itemsArr;
		},
		message: 'Please select the product you would like to buy.'
	}, {
		name: 'quantity',
		type: 'input',
		message: 'How many would you like to buy?',
		validate: (value)=>{
			if(!isNaN(value)){
				return true;
			}else{
				return false;
			}
		}
	}
	]).then(answers=>{
		let quantity = parseFloat(answers.quantity);
		let item = answers.item.split(`'`)[1];
		checkInventory(item, quantity);
	})
}

let checkInventory = (item, quantity)=>{
	connection.query('SELECT * FROM products WHERE product_name = ?;', [item],(err, results)=>{
			if (err) throw err;
			if(quantity > results[0].stock_quantity){
				if(results[0].stock_quantity > 0){
				console.log(`Sorry man, we only have ${results[0].stock_quantity} in stock.`)
				changeOrderChoice(item);
				}else{
					console.log(`Sorry man, we're out of stock on this item.`);
					orderChoice();
				}
				
			}else{
				let price = results[0].price_usd * quantity;
				console.log(`Your total is $${price}. Thank You For Your Purchase!`);
				updateInventory(item, quantity);
				updateItemRevenue(item, price);
				orderChoice();

			}
		})
}

let updateInventory = (item, quantity) => {
    connection.query(`UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_name = ?`, [quantity, item], (err, results) => {
        if (err) throw err;
    })
}

let updateItemRevenue = (item, price)=>{
	connection.query(`UPDATE products SET product_sales = product_sales + ? WHERE product_name = ?`, [price, item], (err, results) => {
        if (err) throw err;
    })
}

let orderChoice = ()=>{
	inquirer.prompt([
	{
		type: 'confirm',
		name: 'orderMore',
		message: 'Would you like to place another order?'
	}]).then(answers=>{
		if(answers.orderMore){
			displayAllItems(askUser);
		}else{
			process.exit();
		}
	})
}

let changeOrderChoice = (item)=>{
	inquirer.prompt([
	{
		type: 'list',
		name: 'changeQuantity',
		choices: ['Change Quantity', 'Go Back To Main Menu', 'Cancel Order'],
		message: 'What would you like to do?'
	}]).then(answers=>{
		if(answers.changeQuantity==='Change Quantity'){
			inquirer.prompt([{
				name: 'quantity',
				type: 'input',
				message: 'How many would you like to buy?',
				validate: (value)=>{
					if(!isNaN(value)){
						return true;
					}else{
						return false;
					}
				}
			}]).then(answers=>{
				let quantity = parseFloat(answers.quantity);
				// let item = answers.item.split(`'`)[1];
				checkInventory(item, quantity);
			})
		}else if(answers.changeQuantity==='Go Back To Main Menu'){
			displayAllItems(askUser);
		}else{
			process.exit();
		}
	})
}