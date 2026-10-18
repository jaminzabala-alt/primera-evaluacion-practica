// dto/employee.dto.js
class EmployeeDTO {
    constructor(employee) {
        this.id = employee.employee_id;
        this.fullName = `${employee.first_name} ${employee.last_name}`;
        this.title = employee.title;
        this.titleOfCourtesy = employee.title_of_courtesy;
        this.city = employee.city;
        this.country = employee.country;
        this.hireDate = employee.hire_date;
        this.reportsTo = employee.reports_to;
    }
}

module.exports = EmployeeDTO;