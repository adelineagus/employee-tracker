// importing packages needed

const inquirer = require('inquirer');
const mysql= require('mysql2');
const consoleTable= require('console.table');
const { async } = require('rxjs');

//creating connections with mysql
const db= mysql.createConnection(
    {
        host:'localhost',
        user:'root',
        password:'root1505!!',
        database: 'employeetracker_db'
    },
);

//display options for user to choose
function trackerPrompt(){
    inquirer.prompt({
        name: "options",
        type: "list",
        message: "choose the following options:",
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update employee role',
            'Exit'
        ]
    }).then (function(choice){
        //depending on the options chosen by users, specific function will be called and run
        switch(choice.options){
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update employee role':
                updateEmployee();
                break;
            case 'Exit':
                db.end();
    
        }
        
    })
};

//view departments table with id and names
function viewDepartments(){
    db.promise().query('SELECT * FROM departments')
        .then(([res])=>{
            
            //display all departments in table
            console.table('All Departments:', res);
            trackerPrompt();
        })
        .catch(error=> {
            throw error;
        })
}

//view roles table with role title, role id, department name, and role salary
function viewRoles(){
    db.promise().query('SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles JOIN departments on roles.department_id=departments.id')
    .then(([res])=>{
        //display all roles in table
        console.table('All Roles:', res);
        trackerPrompt();
    })
    .catch(error=>{
        throw error;
    })
}

//view employees with employee ids, first name, last name, role title, department, salary, and employee's manager
function viewEmployees(){
    db.promise().query("SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(M.first_name, ' ', M.last_name) AS manager from employees JOIN roles ON employees.role_id=roles.id JOIN departments ON roles.department_id=departments.id LEFT JOIN employees AS M ON employees.manager_id = M.id")
    .then(([res])=>{
        //display all employees in table
        console.table('All Employees:', res);
        trackerPrompt();
    })
    .catch(error=>{
        throw error;
    })
}


//add department and its name to database
function addDepartment() {
    inquirer.prompt(
        {
            name: 'departmentName',
            type: 'input',
            message: 'enter new department name'
        }
    )
    .then(function (answer){
        const sql=  'INSERT INTO departments (name) VALUES (?)';
        const newDept= answer.departmentName;
        db.promise().query(sql, newDept)
        .then(([res])=>{
            console.log('Added ' + newDept + ' to database');
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

//generate an array of department name
async function departmentList(){
    var deptList= [];
    db.promise().query('SELECT * FROM departments')
    .then(([res])=>{
        for(var i=0; i<res.length;i++){
            deptList.push(res[i].name);
        }
    })
    .catch(error=>{
        throw error;
    })
    return deptList;
}

//add role, salary and department infor to database
async function addRole(){
    let departments = await departmentList();
    inquirer.prompt([
        {
            name: 'roleName',
            type:'input',
            message: 'add new role'
        },
        {
            name: 'salary',
            type:'input',
            message: 'enter salary for this role'
        },
        {
            name: 'department',
            type: 'list',
            message: 'choose department',
            choices: departments
        }
    ]).then (function (answer){
        let deptIndex= departments.indexOf(answer.department);
        const sql= 'INSERT INTO roles SET?';
        const params= 
            {
                title:answer.roleName,
                salary:answer.salary,
                department_id:deptIndex + 1
            };
        db.promise().query(sql, params)
        .then(([res])=>{
            console.log('Added '+ answer.roleName + ' to database')
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

//generate an array of employee name
async function employeeList(){
    return db.promise().query('SELECT * FROM employees')
    .then(([res])=>{
        let empList=[];
        for(var i=0; i<res.length;i++){
            empList.push(res[i].first_name + ' ' +res[i].last_name);
        }
        return empList;
    })
    .catch(error=>{
        throw error;
    })
}

//generate an array of role names
async function roleList(){
    var roles=[];
    db.promise().query('SELECT * FROM roles')
    .then(([res])=>{
        for(var i=0; i<res.length;i++){
            roles.push(res[i].title);
        }
    })
    .catch(error=>{
        throw error;
    })
    return roles;
}

//add employee name, role, and manager to database
async function addEmployee(){
    let employees = await employeeList();
    employees.push("null");
    let roles= await roleList();
    inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: 'enter first name'
        },
        {
            name: 'lastName',
            type: 'input',
            message: 'enter last name',
        },
        {
            name: 'role',
            type: 'list',
            message: 'select role:',
            choices: roles
        },
        {
            name: 'manager',
            type: 'list',
            message: 'select manager:',
            choices: employees
        },
    ])
    .then (function (answer){
        let managerIndex

        //when null is selected, managerIndex which is equal to manager_id will be null
        if(answer.manager==="null"){
            managerIndex=null;
        } else {
            //otherwise, manager Id will be index +1 (because array starts at zero)
            managerIndex= employees.indexOf(answer.manager)+1;
        }
        let roleIndex=roles.indexOf(answer.role);
        const sql= 'INSERT INTO employees SET?';
        const params= 
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: roleIndex + 1,
                manager_id: managerIndex
            }
        db.promise().query(sql, params)
        .then(([res])=>{
            console.log('Added '+ answer.firstName + ' '+ answer.lastName + ' to database')
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

//update employee by selecting employee name and new role
async function updateEmployee(){
    let employees = await employeeList();
    let roles= await roleList();
    inquirer.prompt([
        {
            name: 'employee',
            type: 'list',
            message: 'choose employee to update:',
            choices: employees
        },
        {
            name: 'role',
            type: 'list',
            message: 'select new role:',
            choices: roles
        }
    ])
    .then (function(answer){
        let roleIndex=roles.indexOf(answer.role);

        const sql= 'UPDATE employees SET role_id=? WHERE employees.id=?';
        const params= [roleIndex+1, employees.indexOf(answer.employee)+1];
        db.promise().query(sql, params)
        .then(([res])=>{
            console.log("Updated "+ answer.employee + "'s role to database")
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

trackerPrompt();
