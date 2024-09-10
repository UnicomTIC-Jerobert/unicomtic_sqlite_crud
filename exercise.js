// Handle Employee Update

const querystring = require('querystring');



// Setup Routing
// Here's the server setup that handles the different routes (/employees, /edit, /update):

const http = require('http');
const url = require('url');
const db = require('./db'); // SQLite database setup

http.createServer((req, res) => {
    const queryObject = url.parse(req.url, true);
    const path = queryObject.pathname;

    if (path === '/employees') {
        listEmployees(req, res);
    }   else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>Page Not Found</h1>');
    }
}).listen(3000, () => {
    console.log('Server running on port 3000');
});

// -----------------------------------------------------





// Function to get the value of a query parameter by name
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Extract videoId from the URL
const videoId = getQueryParam('videoId');

console.log(videoId);  // Output the videoId value



function listEmployeesWithEdit(req, res) {
    const sql = `SELECT e.id, e.firstname, e.lastname, e.dob FROM Employee e`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        let html = `
            <html>
            <head>
                <title>Employees</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h1 { color: #333; }
                </style>
            </head>
            <body>
                <h1>Employees List</h1>
                <a href="/add">Add New Employee</a>
                <ul>
        `;

        // Dynamically build employee list with Edit links
        rows.forEach((row) => {
            html += `<li>${row.firstname} ${row.lastname} (DOB: ${row.dob}) 
                     <a href="/edit?id=${row.id}">Edit</a> 
                     <a href="/delete?id=${row.id}" onclick="return confirm('Are you sure?')">Delete</a></li>`;
        });

        html += `
                </ul>
            </body>
            </html>
        `;

        // Send the response with the dynamically created HTML
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
}

function listEmployeesWithContacts(req, res) {
    const sql = `
        SELECT e.id, e.firstname, e.lastname, e.dob, 
               ec.phoneNumbers, ec.addresses 
        FROM Employee e
        LEFT JOIN EmployeeContact ec 
        ON e.id = ec.employeeId
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<h1>Employees List</h1>');
        rows.forEach((row) => {
            res.write(`<p>${row.id} - ${row.firstname} ${row.lastname} (DOB: ${row.dob})</p>`);
            res.write(`<p>Phone Numbers: ${row.phoneNumbers ? row.phoneNumbers : 'N/A'}</p>`);
            res.write(`<p>Addresses: ${row.addresses ? row.addresses : 'N/A'}</p>`);
        });
        res.end();
    });
}