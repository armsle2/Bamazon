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
		name: 'item_id',
		type: 'list',
		choices: ()=>{
			let itemsArr = [];
			items.forEach((results, index)=>{
				itemsArr.push(`${results.item_id} ${results.product_name}`);
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
	])
}

// let checkInventory = (item, quantity)=>{
// 	connection.query('SELECT'
// 		)
// }