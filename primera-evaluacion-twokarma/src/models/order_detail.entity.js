// models/order_detail.entity.js
class OrderDetail {
    constructor(row) {
        this.order_id = row.order_id;
        this.product_id = row.product_id;
        this.unit_price = row.unit_price;
        this.quantity = row.quantity;
        this.discount = row.discount;
    }
}

module.exports = OrderDetail;