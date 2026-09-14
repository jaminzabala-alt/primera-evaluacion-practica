// models/product.entity.js
class Product {
    constructor(row) {
        this.product_id = row.product_id;
        this.product_name = row.product_name;
        this.supplier_id = row.supplier_id;
        this.category_id = row.category_id;
        this.quantity_per_unit = row.quantity_per_unit;
        this.unit_price = row.unit_price;
        this.units_in_stock = row.units_in_stock;
        this.units_on_order = row.units_on_order;
        this.reorder_level = row.reorder_level;
        this.discontinued = row.discontinued;
    }
}

module.exports = Product;