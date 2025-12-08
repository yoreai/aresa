-- ARESA Studio - ClickHouse Test Data
-- This script creates sample tables optimized for analytics

-- Create database
CREATE DATABASE IF NOT EXISTS aresa_test;

-- ============================================
-- Analytics Tables (ClickHouse-optimized)
-- ============================================

-- Events table - typical analytics workload
CREATE TABLE aresa_test.events (
    event_id UUID DEFAULT generateUUIDv4(),
    event_type String,
    user_id UInt64,
    session_id String,
    page_url String,
    referrer String,
    device_type Enum8('desktop' = 1, 'mobile' = 2, 'tablet' = 3),
    browser String,
    country String,
    city String,
    event_properties String, -- JSON as string
    event_time DateTime DEFAULT now(),
    event_date Date DEFAULT today()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, user_id, event_time);

-- Page views table
CREATE TABLE aresa_test.page_views (
    view_id UUID DEFAULT generateUUIDv4(),
    user_id UInt64,
    session_id String,
    page_path String,
    page_title String,
    load_time_ms UInt32,
    time_on_page_seconds UInt32,
    scroll_depth_percent UInt8,
    is_bounce UInt8,
    view_time DateTime DEFAULT now(),
    view_date Date DEFAULT today()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(view_date)
ORDER BY (view_date, user_id, view_time);

-- User metrics - aggregated data
CREATE TABLE aresa_test.user_metrics (
    user_id UInt64,
    metric_date Date,
    total_sessions UInt32,
    total_page_views UInt32,
    total_events UInt32,
    avg_session_duration_seconds Float32,
    total_conversions UInt32,
    revenue Float64
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(metric_date)
ORDER BY (metric_date, user_id);

-- Sales data - for business analytics
CREATE TABLE aresa_test.sales (
    sale_id UInt64,
    product_id UInt32,
    product_name String,
    category String,
    quantity UInt32,
    unit_price Float64,
    total_amount Float64,
    discount_percent Float32,
    customer_id UInt64,
    sales_rep_id UInt32,
    region String,
    sale_time DateTime,
    sale_date Date
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(sale_date)
ORDER BY (sale_date, region, product_id);

-- Time series metrics
CREATE TABLE aresa_test.server_metrics (
    timestamp DateTime,
    host String,
    metric_name String,
    metric_value Float64,
    tags Array(String)
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (timestamp, host, metric_name);

-- ============================================
-- Views for analytics
-- ============================================

CREATE VIEW aresa_test.daily_events_summary AS
SELECT
    event_date,
    event_type,
    count() AS event_count,
    uniq(user_id) AS unique_users,
    uniq(session_id) AS unique_sessions
FROM aresa_test.events
GROUP BY event_date, event_type;

CREATE VIEW aresa_test.sales_by_region AS
SELECT
    sale_date,
    region,
    sum(total_amount) AS total_revenue,
    count() AS order_count,
    avg(total_amount) AS avg_order_value
FROM aresa_test.sales
GROUP BY sale_date, region;

-- ============================================
-- Insert Sample Data
-- ============================================

-- Insert events
INSERT INTO aresa_test.events (event_type, user_id, session_id, page_url, device_type, browser, country, city, event_time, event_date) VALUES
('page_view', 1001, 'sess-001', '/home', 'desktop', 'Chrome', 'USA', 'New York', '2024-01-15 10:00:00', '2024-01-15'),
('click', 1001, 'sess-001', '/products', 'desktop', 'Chrome', 'USA', 'New York', '2024-01-15 10:01:30', '2024-01-15'),
('page_view', 1002, 'sess-002', '/home', 'mobile', 'Safari', 'UK', 'London', '2024-01-15 10:05:00', '2024-01-15'),
('signup', 1002, 'sess-002', '/register', 'mobile', 'Safari', 'UK', 'London', '2024-01-15 10:10:00', '2024-01-15'),
('purchase', 1001, 'sess-001', '/checkout', 'desktop', 'Chrome', 'USA', 'New York', '2024-01-15 10:15:00', '2024-01-15'),
('page_view', 1003, 'sess-003', '/about', 'tablet', 'Firefox', 'Germany', 'Berlin', '2024-01-15 11:00:00', '2024-01-15'),
('page_view', 1004, 'sess-004', '/home', 'desktop', 'Edge', 'France', 'Paris', '2024-01-15 12:00:00', '2024-01-15'),
('click', 1004, 'sess-004', '/pricing', 'desktop', 'Edge', 'France', 'Paris', '2024-01-15 12:02:00', '2024-01-15'),
('page_view', 1005, 'sess-005', '/blog', 'mobile', 'Chrome', 'Japan', 'Tokyo', '2024-01-16 08:00:00', '2024-01-16'),
('purchase', 1003, 'sess-006', '/checkout', 'desktop', 'Firefox', 'Germany', 'Berlin', '2024-01-16 14:00:00', '2024-01-16');

-- Insert page views
INSERT INTO aresa_test.page_views (user_id, session_id, page_path, page_title, load_time_ms, time_on_page_seconds, scroll_depth_percent, is_bounce, view_time, view_date) VALUES
(1001, 'sess-001', '/', 'Home', 450, 30, 75, 0, '2024-01-15 10:00:00', '2024-01-15'),
(1001, 'sess-001', '/products', 'Products', 380, 120, 90, 0, '2024-01-15 10:01:00', '2024-01-15'),
(1002, 'sess-002', '/', 'Home', 520, 15, 40, 0, '2024-01-15 10:05:00', '2024-01-15'),
(1003, 'sess-003', '/about', 'About Us', 290, 45, 100, 1, '2024-01-15 11:00:00', '2024-01-15'),
(1004, 'sess-004', '/', 'Home', 410, 60, 80, 0, '2024-01-15 12:00:00', '2024-01-15'),
(1005, 'sess-005', '/blog', 'Blog', 350, 180, 95, 0, '2024-01-16 08:00:00', '2024-01-16');

-- Insert user metrics
INSERT INTO aresa_test.user_metrics (user_id, metric_date, total_sessions, total_page_views, total_events, avg_session_duration_seconds, total_conversions, revenue) VALUES
(1001, '2024-01-15', 3, 15, 25, 420.5, 2, 299.99),
(1002, '2024-01-15', 2, 8, 12, 180.0, 1, 0),
(1003, '2024-01-15', 1, 3, 5, 90.0, 0, 0),
(1004, '2024-01-15', 2, 10, 18, 300.0, 1, 149.99),
(1005, '2024-01-16', 1, 5, 8, 240.0, 0, 0),
(1001, '2024-01-16', 2, 12, 20, 380.0, 1, 199.99);

-- Insert sales
INSERT INTO aresa_test.sales (sale_id, product_id, product_name, category, quantity, unit_price, total_amount, discount_percent, customer_id, sales_rep_id, region, sale_time, sale_date) VALUES
(1, 101, 'Widget Pro', 'Hardware', 5, 49.99, 249.95, 0, 1001, 1, 'North America', '2024-01-15 10:30:00', '2024-01-15'),
(2, 102, 'Gadget Plus', 'Electronics', 2, 199.99, 399.98, 0, 1002, 2, 'Europe', '2024-01-15 11:00:00', '2024-01-15'),
(3, 103, 'Software License', 'Software', 10, 29.99, 299.90, 0, 1003, 1, 'Europe', '2024-01-15 14:00:00', '2024-01-15'),
(4, 101, 'Widget Pro', 'Hardware', 20, 49.99, 899.82, 10, 1004, 3, 'Asia Pacific', '2024-01-16 09:00:00', '2024-01-16'),
(5, 104, 'Premium Support', 'Services', 1, 999.99, 999.99, 0, 1001, 1, 'North America', '2024-01-16 15:00:00', '2024-01-16');

-- Insert server metrics
INSERT INTO aresa_test.server_metrics (timestamp, host, metric_name, metric_value, tags) VALUES
('2024-01-15 10:00:00', 'web-01', 'cpu_usage', 45.2, ['production', 'us-east']),
('2024-01-15 10:00:00', 'web-01', 'memory_usage', 62.8, ['production', 'us-east']),
('2024-01-15 10:00:00', 'web-02', 'cpu_usage', 38.5, ['production', 'us-west']),
('2024-01-15 10:01:00', 'web-01', 'cpu_usage', 48.1, ['production', 'us-east']),
('2024-01-15 10:01:00', 'db-01', 'cpu_usage', 72.3, ['production', 'us-east']),
('2024-01-15 10:01:00', 'db-01', 'disk_io', 1250.0, ['production', 'us-east']);

