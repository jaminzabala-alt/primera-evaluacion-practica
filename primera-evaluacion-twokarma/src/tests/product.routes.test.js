const request = require('supertest');
const ProductService = require('../services/product.service');
const ProductDTO = require('../dto/product.dto');

jest.mock('../config/db');
jest.mock('../services/product.service');
jest.mock('../dto/product.dto');
jest.mock('../middlewares/auth.middleware', () => (req, res, next) => next()); // simula usuario autenticado

const app = require('../server'); // Asegúrate de que server.js exporte la app

describe('Product Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/products', () => {
        it('debería listar todos los productos con DTO aplicado', async () => {
            const mockProducts = [
                { product_id: 1, product_name: 'Chai' },
                { product_id: 2, product_name: 'Chang' },
            ];
            const mockProductDTOs = [
                { id: 1, name: 'Chai' },
                { id: 2, name: 'Chang' },
            ];
            ProductService.getAllProducts.mockResolvedValue(mockProducts);
            ProductDTO.mockImplementation((product) => product);

            const response = await request(app).get('/api/products').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(ProductService.getAllProducts).toHaveBeenCalled();
            expect(response.body).toEqual(mockProductDTOs);
        });

        it('debería manejar errores en el servidor', async () => {
            ProductService.getAllProducts.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/products').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /api/products/:id', () => {
        it('debería devolver un producto específico con DTO aplicado', async () => {
            const mockProduct = { product_id: 1, product_name: 'Chai' };
            const mockProductDTO = { id: 1, name: 'Chai' };
            ProductService.getProductById.mockResolvedValue(mockProduct);
            ProductDTO.mockImplementation((product) => product);

            const response = await request(app).get('/api/products/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(ProductService.getProductById).toHaveBeenCalledWith('1');
            expect(response.body).toEqual(mockProductDTO);
        });

        it('debería devolver 404 si el producto no se encuentra', async () => {
            ProductService.getProductById.mockResolvedValue(null);
            const response = await request(app).get('/api/products/999').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Producto no encontrado' });
        });

        it('debería manejar errores en el servidor', async () => {
            ProductService.getProductById.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/products/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('POST /api/products', () => {
        const validProduct = { product_name: 'Nuevo Producto', category_id: 1, unit_price: 10 };

        it('debería crear un producto con DTO aplicado', async () => {
            const mockProduct = { product_id: 78, product_name: 'Nuevo Producto' };
            ProductService.createProduct.mockResolvedValue(mockProduct);
            ProductDTO.mockImplementation((product) => product);

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', 'Bearer mockToken')
                .send(validProduct);

            expect(response.status).toBe(201);
            expect(ProductService.createProduct).toHaveBeenCalledWith(validProduct);
            expect(response.body).toEqual(mockProduct);
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', 'Bearer mockToken')
                .send({ category_id: 1 });

            expect(response.status).toBe(400);
            expect(ProductService.createProduct).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            ProductService.createProduct.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', 'Bearer mockToken')
                .send(validProduct);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('PUT /api/products/:id', () => {
        const validProduct = { unit_price: 25.5 };

        it('debería actualizar un producto con DTO aplicado', async () => {
            const mockProduct = { product_id: 1, unit_price: 25.5 };
            ProductService.updateProduct.mockResolvedValue(mockProduct);
            ProductDTO.mockImplementation((product) => product);

            const response = await request(app)
                .put('/api/products/1')
                .set('Authorization', 'Bearer mockToken')
                .send(validProduct);

            expect(response.status).toBe(200);
            expect(ProductService.updateProduct).toHaveBeenCalledWith('1', validProduct);
            expect(response.body).toEqual(mockProduct);
        });

        it('debería devolver 404 si el producto no existe', async () => {
            ProductService.updateProduct.mockResolvedValue(null);
            const response = await request(app)
                .put('/api/products/999')
                .set('Authorization', 'Bearer mockToken')
                .send(validProduct);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Producto no encontrado' });
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .put('/api/products/1')
                .set('Authorization', 'Bearer mockToken')
                .send({});

            expect(response.status).toBe(400);
            expect(ProductService.updateProduct).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            ProductService.updateProduct.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .put('/api/products/1')
                .set('Authorization', 'Bearer mockToken')
                .send(validProduct);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('debería eliminar un producto', async () => {
            ProductService.deleteProduct.mockResolvedValue(true);
            const response = await request(app).delete('/api/products/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(204);
            expect(ProductService.deleteProduct).toHaveBeenCalledWith('1');
        });

        it('debería devolver 404 si el producto no existe', async () => {
            ProductService.deleteProduct.mockResolvedValue(false);
            const response = await request(app).delete('/api/products/999').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Producto no encontrado' });
        });

        it('debería manejar errores en el servidor', async () => {
            ProductService.deleteProduct.mockRejectedValue(new Error('Database error'));
            const response = await request(app).delete('/api/products/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });
});