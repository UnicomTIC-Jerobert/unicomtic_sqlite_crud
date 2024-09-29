const EmployeeDb = require('../repositories/employeeRepo'); // Import the EmployeeDb methods

// Generate a random Employee ID (EMP_XXXX)
const generateEmpId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = 'EMP_';
    for (let i = 0; i < 4; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
};

// List all Employees
async function listEmployees(req, res) {
    try {
        const rows = await EmployeeDb.getAllEmployees();

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<!DOCTYPE html>');
        res.write('<html>');
        res.write('<head>');
        res.write(
            `<style>
                body {
                    background-color: yellow;
                }
                a {
                    text-decoration: none;
                }
            </style>`
        );
        res.write('</head>');
        res.write('<body>');
        res.write('<h1 style="color:red;">Employees</h1>');
        res.write('<a href="/employees/add">Add Employee</a>');
        res.write('<table border="1">');
        res.write('<tr><th>EMP ID</th><th>First Name</th><th>Last Name</th><th>DOB</th></tr>');

        rows.forEach((row) => {
            res.write(`<tr>
                <td>${row.id}</td>
                <td>${row.firstname}</td>
                <td>${row.lastname}</td>
                <td>${row.dob}</td>
                <td><a href="/employees/view?empId=${row.id}">view</a></td>
                <td><a href="/employees/edit?empId=${row.id}">edit</a></td>
                </tr>`);
        });

        res.write('</table>');
        res.write('</body>');
        res.write('</html>');
        res.end();
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write('<h1>Error fetching employees</h1>');
        res.end();
    }
}

// View a single employee with JOIN on contacts
async function viewEmployee(req, res, employeeId) {
    try {
        const employee = await EmployeeDb.getEmployeeWithContacts(employeeId);

        if (!employee) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write('<h1>Employee Not Found</h1>');
            return res.end();
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<h1>${employee.firstname} ${employee.lastname}</h1><p>DOB: ${employee.dob}</p>`);
        res.write('<h2>Contact Details</h2>');
        res.write(`<p>Phone: ${employee.phoneNumbers}</p><p>Address: ${employee.addresses}</p>`);
        res.end();
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write('<h1>Error fetching employee details</h1>');
        res.end();
    }
}

// Add a new employee
async function addEmployee(req, res, formData) {
    const empId = generateEmpId();
    const { firstname, lastname, dob, phoneNumbers, addresses } = formData;

    try {
        await EmployeeDb.addNewEmployee(empId, firstname, lastname, dob);

        const phones = JSON.stringify(phoneNumbers.split(','));
        const addressList = JSON.stringify(addresses.split(','));

        await EmployeeDb.addEmployeeContacts(empId, phones, addressList);

        res.writeHead(302, { 'Location': '/employees' });
        res.end();
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write('<h1>Error adding employee</h1>');
        res.end();
    }
}

// Edit employee
async function editEmployee(req, res, employeeId) {
    try {
        const employee = await EmployeeDb.getEmployeeById(employeeId);

        if (!employee) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>Employee Not Found</h1>');
            return;
        }

        // Generate the Edit Employee HTML form
        let html = `
            <html>
            <head>
                <title>Edit Employee</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    label { display: inline-block; width: 100px; margin-bottom: 10px; }
                    input { padding: 5px; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <h1>Edit Employee</h1>
                <form action="/employees/update" method="POST">
                    <input type="hidden" name="id" value="${employee.id}">
                    <label>First Name:</label>
                    <input type="text" name="firstname" value="${employee.firstname}">
                    <br>
                    <label>Last Name:</label>
                    <input type="text" name="lastname" value="${employee.lastname}">
                    <br>
                    <label>Date of Birth:</label>
                    <input type="date" name="dob" value="${employee.dob}">
                    <br>
                    <button type="submit">Update</button>
                </form>
                <a href="/employees">Back to List</a>
            </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Error loading employee data</h1>');
    }
}

// Update employee details
async function updateEmployee(req, res, employeeId, formData) {
    const { firstname, lastname, dob, phoneNumbers, addresses } = formData;

    try {
        await EmployeeDb.updateEmployee(employeeId, firstname, lastname, dob);

        const phones = JSON.stringify(phoneNumbers.split(','));
        const addressList = JSON.stringify(addresses.split(','));

        await EmployeeDb.updateEmployeeContacts(employeeId, phones, addressList);

        res.writeHead(302, { 'Location': `/employee/${employeeId}` });
        res.end();
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write('<h1>Error updating employee</h1>');
        res.end();
    }
}

// Delete employee
async function deleteEmployee(req, res, employeeId) {
    try {
        await EmployeeDb.deleteEmployee(employeeId);

        res.writeHead(302, { 'Location': '/employees' });
        res.end();
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write('<h1>Error deleting employee</h1>');
        res.end();
    }
}

// View employee with JOIN between Employee and EmployeeContact
async function viewEmployeeWithJoin(req, res, employeeId) {
    try {
        const employee = await EmployeeDb.getEmployeeContacts(employeeId);
        if (!employee) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write('<h1>Employee Not Found</h1>');
            return res.end();
        }

        // Generate the HTML response
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<h1>${employee.firstname} ${employee.lastname}</h1>`);
        res.write(`<p>DOB: ${employee.dob}</p>`);
        res.write('<h2>Contact Details</h2>');
        res.write(`<p>Phone Numbers: ${employee.phoneNumbers ? employee.phoneNumbers : 'N/A'}</p>`);
        res.write(`<p>Addresses: ${employee.addresses ? employee.addresses : 'N/A'}</p>`);
        res.end();
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write('<h1>Error fetching employee details</h1>');
        res.end();
    }
}


module.exports = {
    listEmployees,
    viewEmployee,
    viewEmployeeWithJoin,
    addEmployee,
    editEmployee,
    updateEmployee,
    deleteEmployee
};
