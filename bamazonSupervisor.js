const mysql = require('mysql');
const inquirer = require('inquirer');
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'bamazon'
});
const {table} = require('table');

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
					}else if(answers.options===`Create New Department`){
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
			let data = [Object.keys(results[0])];
 
			results.forEach((results, index)=>{
				data.push([results.department_id, results.department_name, results.over_head_costs, results.product_sales, results.total_profit]);
			});
			let output = table(data);

			console.log(output);

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

let addDepartment = (department, overHead)=>{
	connection.query('INSERT INTO departments(department_name, over_head_costs) VALUES(?, ?)', [department, overHead], (err, updateStatus)=>{
		console.log(`YOU SUCCESSFULLY ADDED A NEW ITEM!`);
		// console.log(results);
		connection.query('SELECT * FROM departments', (err, results)=>{
			let data = [Object.keys(results[0]), [updateStatus.insertId, department, overHead]];
			let output = table(data);
			console.log(output);
			mainMenuPrompt();

		})
		
		// console.log('Item: '+item +'\n'+ 'Department: '+department+'\n'+ 'Price: $'+price+'\n'+ 'Stock: '+quantity+'\n-----------------');
	});
}
let addProductPrompt = ()=>{
	inquirer.prompt([
	{
		name: 'department',
		type: 'input',
		message: 'Enter the name of the department you would like to create.'
	}, {
		name: 'overHead',
		type: 'input',
		message: 'Enter the overhead costs for this department .(ex 300)',
		validate: (value)=>{
			if(!isNaN(value)){
				return true;
			}else{
				return false;
			}
		}
	}	
	]).then(answers=>{
		let department = answers.department;
		let overHead = parseFloat(answers.overHead);
		addDepartment(department, overHead);
	})	
}