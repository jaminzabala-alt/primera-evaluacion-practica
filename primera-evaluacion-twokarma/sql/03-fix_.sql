-- 03-fix.sql
-- La tabla employees tiene una auto-referencia (reports_to -> employee_id).
-- Al insertar los datos en orden, la fila del empleado 1 (reports_to = 2)
-- llega antes que el empleado 2 exista todavía, violando la FK.
--
-- Solución: quitar la restricción antes de cargar los datos y
-- volverla a crear (validando) al final.

-- PASO 1: ejecutar esto ANTES de correr 02-data.sql
ALTER TABLE employees DROP CONSTRAINT IF EXISTS fk_employees_employees;

-- (ahora corre 02-data.sql)

-- PASO 2: ejecutar esto DESPUÉS de correr 02-data.sql, para restaurar
-- la integridad referencial una vez que todas las filas ya existen
ALTER TABLE employees
    ADD CONSTRAINT fk_employees_employees
    FOREIGN KEY (reports_to) REFERENCES employees (employee_id);


ALTER TABLE orders ADD CONSTRAINT fk_orders_customers FOREIGN KEY (customer_id) REFERENCES customers;

 ALTER TABLE orders ADD CONSTRAINT fk_orders_employees FOREIGN KEY (employee_id) REFERENCES employees; 
 ALTER TABLE orders ADD CONSTRAINT fk_orders_shippers FOREIGN KEY (ship_via) REFERENCES shippers;
  ALTER TABLE order_details ADD CONSTRAINT fk_order_details_products FOREIGN KEY (product_id) REFERENCES products;
   ALTER TABLE order_details ADD CONSTRAINT fk_order_details_orders FOREIGN KEY (order_id) REFERENCES orders; 
   ALTER TABLE products ADD CONSTRAINT fk_products_categories FOREIGN KEY (category_id) REFERENCES categories;
    ALTER TABLE products ADD CONSTRAINT fk_products_suppliers FOREIGN KEY (supplier_id) REFERENCES suppliers;
     ALTER TABLE territories ADD CONSTRAINT fk_territories_region FOREIGN KEY (region_id) REFERENCES region; 
     ALTER TABLE employee_territories ADD CONSTRAINT fk_employee_territories_territories FOREIGN KEY (territory_id) REFERENCES territories; 
     ALTER TABLE employee_territories ADD CONSTRAINT fk_employee_territories_employees FOREIGN KEY (employee_id) REFERENCES employees; 
     ALTER TABLE customer_customer_demo ADD CONSTRAINT fk_customer_customer_demo_customer_demographics FOREIGN KEY (customer_type_id) REFERENCES customer_demographics; 
     ALTER TABLE customer_customer_demo ADD CONSTRAINT fk_customer_customer_demo_customers FOREIGN KEY (customer_id) REFERENCES customers; 
     ALTER TABLE employees ADD CONSTRAINT fk_employees_employees FOREIGN KEY (reports_to) REFERENCES employees;



