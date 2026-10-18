// services/product.service.js
const db = require('../config/db');
const Product = require('../models/product.entity');

class ProductService {
    // Obtener todos los productos (con filtros opcionales)
    static async getAllProducts({ category_id, supplier_id, discontinued } = {}) {
        try {
            const conditions = [];
            const values = [];

            if (category_id) {
                values.push(category_id);
                conditions.push(`category_id = $${values.length}`);
            }
            if (supplier_id) {
                values.push(supplier_id);
                conditions.push(`supplier_id = $${values.length}`);
            }
            if (discontinued !== undefined) {
                values.push(discontinued);
                conditions.push(`discontinued = $${values.length}`);
            }

            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const { rows } = await db.query(
                `SELECT * FROM products ${where} ORDER BY product_id`,
                values
            );
            return rows.map(row => new Product(row));
        } catch (error) {
            throw new Error('Error al obtener los productos');
        }
    }

    // Obtener un producto por ID
    static async getProductById(id) {
        try {
            const { rows } = await db.query('SELECT * FROM products WHERE product_id = $1', [id]);
            if (rows.length === 0) return null;
            return new Product(rows[0]);
        } catch (error) {
            throw new Error('Error al obtener el producto');
        }
    }

    // Verificar si un producto existe (util para validar en order_details)
    static async productExists(id) {
        try {
            const { rows } = await db.query('SELECT 1 FROM products WHERE product_id = $1', [id]);
            return rows.length > 0;
        } catch (error) {
            throw new Error('Error al verificar el producto');
        }
    }

    // Crear un producto
    static async createProduct(data) {
        try {
            const {
                product_name, supplier_id, category_id, quantity_per_unit,
                unit_price, units_in_stock, units_on_order, reorder_level, discontinued
            } = data;

            const { rows } = await db.query(
                `INSERT INTO products
                    (product_name, supplier_id, category_id, quantity_per_unit,
                     unit_price, units_in_stock, units_on_order, reorder_level, discontinued)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                 RETURNING *`,
                [product_name, supplier_id, category_id, quantity_per_unit,
                 unit_price, units_in_stock, units_on_order, reorder_level, discontinued ?? 0]
            );
            return new Product(rows[0]);
        } catch (error) {
            throw new Error('Error al crear el producto');
        }
    }

    // Actualizar un producto
    static async updateProduct(id, data) {
        try {
            const existing = await ProductService.getProductById(id);
            if (!existing) return null;

            const merged = { ...existing, ...data };
            const { rows } = await db.query(
                `UPDATE products SET
                    product_name = $1, supplier_id = $2, category_id = $3,
                    quantity_per_unit = $4, unit_price = $5, units_in_stock = $6,
                    units_on_order = $7, reorder_level = $8, discontinued = $9
                 WHERE product_id = $10
                 RETURNING *`,
                [merged.product_name, merged.supplier_id, merged.category_id,
                 merged.quantity_per_unit, merged.unit_price, merged.units_in_stock,
                 merged.units_on_order, merged.reorder_level, merged.discontinued, id]
            );
            return new Product(rows[0]);
        } catch (error) {
            throw new Error('Error al actualizar el producto');
        }
    }

    // Eliminar un producto
    static async deleteProduct(id) {
        try {
            const { rowCount } = await db.query('DELETE FROM products WHERE product_id = $1', [id]);
            return rowCount > 0;
        } catch (error) {
            throw new Error('Error al eliminar el producto');
        }
    }
}

module.exports = ProductService;