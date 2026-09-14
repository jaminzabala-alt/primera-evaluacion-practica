const request = require('supertest');
const OrderService = require('../services/order.service');
const OrderDTO = require('../dto/order.dto');

jest.mock('../config/db');
jest.mock('../services/order.service');
jest.mock('../dto/order.dto');
jest.mock('../middlewares/auth.middleware', () => (req, res, next) => next()); // simula usuario autenticado

const app = require('../server'); // Asegúrate de que server.js exporte la app

describe('Order Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/orders', () => {
        it('debería listar todas las ordenes con DTO aplicado', async () => {
            const mockOrders = [
                { order_id: 10248, customer_id: 'VINET' },
                { order_id: 10249, customer_id: 'TOMSP' },
            ];
            const mockOrderDTOs = [
                { id: 10248, customerId: 'VINET' },
                { id: 10249, customerId: 'TOMSP' },
            ];
            OrderService.getAllOrders.mockResolvedValue(mockOrders);
            OrderDTO.mockImplementation((order) => order);

            const response = await request(app).get('/api/orders').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(OrderService.getAllOrders).toHaveBeenCalled();
            expect(response.body).toEqual(mockOrderDTOs);
        });

        it('debería manejar errores en el servidor', async () => {
            OrderService.getAllOrders.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/orders').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /api/orders/:id', () => {
        it('debería devolver una orden específica con DTO aplicado', async () => {
            const mockOrder = { order_id: 10248, customer_id: 'VINET' };
            const mockOrderDTO = { id: 10248, customerId: 'VINET' };
            OrderService.getOrderById.mockResolvedValue(mockOrder);
            OrderDTO.mockImplementation((order) => order);

            const response = await request(app).get('/api/orders/10248').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(OrderService.getOrderById).toHaveBeenCalledWith('10248');
            expect(response.body).toEqual(mockOrderDTO);
        });

        it('debería devolver 404 si la orden no se encuentra', async () => {
            OrderService.getOrderById.mockResolvedValue(null);
            const response = await request(app).get('/api/orders/99999').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Orden no encontrada' });
        });

        it('debería manejar errores en el servidor', async () => {
            OrderService.getOrderById.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/orders/10248').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /api/orders/:id/details', () => {
        it('debería devolver el detalle de una orden', async () => {
            const mockOrder = { order_id: 10248, customer_id: 'VINET' };
            const mockDetails = [
                { order_id: 10248, product_id: 11, product_name: 'Queso Cabrales', quantity: 12 },
            ];
            OrderService.getOrderById.mockResolvedValue(mockOrder);
            OrderService.getOrderDetails.mockResolvedValue(mockDetails);

            const response = await request(app).get('/api/orders/10248/details').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(OrderService.getOrderDetails).toHaveBeenCalledWith('10248');
            expect(response.body).toEqual(mockDetails);
        });

        it('debería devolver 404 si la orden no existe', async () => {
            OrderService.getOrderById.mockResolvedValue(null);
            const response = await request(app).get('/api/orders/99999/details').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Orden no encontrada' });
            expect(OrderService.getOrderDetails).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            OrderService.getOrderById.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/orders/10248/details').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('POST /api/orders', () => {
        const validOrder = { customer_id: 'VINET', employee_id: 5, order_date: '1996-07-04' };

        it('debería crear una orden con DTO aplicado', async () => {
            const mockOrder = { order_id: 11078, customer_id: 'VINET' };
            OrderService.createOrder.mockResolvedValue(mockOrder);
            OrderDTO.mockImplementation((order) => order);

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', 'Bearer mockToken')
                .send(validOrder);

            expect(response.status).toBe(201);
            expect(OrderService.createOrder).toHaveBeenCalledWith(validOrder);
            expect(response.body).toEqual(mockOrder);
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', 'Bearer mockToken')
                .send({ employee_id: 5 });

            expect(response.status).toBe(400);
            expect(OrderService.createOrder).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            OrderService.createOrder.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', 'Bearer mockToken')
                .send(validOrder);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('PUT /api/orders/:id', () => {
        const validOrder = { freight: 15.5 };

        it('debería actualizar una orden con DTO aplicado', async () => {
            const mockOrder = { order_id: 10248, freight: 15.5 };
            OrderService.updateOrder.mockResolvedValue(mockOrder);
            OrderDTO.mockImplementation((order) => order);

            const response = await request(app)
                .put('/api/orders/10248')
                .set('Authorization', 'Bearer mockToken')
                .send(validOrder);

            expect(response.status).toBe(200);
            expect(OrderService.updateOrder).toHaveBeenCalledWith('10248', validOrder);
            expect(response.body).toEqual(mockOrder);
        });

        it('debería devolver 404 si la orden no existe', async () => {
            OrderService.updateOrder.mockResolvedValue(null);
            const response = await request(app)
                .put('/api/orders/99999')
                .set('Authorization', 'Bearer mockToken')
                .send(validOrder);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Orden no encontrada' });
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .put('/api/orders/10248')
                .set('Authorization', 'Bearer mockToken')
                .send({});

            expect(response.status).toBe(400);
            expect(OrderService.updateOrder).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            OrderService.updateOrder.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .put('/api/orders/10248')
                .set('Authorization', 'Bearer mockToken')
                .send(validOrder);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('DELETE /api/orders/:id', () => {
        it('debería eliminar una orden', async () => {
            OrderService.deleteOrder.mockResolvedValue(true);
            const response = await request(app).delete('/api/orders/10248').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(204);
            expect(OrderService.deleteOrder).toHaveBeenCalledWith('10248');
        });

        it('debería devolver 404 si la orden no existe', async () => {
            OrderService.deleteOrder.mockResolvedValue(false);
            const response = await request(app).delete('/api/orders/99999').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Orden no encontrada' });
        });

        it('debería manejar errores en el servidor', async () => {
            OrderService.deleteOrder.mockRejectedValue(new Error('Database error'));
            const response = await request(app).delete('/api/orders/10248').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });
});