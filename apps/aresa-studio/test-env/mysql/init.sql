-- ARESA Studio - MySQL Test Data
-- This script creates sample tables with various data types

-- ============================================
-- Tables
-- ============================================

-- Customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(10) UNIQUE NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    country VARCHAR(50),
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('Electronics', 'Clothing', 'Food', 'Software', 'Services') NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    units_in_stock INT DEFAULT 0,
    units_on_order INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    discontinued BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    required_date DATE,
    shipped_date DATE,
    ship_via VARCHAR(50),
    freight DECIMAL(10, 2) DEFAULT 0,
    ship_address TEXT,
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order details table
CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    discount DECIMAL(4, 2) DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Inventory log table - for testing different date/time types
CREATE TABLE inventory_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    action ENUM('IN', 'OUT', 'ADJUST') NOT NULL,
    quantity INT NOT NULL,
    notes VARCHAR(255),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logged_date DATE,
    logged_time TIME,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create views
CREATE VIEW customer_orders_summary AS
SELECT
    c.company_name,
    c.country,
    COUNT(o.id) AS total_orders,
    SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN order_details od ON o.id = od.order_id
GROUP BY c.id, c.company_name, c.country;

CREATE VIEW product_sales AS
SELECT
    p.name AS product_name,
    p.category,
    SUM(od.quantity) AS total_sold,
    SUM(od.unit_price * od.quantity) AS total_revenue
FROM products p
LEFT JOIN order_details od ON p.id = od.product_id
GROUP BY p.id, p.name, p.category;

-- ============================================
-- Insert Sample Data
-- ============================================

-- Insert customers
INSERT INTO customers (customer_id, company_name, contact_name, email, phone, city, country, credit_limit) VALUES
('CUST001', 'TechStart Inc', 'John Doe', 'john@techstart.com', '+1-555-0101', 'San Francisco', 'USA', 50000.00),
('CUST002', 'Global Solutions', 'Jane Smith', 'jane@globalsol.com', '+1-555-0102', 'New York', 'USA', 75000.00),
('CUST003', 'EuroTech GmbH', 'Hans Mueller', 'hans@eurotech.de', '+49-555-0103', 'Berlin', 'Germany', 60000.00),
('CUST004', 'Asia Pacific Ltd', 'Wei Chen', 'wei@asiapac.com', '+86-555-0104', 'Shanghai', 'China', 100000.00),
('CUST005', 'Nordic Systems', 'Erik Larsson', 'erik@nordic.se', '+46-555-0105', 'Stockholm', 'Sweden', 45000.00),
('CUST006', 'LatAm Ventures', 'Maria Garcia', 'maria@latamv.mx', '+52-555-0106', 'Mexico City', 'Mexico', 35000.00),
('CUST007', 'UK Digital', 'James Wilson', 'james@ukdigital.co.uk', '+44-555-0107', 'London', 'UK', 80000.00),
('CUST008', 'Aussie Tech', 'Sarah Brown', 'sarah@aussietech.au', '+61-555-0108', 'Sydney', 'Australia', 55000.00);

-- Insert products
INSERT INTO products (product_code, name, description, category, unit_price, units_in_stock, units_on_order) VALUES
('ELEC-001', 'Smartphone Pro', 'Latest flagship smartphone', 'Electronics', 999.99, 100, 50),
('ELEC-002', 'Tablet Ultra', '12-inch tablet with stylus', 'Electronics', 799.99, 75, 25),
('ELEC-003', 'Wireless Earbuds', 'Noise-canceling earbuds', 'Electronics', 199.99, 200, 100),
('SOFT-001', 'Office Suite Pro', 'Complete office software', 'Software', 299.99, 999, 0),
('SOFT-002', 'Antivirus Premium', 'Advanced security software', 'Software', 79.99, 999, 0),
('SERV-001', 'Cloud Hosting Basic', 'Basic cloud hosting plan', 'Services', 49.99, 999, 0),
('SERV-002', 'Cloud Hosting Pro', 'Professional cloud hosting', 'Services', 149.99, 999, 0),
('CLOTH-001', 'Tech T-Shirt', 'Comfortable tech-themed shirt', 'Clothing', 29.99, 500, 200);

-- Insert orders
INSERT INTO orders (order_id, customer_id, order_date, required_date, shipped_date, ship_via, freight, status) VALUES
('ORD-M-001', 1, '2024-01-15 10:30:00', '2024-01-22', '2024-01-18', 'FedEx', 25.00, 'Delivered'),
('ORD-M-002', 2, '2024-01-16 14:45:00', '2024-01-23', '2024-01-19', 'UPS', 35.00, 'Delivered'),
('ORD-M-003', 3, '2024-01-17 09:15:00', '2024-01-24', NULL, 'DHL', 45.00, 'Processing'),
('ORD-M-004', 4, '2024-01-18 16:20:00', '2024-01-25', NULL, 'FedEx', 55.00, 'Pending'),
('ORD-M-005', 1, '2024-01-19 11:00:00', '2024-01-26', '2024-01-21', 'UPS', 30.00, 'Shipped');

-- Insert order details
INSERT INTO order_details (order_id, product_id, unit_price, quantity, discount) VALUES
(1, 1, 999.99, 2, 0.05),
(1, 3, 199.99, 3, 0.00),
(2, 2, 799.99, 1, 0.10),
(2, 4, 299.99, 5, 0.15),
(3, 1, 999.99, 10, 0.20),
(3, 5, 79.99, 10, 0.00),
(4, 6, 49.99, 12, 0.00),
(4, 7, 149.99, 6, 0.10),
(5, 3, 199.99, 5, 0.05);

-- Insert inventory log
INSERT INTO inventory_log (product_id, action, quantity, notes, logged_date, logged_time) VALUES
(1, 'IN', 50, 'New shipment received', '2024-01-10', '09:00:00'),
(1, 'OUT', 2, 'Order ORD-M-001', '2024-01-15', '10:35:00'),
(2, 'IN', 30, 'Restocking', '2024-01-12', '14:00:00'),
(3, 'OUT', 8, 'Multiple orders', '2024-01-15', '16:00:00'),
(1, 'ADJUST', -5, 'Inventory correction', '2024-01-16', '11:30:00');

-- Create indexes
CREATE INDEX idx_customers_country ON customers(country);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category);

-- Grant permissions
GRANT ALL PRIVILEGES ON aresa_test.* TO 'aresa'@'%';
FLUSH PRIVILEGES;

