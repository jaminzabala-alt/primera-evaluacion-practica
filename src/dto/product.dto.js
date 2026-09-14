// dto/product.dto.js
class ProductDTO {
    constructor(product) {
        this.id = product.product_id;
        this.name = product.product_name;
        this.supplierId = product.supplier_id;
        this.categoryId = product.category_id;
        this.quantityPerUnit = product.quantity_per_unit;
        this.unitPrice = product.unit_price;
        this.unitsInStock = product.units_in_stock;
        this.unitsOnOrder = product.units_on_order;
        this.reorderLevel = product.reorder_level;
        this.discontinued = Boolean(product.discontinued);
    }
}

module.exports = ProductDTO;