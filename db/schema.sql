/*remove database if exists*/
DROP DATABASE IF EXISTS employeetracker_db;

/*create new database*/
CREATE DATABASE employeetracker_db;

/*use the database*/
USE employeetracker_db;

/* create table for department which include id and name*/
CREATE TABLE departments(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30)
);

/*create table for roles which include id, title, salary, and reference to departments*/
CREATE TABLE roles(
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    FOREIGN KEY (department_id)
    REFERENCES departments(id)
);

/*create table for employees which includes id, first and last name, role id, manager id 
    and reference from role id to roles as well as manager id to employee id*/
CREATE TABLE employees(
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);
