-- Insert demo users (password: password123 - BCrypt hashed)
INSERT INTO users (username, password, full_name, role, active) VALUES
('admin', '$2a$10$8K1p/H0MIwaYTy5xnF5EveDNvQPdDlFcPJQnWpI7lYH9TJfLJLg7u', 'Administrator', 'ADMIN', TRUE),
('staff', '$2a$10$8K1p/H0MIwaYTy5xnF5EveDNvQPdDlFcPJQnWpI7lYH9TJfLJLg7u', 'Staff User', 'STAFF', TRUE);

-- Insert demo categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Stationery', 'Office and school supplies'),
('Beverages', 'Drinks and beverages'),
('Snacks', 'Snacks and confectionery'),
('Household', 'Household items and supplies');

-- Insert demo products
INSERT INTO products (sku, name, description, unit, cost_price, selling_price, minimum_stock, category_id) VALUES
('ELEC-001', 'USB Cable Type-C', 'High quality Type-C USB cable 1m', 'piece', 50.00, 99.00, 10, 1),
('ELEC-002', 'Wireless Mouse', 'Ergonomic wireless mouse', 'piece', 150.00, 299.00, 5, 1),
('STAT-001', 'A4 Paper', 'White A4 copy paper 500 sheets', 'ream', 80.00, 120.00, 20, 2),
('STAT-002', 'Blue Pen', 'Ballpoint pen blue ink', 'piece', 5.00, 15.00, 50, 2),
('BEV-001', 'Mineral Water 500ml', 'Pure mineral water', 'bottle', 5.00, 10.00, 100, 3),
('BEV-002', 'Green Tea', 'Japanese green tea 350ml', 'bottle', 10.00, 25.00, 50, 3),
('SNACK-001', 'Potato Chips', 'Crispy potato chips 100g', 'pack', 15.00, 35.00, 30, 4),
('SNACK-002', 'Chocolate Bar', 'Milk chocolate bar 50g', 'piece', 10.00, 25.00, 40, 4),
('HOUSE-001', 'Dish Soap', 'Liquid dish washing soap 500ml', 'bottle', 20.00, 45.00, 15, 5),
('HOUSE-002', 'Trash Bags', 'Large trash bags 10 pieces', 'pack', 25.00, 55.00, 20, 5);

-- Insert demo stock transactions (initial stock)
INSERT INTO stock_transactions (product_id, type, quantity, balance_after, reason, user_id) VALUES
(1, 'IN', 50, 50, 'Initial stock', 1),
(2, 'IN', 30, 30, 'Initial stock', 1),
(3, 'IN', 100, 100, 'Initial stock', 1),
(4, 'IN', 200, 200, 'Initial stock', 1),
(5, 'IN', 500, 500, 'Initial stock', 1),
(6, 'IN', 200, 200, 'Initial stock', 1),
(7, 'IN', 150, 150, 'Initial stock', 1),
(8, 'IN', 180, 180, 'Initial stock', 1),
(9, 'IN', 80, 80, 'Initial stock', 1),
(10, 'IN', 100, 100, 'Initial stock', 1);
