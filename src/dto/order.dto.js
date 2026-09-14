// dto/order.dto.js
class OrderDTO {
    constructor(order) {
        this.id = order.order_id;
        this.customerId = order.customer_id;
        this.employeeId = order.employee_id;
        this.orderDate = order.order_date;
        this.requiredDate = order.required_date;
        this.shippedDate = order.shipped_date;
        this.freight = order.freight;
        this.shipTo = {
            name: order.ship_name,
            address: order.ship_address,
            city: order.ship_city,
            region: order.ship_region,
            postalCode: order.ship_postal_code,
            country: order.ship_country
        };
    }
}

module.exports = OrderDTO;