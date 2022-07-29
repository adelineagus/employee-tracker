const express = require('express');
const inquirer = require('inquirer');
const mysql= require('mysql2');
const consoleTable= require('console.table');
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
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update employee role':
                updateEmployee();
                break;
    
        }
        
    })
};

function viewDepartments(){
    db.query('SELECT * FROM department', (err,res)=>{
        if(err){
            res.status(400).json({message: 'error!'});
        } else{
            console.table('All Departments:', res);
            trackerPrompt();
        }
    })
}

function viewRoles(){
    db.query('SELECT * FROM role', (err,res)=>{
        if(err){
            res.status(400).json({message: 'error!'});
        } else{
            console.table('All Roles:', res);
            trackerPrompt();
        }
    })
}

function viewEmployees(){
    db.query('SELECT * FROM employee', (err,res)=>{
        if(err){
            res.status(400).json({message: 'error!'});
        } else{
            console.table('All Employees:', res);
            trackerPrompt();
        }
    })
}

function addDepartment(){
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
        db.query(sql, newDept, (err, res)=>{
            // if (err){
            //     res.status(400).json({error:err.message});
            // } else{
                console.table('All Departments:', res);
                trackerPrompt();
            
                 
        })
    })
}

var deptList= [];
function departmentList(){
    db.query('SELECT * FROM department', function(err,res){
        if(err){
            res.status(400).json({message: 'error!'});
        } else{
            for(var i=0; i<res.length;i++){
                deptList.push(res[i].name);
            }
        }
    })
    return deptList;
}

function addRole(){
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
            choices: departmentList()
        }
    ]).then (function (answer){
        let deptIndex= departmentList().indexOf(answer.department);
        const sql= 'INSERT INTO role SET?';
        const params= 
            {
                title:answer.roleName,
                salary:answer.salary,
                department_id:deptIndex + 1
            }
        db.query(sql, params, function(err,res){
            if(err){
                res.status(400).json({message: 'error!'});
            } else{
                console.table('All Roles:',res);
                trackerPrompt();
            }
        })
    })
}

var deptList= [];
function departmentList(){
    db.query('SELECT * FROM department', function(err,res){
        if(err){
            res.status(400).json({message: 'error!'});
        } else{
            for(var i=0; i<res.length;i++){
                deptList.push(res[i].name);
            }
        }
    })
    return deptList;
}
var empList=[];
function employeeList(){
    db.query('SELECT * FROM employee', function(err,res){
        if(err){
            res.status(400).json({message: 'error!'});
        } else{
            for(var i=0; i<res.length;i++){
                empList.push(res[i].last_name);
            }
        }
    })
    return empList;
}

var roles=[];
function roleList(){
    db.query('SELECT * FROM role', function(err,res){
        if(err){
            res.status(400).json({message: 'error!'});
        } else{
            for(var i=0; i<res.length;i++){
                roles.push(res[i].title);
            }
        }
    })
    return roles;
}

function addEmployee(){
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
            choices: employeeList()
        },
        {
            name: 'role',
            type: 'list',
            message: 'select role:',
            choices: roleList()
        }

    ])
    .then (function (answer){
        let managerIndex= employeeList().indexOf(answer.manager);
        let roleIndex=roleList().indexOf(answer.role);
        console.log(roleIndex);
        const sql= 'INSERT INTO employee SET?';
        const params= 
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: roleIndex + 1,
                manager_id: managerIndex+1
            }
        db.query(sql, params, function(err,res){
            // if(err){
            //     res.status(400).json({message: 'error!'});
            // } else{
                console.table('All Employees:',res);
                trackerPrompt();
            
        })
    })
}

function updateEmployee(){
    inquirer.prompt(
        {
            name: 'employee',
            type: 'list',
            message: 'choose employee to update:',
            choices: employeeList()
        },
        {
            name: 'role',
            type: 'list',
            message: 'select new role:',
            choices: roleList()
        }
    )
    .then (function(answer){
        let roleID;
        db.query('SELECT * FROM role', (err,res)=>{
            if(err){
                res.status(400).json({message: 'error!'});
            } else{
                for(var i=0; i<res.length; i++){
                    if (answer.role==res[a].name){
                        roleID= res[a].id;
                    }
                }
            }
        })
        db.query('UPDATE employee SET WHERE?', {last_name: answer.employee}, {role_id: roleID}, (err,res)=>{
            if(err){
                res.status(400).json({message: 'error!'});
            } else{
                console.table('All Employees:',res);
                trackerPrompt();
            }
        })
    })
}

app.use((req,res)=>{
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


departmentList();
trackerPrompt();
