-- Fix user passwords with correct BCrypt hashes
-- Password: password123
-- Note: These are pre-generated BCrypt hashes from Spring Security's BCryptPasswordEncoder

-- Update admin user password
UPDATE users SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpW6dBO3G' WHERE username = 'admin';

-- Update staff user password  
UPDATE users SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpW6dBO3G' WHERE username = 'staff';
