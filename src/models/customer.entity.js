//models/customer.entity.js
class Customer {
    constructor({customer_id, company_name, contact_name,contact_title, address, postal_code }){
        this.customer_id = customer_id;
        this.company_name = company_name;
        this.contact_name = contact_name;
        this.contact_title = contact_title;
        this.address = address;
        this.postal_code = postal_code;
    }
}

module.exports = Customer;