// dto/order_detail.dto.js
class OrderDetailDTO {
    constructor(detail) {
        this.orderId = detail.order_id;
        this.productId = detail.product_id;
        this.productName = detail.product_name; // viene del JOIN con products
        this.unitPrice = detail.unit_price;
        this.quantity = detail.quantity;
        this.discount = detail.discount;
        this.subtotal = Number((detail.unit_price * detail.quantity * (1 - detail.discount)).toFixed(2));
    }
}

module.exports = OrderDetailDTO;