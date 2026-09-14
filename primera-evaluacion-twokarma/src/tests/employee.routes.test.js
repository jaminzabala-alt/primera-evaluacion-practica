const request = require('supertest');
const EmployeeService = require('../services/employee.service');
const EmployeeDTO = require('../dto/employee.dto');

jest.mock('../config/db');
jest.mock('../services/employee.service');
jest.mock('../dto/employee.dto');
jest.mock('../middlewares/auth.middleware', () => (req, res, next) => next()); // simula usuario autenticado

const app = require('../server'); // Asegúrate de que server.js exporte la app

describe('Employee Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/employees', () => {
        it('debería listar todos los empleados con DTO aplicado', async () => {
            const mockEmployees = [
                { employee_id: 1, first_name: 'Nancy', last_name: 'Davolio' },
                { employee_id: 2, first_name: 'Andrew', last_name: 'Fuller' },
            ];
            const mockEmployeeDTOs = [
                { id: 1, fullName: 'Nancy Davolio' },
                { id: 2, fullName: 'Andrew Fuller' },
            ];
            EmployeeService.getAllEmployees.mockResolvedValue(mockEmployees);
            EmployeeDTO.mockImplementation((employee) => employee);

            const response = await request(app).get('/api/employees').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(EmployeeService.getAllEmployees).toHaveBeenCalled();
            expect(response.body).toEqual(mockEmployeeDTOs);
        });

        it('debería manejar errores en el servidor', async () => {
            EmployeeService.getAllEmployees.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/employees').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /api/employees/:id', () => {
        it('debería devolver un empleado específico con DTO aplicado', async () => {
            const mockEmployee = { employee_id: 1, first_name: 'Nancy', last_name: 'Davolio' };
            const mockEmployeeDTO = { id: 1, fullName: 'Nancy Davolio' };
            EmployeeService.getEmployeeById.mockResolvedValue(mockEmployee);
            EmployeeDTO.mockImplementation((employee) => employee);

            const response = await request(app).get('/api/employees/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(200);
            expect(EmployeeService.getEmployeeById).toHaveBeenCalledWith('1');
            expect(response.body).toEqual(mockEmployeeDTO);
        });

        it('debería devolver 404 si el empleado no se encuentra', async () => {
            EmployeeService.getEmployeeById.mockResolvedValue(null);
            const response = await request(app).get('/api/employees/999').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Empleado no encontrado' });
        });

        it('debería manejar errores en el servidor', async () => {
            EmployeeService.getEmployeeById.mockRejectedValue(new Error('Database error'));
            const response = await request(app).get('/api/employees/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('POST /api/employees', () => {
        const validEmployee = { first_name: 'Steven', last_name: 'Buchanan', title: 'Sales Manager' };

        it('debería crear un empleado con DTO aplicado', async () => {
            const mockEmployee = { employee_id: 10, first_name: 'Steven', last_name: 'Buchanan' };
            EmployeeService.createEmployee.mockResolvedValue(mockEmployee);
            EmployeeDTO.mockImplementation((employee) => employee);

            const response = await request(app)
                .post('/api/employees')
                .set('Authorization', 'Bearer mockToken')
                .send(validEmployee);

            expect(response.status).toBe(201);
            expect(EmployeeService.createEmployee).toHaveBeenCalledWith(validEmployee);
            expect(response.body).toEqual(mockEmployee);
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/api/employees')
                .set('Authorization', 'Bearer mockToken')
                .send({ title: 'Sin nombre' });

            expect(response.status).toBe(400);
            expect(EmployeeService.createEmployee).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            EmployeeService.createEmployee.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .post('/api/employees')
                .set('Authorization', 'Bearer mockToken')
                .send(validEmployee);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('PUT /api/employees/:id', () => {
        const validEmployee = { title: 'Sales Manager Actualizado' };

        it('debería actualizar un empleado con DTO aplicado', async () => {
            const mockEmployee = { employee_id: 1, title: 'Sales Manager Actualizado' };
            EmployeeService.updateEmployee.mockResolvedValue(mockEmployee);
            EmployeeDTO.mockImplementation((employee) => employee);

            const response = await request(app)
                .put('/api/employees/1')
                .set('Authorization', 'Bearer mockToken')
                .send(validEmployee);

            expect(response.status).toBe(200);
            expect(EmployeeService.updateEmployee).toHaveBeenCalledWith('1', validEmployee);
            expect(response.body).toEqual(mockEmployee);
        });

        it('debería devolver 404 si el empleado no existe', async () => {
            EmployeeService.updateEmployee.mockResolvedValue(null);
            const response = await request(app)
                .put('/api/employees/999')
                .set('Authorization', 'Bearer mockToken')
                .send(validEmployee);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Empleado no encontrado' });
        });

        it('debería devolver 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .put('/api/employees/1')
                .set('Authorization', 'Bearer mockToken')
                .send({});

            expect(response.status).toBe(400);
            expect(EmployeeService.updateEmployee).not.toHaveBeenCalled();
        });

        it('debería manejar errores en el servidor', async () => {
            EmployeeService.updateEmployee.mockRejectedValue(new Error('Database error'));
            const response = await request(app)
                .put('/api/employees/1')
                .set('Authorization', 'Bearer mockToken')
                .send(validEmployee);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('DELETE /api/employees/:id', () => {
        it('debería eliminar un empleado', async () => {
            EmployeeService.deleteEmployee.mockResolvedValue(true);
            const response = await request(app).delete('/api/employees/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(204);
            expect(EmployeeService.deleteEmployee).toHaveBeenCalledWith('1');
        });

        it('debería devolver 404 si el empleado no existe', async () => {
            EmployeeService.deleteEmployee.mockResolvedValue(false);
            const response = await request(app).delete('/api/employees/999').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Empleado no encontrado' });
        });

        it('debería manejar errores en el servidor', async () => {
            EmployeeService.deleteEmployee.mockRejectedValue(new Error('Database error'));
            const response = await request(app).delete('/api/employees/1').set('Authorization', 'Bearer mockToken');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });
});