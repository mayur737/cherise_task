# cherise_task

Step 1:
Setup the project in you local environment

step2:
create necessary tables in postgre sql
CREATE DATABASE studentdb;

\c studentdb

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT CHECK (age >= 0)
);


CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    marks INT CHECK (marks >= 0 AND marks <= 100),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);


step3:
open backend folder and type the following commands
-->npm install
-->nodemon

step4:
open the frontend folder and type the following commands
-->npm install
-->npm run dev

-----YOU ARE ALL SET WITH THE PROJECT-------
