-- Add some demo sales records
INSERT INTO public.sales_records (product_id, customer_id, quantity_sold, unit_price, total_value, sale_date) VALUES
-- Sales with existing products and customers
((SELECT id FROM products WHERE name = 'Laptop Pro' LIMIT 1), (SELECT id FROM customers WHERE name = 'John Doe' LIMIT 1), 2, 1299.99, 2599.98, '2025-01-15 10:30:00+00:00'),
((SELECT id FROM products WHERE name = 'Wireless Mouse' LIMIT 1), (SELECT id FROM customers WHERE name = 'Jane Smith' LIMIT 1), 5, 29.99, 149.95, '2025-01-18 14:20:00+00:00'),
((SELECT id FROM products WHERE name = 'USB-C Cable' LIMIT 1), (SELECT id FROM customers WHERE name = 'Bob Johnson' LIMIT 1), 10, 12.99, 129.90, '2025-01-20 09:15:00+00:00'),
((SELECT id FROM products WHERE name = 'Monitor 24"' LIMIT 1), (SELECT id FROM customers WHERE name = 'John Doe' LIMIT 1), 1, 199.99, 199.99, '2025-01-22 16:45:00+00:00'),
((SELECT id FROM products WHERE name = 'Keyboard Mechanical' LIMIT 1), NULL, 3, 89.99, 269.97, '2025-01-25 11:30:00+00:00');

-- Add some demo deliveries for the sales records
INSERT INTO public.deliveries (sales_record_id, delivery_address, delivery_status, tracking_number) VALUES
((SELECT id FROM sales_records WHERE total_value = 2599.98 LIMIT 1), '123 Main St, City, State, 12345', 'delivered', 'TRK001234567'),
((SELECT id FROM sales_records WHERE total_value = 149.95 LIMIT 1), '456 Oak Ave, City, State, 67890', 'in_transit', 'TRK002345678'),
((SELECT id FROM sales_records WHERE total_value = 129.90 LIMIT 1), '789 Pine Rd, City, State, 54321', 'pending', NULL),
((SELECT id FROM sales_records WHERE total_value = 199.99 LIMIT 1), '123 Main St, City, State, 12345', 'pending', NULL),
((SELECT id FROM sales_records WHERE total_value = 269.97 LIMIT 1), '321 Elm St, City, State, 98765', 'delivered', 'TRK003456789');