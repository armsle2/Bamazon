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
	]).then(answers=>{
		quantity = parseFloat(answers.quantity);
		item = answers.item.split(' ').slice(1).toString().replace(/,/g, ' ');
		checkInventory(item, quantity);
	})
}

let checkInventory = (item, quantity)=>{
	connection.query('SELECT * FROM products WHERE product_name = ?;', [item],(err, results)=>{
			if (err) throw err;
			if(quantity > results.stock_quantity){
				console.log(`Sorry man, we're out of stock on this item.`)
			}else{
				console.log(`Your total is $${results[0].price_usd}. Thank You For Your Purchase!`);
				updateInventory(item, quantity);

			}
		})
}

let updateInventory = (item, quantity) => {
    connection.query(`UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_name = ?`, [quantity, item], (err, results) => {
        if (err) throw err;
    })
}