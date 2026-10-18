// models/employee.entity.js
class Employee {
    constructor(row) {
        this.employee_id = row.employee_id;
        this.last_name = row.last_name;
        this.first_name = row.first_name;
        this.title = row.title;
        this.title_of_courtesy = row.title_of_courtesy;
        this.birth_date = row.birth_date;
        this.hire_date = row.hire_date;
        this.address = row.address;
        this.city = row.city;
        this.region = row.region;
        this.postal_code = row.postal_code;
        this.country = row.country;
        this.home_phone = row.home_phone;
        this.extension = row.extension;
        this.notes = row.notes;
        this.reports_to = row.reports_to;
        this.photo_path = row.photo_path;
    }
}

module.exports = Employee;