-- ARESA Studio - PostgreSQL Test Data
-- This script creates sample tables with various data types

-- ============================================
-- Schema: public (default)
-- ============================================

-- Employees table - tests various column types
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    budget DECIMAL(15, 2),
    manager_id INTEGER REFERENCES employees(id),
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table - tests relationships and more types
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    employee_id INTEGER REFERENCES employees(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    items JSONB,
    notes TEXT,
    tags VARCHAR(50)[]
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity_in_stock INTEGER DEFAULT 0,
    category VARCHAR(50),
    is_available BOOLEAN DEFAULT true,
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics view - tests view listing
CREATE VIEW employee_summary AS
SELECT
    d.name AS department,
    COUNT(e.id) AS employee_count,
    AVG(e.salary) AS avg_salary,
    MIN(e.hire_date) AS earliest_hire,
    MAX(e.hire_date) AS latest_hire
FROM employees e
LEFT JOIN departments d ON e.department = d.name
GROUP BY d.name;

CREATE VIEW order_stats AS
SELECT
    DATE_TRUNC('month', order_date) AS month,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value
FROM orders
GROUP BY DATE_TRUNC('month', order_date);

-- ============================================
-- Insert Sample Data
-- ============================================

-- Insert employees
INSERT INTO employees (employee_id, first_name, last_name, email, department, salary, hire_date, metadata) VALUES
('EMP001', 'Alice', 'Johnson', 'alice.johnson@example.com', 'Engineering', 95000.00, '2020-03-15', '{"skills": ["Python", "SQL", "React"], "level": "Senior"}'),
('EMP002', 'Bob', 'Smith', 'bob.smith@example.com', 'Engineering', 85000.00, '2021-06-01', '{"skills": ["Java", "Kubernetes"], "level": "Mid"}'),
('EMP003', 'Carol', 'Williams', 'carol.williams@example.com', 'Marketing', 75000.00, '2019-11-20', '{"skills": ["SEO", "Content"], "level": "Senior"}'),
('EMP004', 'David', 'Brown', 'david.brown@example.com', 'Sales', 70000.00, '2022-01-10', '{"skills": ["Negotiation", "CRM"], "level": "Junior"}'),
('EMP005', 'Eve', 'Davis', 'eve.davis@example.com', 'Engineering', 110000.00, '2018-08-05', '{"skills": ["Rust", "Go", "Architecture"], "level": "Staff"}'),
('EMP006', 'Frank', 'Miller', 'frank.miller@example.com', 'HR', 65000.00, '2021-09-15', '{"skills": ["Recruiting", "Benefits"], "level": "Mid"}'),
('EMP007', 'Grace', 'Wilson', 'grace.wilson@example.com', 'Finance', 90000.00, '2020-02-28', '{"skills": ["Accounting", "Excel"], "level": "Senior"}'),
('EMP008', 'Henry', 'Moore', 'henry.moore@example.com', 'Engineering', 78000.00, '2023-03-01', '{"skills": ["TypeScript", "Node.js"], "level": "Junior"}'),
('EMP009', 'Ivy', 'Taylor', 'ivy.taylor@example.com', 'Marketing', 82000.00, '2020-07-12', '{"skills": ["Analytics", "Campaigns"], "level": "Mid"}'),
('EMP010', 'Jack', 'Anderson', 'jack.anderson@example.com', 'Sales', 95000.00, '2019-04-22', '{"skills": ["Enterprise Sales", "Partnerships"], "level": "Senior"}');

-- Insert departments
INSERT INTO departments (name, budget, manager_id, location) VALUES
('Engineering', 2000000.00, 5, 'San Francisco'),
('Marketing', 500000.00, 3, 'New York'),
('Sales', 750000.00, 10, 'Chicago'),
('HR', 300000.00, 6, 'San Francisco'),
('Finance', 400000.00, 7, 'New York');

-- Insert products
INSERT INTO products (sku, name, description, price, quantity_in_stock, category, attributes) VALUES
('PROD-001', 'Laptop Pro 15', 'High-performance laptop for professionals', 1299.99, 50, 'Electronics', '{"brand": "TechCorp", "specs": {"ram": "16GB", "storage": "512GB SSD"}}'),
('PROD-002', 'Wireless Mouse', 'Ergonomic wireless mouse', 49.99, 200, 'Accessories', '{"brand": "PeripheralCo", "color": "black"}'),
('PROD-003', 'Standing Desk', 'Adjustable height standing desk', 599.99, 30, 'Furniture', '{"brand": "OfficePro", "dimensions": "60x30 inches"}'),
('PROD-004', 'Monitor 27"', '4K Ultra HD monitor', 449.99, 75, 'Electronics', '{"brand": "DisplayTech", "resolution": "3840x2160"}'),
('PROD-005', 'Keyboard Mechanical', 'RGB mechanical keyboard', 129.99, 150, 'Accessories', '{"brand": "KeyMaster", "switches": "Cherry MX Blue"}');

-- Insert orders
INSERT INTO orders (order_number, customer_name, employee_id, total_amount, status, items, tags) VALUES
('ORD-2024-001', 'Acme Corp', 4, 2599.98, 'completed', '[{"sku": "PROD-001", "qty": 2}]', ARRAY['enterprise', 'priority']),
('ORD-2024-002', 'StartupXYZ', 10, 749.97, 'shipped', '[{"sku": "PROD-002", "qty": 3}, {"sku": "PROD-003", "qty": 1}]', ARRAY['startup']),
('ORD-2024-003', 'BigTech Inc', 4, 4499.95, 'processing', '[{"sku": "PROD-004", "qty": 5}, {"sku": "PROD-005", "qty": 5}]', ARRAY['enterprise', 'bulk']),
('ORD-2024-004', 'SmallBiz LLC', 10, 1299.99, 'pending', '[{"sku": "PROD-001", "qty": 1}]', ARRAY['smb']),
('ORD-2024-005', 'MegaCorp', 4, 8999.91, 'completed', '[{"sku": "PROD-001", "qty": 5}, {"sku": "PROD-004", "qty": 3}]', ARRAY['enterprise', 'recurring']);

-- Create an index for testing
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_orders_status ON orders(status);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aresa;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aresa;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL test database initialized successfully!';
    RAISE NOTICE 'Tables: employees, departments, orders, products';
    RAISE NOTICE 'Views: employee_summary, order_stats';
END $$;

