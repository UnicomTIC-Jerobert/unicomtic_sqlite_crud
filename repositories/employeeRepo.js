const { dbAll, dbGet, dbRun } = require('../helpers/dbHelpers');

// Fetch all employees
async function getAllEmployees() {
    return dbAll(`SELECT * FROM Employee`);
}

// Fetch a single employee by ID
async function getEmployeeById(employeeId) {
    return dbGet(`SELECT * FROM Employee WHERE id = ?`, [employeeId]);
}


// Fetch contacts for a single employee by ID
async function getEmployeeContacts(employeeId) {
    return dbAll(`SELECT * FROM EmployeeContact WHERE employeeId = ?`, [employeeId]);
}

// Fetch employee with contacts using JOIN
async function getEmployeeWithContacts(employeeId) {
    const query = `
        SELECT e.id, e.firstname, e.lastname, e.dob, c.phoneNumbers, c.addresses
        FROM Employee e
        LEFT JOIN EmployeeContact c ON e.id = c.employeeId
        WHERE e.id = ?`;
    return dbGet(query, [employeeId]);
}

// Add a new employee
async function addNewEmployee(empId, firstname, lastname, dob) {
    return dbRun(`INSERT INTO Employee (id, firstname, lastname, dob) VALUES (?, ?, ?, ?)`,
        [empId, firstname, lastname, dob]);
}

// Add employee contacts
async function addEmployeeContacts(employeeId, phoneNumbers, addresses) {
    return dbRun(`INSERT INTO EmployeeContact (employeeId, phoneNumbers, addresses) VALUES (?, ?, ?)`,
        [employeeId, phoneNumbers, addresses]);
}

// Update employee details
async function updateEmployee(employeeId, firstname, lastname, dob) {
    return dbRun(`UPDATE Employee SET firstname = ?, lastname = ?, dob = ? WHERE id = ?`,
        [firstname, lastname, dob, employeeId]);
}

// Update employee contacts
async function updateEmployeeContacts(employeeId, phoneNumbers, addresses) {
    return dbRun(`UPDATE EmployeeContact SET phoneNumbers = ?, addresses = ? WHERE employeeId = ?`,
        [phoneNumbers, addresses, employeeId]);
}

// Delete employee and contacts
async function deleteEmployee(employeeId) {
    await dbRun(`DELETE FROM EmployeeContact WHERE employeeId = ?`, [employeeId]);  // Delete contacts first
    return dbRun(`DELETE FROM Employee WHERE id = ?`, [employeeId]);                // Then delete employee
}

module.exports = {
    getAllEmployees,
    getEmployeeById,
    getEmployeeContacts,
    getEmployeeWithContacts,
    addNewEmployee,
    addEmployeeContacts,
    updateEmployee,
    updateEmployeeContacts,
    deleteEmployee,
    getEmployeeById
};
