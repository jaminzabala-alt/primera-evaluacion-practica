const request = require('supertest');
const CustomerService = require('../services/customer.service');
const CustomerDTO = require('../dto/customer.dto');

jest.mock('../config/db');
jest.mock('../services/customer.service');
jest.mock('../dto/customer.dto');
jest.mock('../middlewares/auth.middleware', () => (req, res, next) => next()); // simula usuario autenticado

const app = require('../server'); // Asegúrate de que server.js exporte la app

describe('Customer Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/customers', () => {
        it('debería listar todos los clientes con DTO aplicado', async () => {
            const mockCustomers = [
                { customer_id: 'ALFKI', company_name: 'Alfreds Futterkiste' },
                { customer_id: 'ANATR', company_name: 'Ana Trujillo Emparedados' },
            ];
            const mockCustomerDTOs = [
                { id: 'ALFKI', company_name: 'Alfreds Futterkiste' },
                { id: 'ANATR', company_name: 'Ana Trujillo Emparedados' },
            ];
            CustomerService.getAllCustomers.mockResolvedValue(mockCustomers);
            CustomerDTO.mockImplementation((customer) => customer);

            const response = await request(app).get('/api/customers').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(CustomerService.getAllCustomers).toHaveBeenCalled();
            expect(response.body).toEqual(mockCustomerDTOs);
        });

        it('debería manejar errores en el servidor', async () => {
            CustomerService.getAllCustomers.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/customers').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /api/customers/:id', () => {
        it('debería devolver un cliente específico con DTO aplicado', async () => {
            const mockCustomer = { customer_id: 'ALFKI', company_name: 'Alfreds Futterkiste' };
            const mockCustomerDTO = { id: 'ALFKI', company_name: 'Alfreds Futterkiste' };
            CustomerService.getCustomerById.mockResolvedValue(mockCustomer);
            CustomerDTO.mockImplementation((customer) => customer);

            const response = await request(app).get('/api/customers/ALFKI').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(CustomerService.getCustomerById).toHaveBeenCalledWith('ALFKI');
            expect(response.body).toEqual(mockCustomerDTO);
        });

        it('debería devolver 404 si el cliente no se encuentra', async () => {
            CustomerService.getCustomerById.mockResolvedValue(null);
            const response = await request(app).get('/api/customers/NOPE1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Cliente no encontrado' });
        });

        it('debería manejar errores en el servidor', async () => {
            CustomerService.getCustomerById.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/customers/ALFKI').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('POST /api/customers', () => {
        const validCustomer = { company_name: 'Nuevo Cliente S.A.', country: 'Mexico' };

        it('debería crear un cliente con DTO aplicado', async () => {
            const mockCustomer = { customer_id: 'NUEV1', company_name: 'Nuevo Cliente S.A.' };
            CustomerService.createCustomer.mockResolvedValue(mockCustomer);
            CustomerDTO.mockImplementation((customer) => customer);

            const response = await request(app)
                .post('/api/customers')
                .set('Authorization', 'Bearer mockToken')
                .send(validCustomer);

            expect(response.status).toBe(201);
            expect(CustomerService.createCustomer).toHaveBeenCalledWith(validCustomer);
            expect(response.body).toEqual(mockCustomer);
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/api/customers')
                .set('Authorization', 'Bearer mockToken')
                .send({ contact_name: 'Sin nombre de compañía' });

            expect(response.status).toBe(400);
            expect(CustomerService.createCustomer).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            CustomerService.createCustomer.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .post('/api/customers')
                .set('Authorization', 'Bearer mockToken')
                .send(validCustomer);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('PUT /api/customers/:id', () => {
        const validCustomer = { company_name: 'Cliente Actualizado S.A.' };

        it('debería actualizar un cliente con DTO aplicado', async () => {
            const mockCustomer = { customer_id: 'ALFKI', company_name: 'Cliente Actualizado S.A.' };
            CustomerService.updateCustomer.mockResolvedValue(mockCustomer);
            CustomerDTO.mockImplementation((customer) => customer);

            const response = await request(app)
                .put('/api/customers/ALFKI')
                .set('Authorization', 'Bearer mockToken')
                .send(validCustomer);

            expect(response.status).toBe(200);
            expect(CustomerService.updateCustomer).toHaveBeenCalledWith('ALFKI', validCustomer);
            expect(response.body).toEqual(mockCustomer);
        });

        it('debería devolver 404 si el cliente no existe', async () => {
            CustomerService.updateCustomer.mockResolvedValue(null);
            const response = await request(app)
                .put('/api/customers/NOPE1')
                .set('Authorization', 'Bearer mockToken')
                .send(validCustomer);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Cliente no encontrado' });
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .put('/api/customers/ALFKI')
                .set('Authorization', 'Bearer mockToken')
                .send({});

            expect(response.status).toBe(400);
            expect(CustomerService.updateCustomer).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            CustomerService.updateCustomer.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .put('/api/customers/ALFKI')
                .set('Authorization', 'Bearer mockToken')
                .send(validCustomer);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('DELETE /api/customers/:id', () => {
        it('debería eliminar un cliente', async () => {
            CustomerService.deleteCustomer.mockResolvedValue(true);
            const response = await request(app).delete('/api/customers/ALFKI').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(204);
            expect(CustomerService.deleteCustomer).toHaveBeenCalledWith('ALFKI');
        });

        it('debería devolver 404 si el cliente no existe', async () => {
            CustomerService.deleteCustomer.mockResolvedValue(false);
            const response = await request(app).delete('/api/customers/NOPE1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Cliente no encontrado' });
        });

        it('debería manejar errores en el servidor', async () => {
            CustomerService.deleteCustomer.mockRejectedValue(new Error('Database error'));
            const response = await request(app).delete('/api/customers/ALFKI').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });
});