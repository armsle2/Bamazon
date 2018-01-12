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
	displayPrompt();
});


let displayPrompt = ()=>{
	connection.query('SELECT * FROM products', (err,results)=>{
			if(err){
				console.log(err)
			}else{inquirer.prompt([
				{
					type: 'list',
					choices: [`View Product Sales by Department`, `Create New Department`],
					name: 'options',
					message: 'You are logged in as a Supervisor, what do you want to do?'
				}
				]).then(answers=>{
					if(answers.options===`View Product Sales by Department`){
						displaySales();
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

let displaySales = ()=>{
	connection.query(
		`SELECT departments.department_id, 
		departments.department_name, 
		departments.over_head_costs, 
		SUM(products.product_sales) AS product_sales, 
		SUM(products.product_sales) - FLOOR(AVG(departments.over_head_costs)) AS total_profit
		FROM products 
		INNER JOIN departments ON departments.department_name=products.department_name 
		GROUP BY department_id`, (err,results)=>{
		if(err){
			console.log(err)
		}else{
			results.forEach((results, index)=>{
				console.log('Department ID: '+results.department_id +'\n'+ 'Department: '+results.department_name+'\n'+ 'Over Head Costs: $'+results.over_head_costs+'\n'+ 'Product Sales: $'+results.product_sales+'\n'+ 'Total Profit: $'+results.total_profit+'\n-----------------');
			});
			mainMenuPrompt();
		}
	});
}

let mainMenuPrompt = ()=>{
	inquirer.prompt([
	{
		type: 'confirm',
		name: 'doMore',
		message: 'Would you like to go back to the main menu?'
	}]).then(answers=>{
		if(answers.doMore){
			displayPrompt();
		}else{
			process.exit();
		}
	})
}