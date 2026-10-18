// models/order.entity.js
class Order {
    constructor(row) {
        this.order_id = row.order_id;
        this.customer_id = row.customer_id;
        this.employee_id = row.employee_id;
        this.order_date = row.order_date;
        this.required_date = row.required_date;
        this.shipped_date = row.shipped_date;
        this.ship_via = row.ship_via;
        this.freight = row.freight;
        this.ship_name = row.ship_name;
        this.ship_address = row.ship_address;
        this.ship_city = row.ship_city;
        this.ship_region = row.ship_region;
        this.ship_postal_code = row.ship_postal_code;
        this.ship_country = row.ship_country;
    }
}

module.exports = Order;