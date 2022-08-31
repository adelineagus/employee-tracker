const express = require('express');
const inquirer = require('inquirer');
const mysql= require('mysql2');
const consoleTable= require('console.table');
const { async } = require('rxjs');
const PORT= process.env.PORT||3001;
const app= express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const db= mysql.createConnection(
    {
        host:'localhost',
        user:'root',
        password:'root1505!!',
        database: 'employeetracker_db'
    },
);

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
                console.log(departmentList());
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

function viewDepartments(){
    db.promise().query('SELECT * FROM department')
        .then(([res])=>{
            console.table('All Departments:', res);
            trackerPrompt();
        })
        .catch(error=> {
            throw error;
        })
}

function viewRoles(){
    db.promise().query('SELECT * FROM role')
    .then(([res])=>{
        console.table('All Roles:', res);
        trackerPrompt();
    })
    .catch(error=>{
        throw error;
    })
}

function viewEmployees(){
    db.promise().query('SELECT * FROM employee')
    .then(([res])=>{
        console.table('All Employees:', res);
        trackerPrompt();
    })
    .catch(error=>{
        throw error;
    })
}


function addDepartment() {
    inquirer.prompt(
        {
            name: 'departmentName',
            type: 'input',
            message: 'enter new department name'
        }
    )
    .then(function (answer){
        const sql=  'INSERT INTO department (name) VALUES (?)';
        const newDept= answer.departmentName;
        db.promise().query(sql, newDept)
        .then(([res])=>{
            console.table('All Departments:', res);
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

async function departmentList(){
    var deptList= [];
    db.promise().query('SELECT * FROM department')
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
        const sql= 'INSERT INTO role SET?';
        const params= 
            {
                title:answer.roleName,
                salary:answer.salary,
                department_id:deptIndex + 1
            };
        db.promise().query(sql, params)
        .then(([res])=>{
            console.table('All Roles:',res);
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

async function employeeList(){
    var empList=[];
    db.promise().query('SELECT * FROM employee')
    .then(([res])=>{
        for(var i=0; i<res.length;i++){
            empList.push(res[i].last_name);
        }
    })
    .catch(error=>{
        throw error;
    })
    return empList;
}

async function roleList(){
    var roles=[];
    db.promise().query('SELECT * FROM role')
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
            name: 'manager',
            type: 'list',
            message: 'select manager:',
            choices: employees
        },
        {
            name: 'role',
            type: 'list',
            message: 'select role:',
            choices: roles
        }

    ])
    .then (function (answer){
        let managerIndex
        if(answer.manager==="null"){
            managerIndex=null;
        } else {
            managerIndex= employees.indexOf(answer.manager)+1;
        }
        let roleIndex=roles.indexOf(answer.role);
        const sql= 'INSERT INTO employee SET?';
        const params= 
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: roleIndex + 1,
                manager_id: managerIndex
            }
        db.promise().query(sql, params)
        .then(([res])=>{
            console.table('All Employees:',res);
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

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

        const sql= 'UPDATE employee SET role_id=? WHERE last_name=?';
        const params= [roleIndex+1, answer.employee];
        db.promise().query(sql, params)
        .then(([res])=>{
            console.table('All Employees:',res);
            trackerPrompt();
        })
        .catch(error=>{
            throw error;
        })
    })
}

app.use((req,res)=>{
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


trackerPrompt();
