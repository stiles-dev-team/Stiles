-- Add missing columns to users table for password reset functionality
-- Run this script to update your existing users table

-- Add phone column
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email;

-- Add is_admin column
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0 AFTER is_active;

-- Add token column for authentication
ALTER TABLE users ADD COLUMN token VARCHAR(255) NULL AFTER is_admin;

-- Add reset_token column for password reset
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER token;

-- Add reset_token_expires_at column for token expiration
ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL AFTER reset_token;

-- Add index for reset_token for better performance
ALTER TABLE users ADD INDEX idx_reset_token (reset_token);

-- Add index for token for better performance
ALTER TABLE users ADD INDEX idx_token (token); 