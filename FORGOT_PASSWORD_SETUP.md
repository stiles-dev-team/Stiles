# Forgot Password Setup Guide

This guide explains how to set up the forgot password functionality for the Stiles application.

## Database Setup

### 1. Update Users Table

If you have an existing users table, run the following SQL commands to add the required columns:

```sql
-- Add missing columns to users table for password reset functionality

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
```

### 2. Complete Table Structure

The users table should have the following structure:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin TINYINT(1) DEFAULT 0,
    token VARCHAR(255) NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires_at DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token),
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Files Created/Modified

### React Components
- `src/pages/ForgotPassword.jsx` - Forgot password form page
- `src/pages/ResetPassword.jsx` - Password reset form page
- `src/pages/Login.jsx` - Updated to link to forgot password page
- `src/App.jsx` - Added routes for forgot password pages

### PHP Endpoints
- `public/api/forgot-password.php` - Handles forgot password requests
- `public/api/validate-reset-token.php` - Validates reset tokens
- `public/api/reset-password.php` - Handles password reset

## Features

### Security Features
1. **Token Expiration**: Reset tokens expire after 1 hour
2. **Secure Token Generation**: Uses `bin2hex(random_bytes(32))` for secure tokens
3. **Email Privacy**: Doesn't reveal if an email exists in the system
4. **Password Validation**: Enforces strong password requirements
5. **Token Cleanup**: Tokens are cleared after use

### User Experience
1. **Email Templates**: Professional HTML email templates
2. **Loading States**: Proper loading indicators during requests
3. **Error Handling**: Clear error messages for users
4. **Success Feedback**: Confirmation messages for successful actions
5. **Automatic Redirect**: Redirects to login after successful password reset

## Email Configuration

The system uses PHP's `mail()` function. Ensure your server is configured to send emails. You may need to:

1. Configure SMTP settings in your PHP configuration
2. Set up proper email headers and authentication
3. Test email delivery to ensure reset emails are received

## Usage Flow

1. User clicks "Forgot your password?" on login page
2. User enters email address on forgot password page
3. System generates reset token and sends email
4. User clicks link in email to go to reset password page
5. User enters new password and confirms
6. System validates token and updates password
7. User is redirected to login page

## Testing

To test the functionality:

1. Create a test user account
2. Navigate to `/forgot-password`
3. Enter the test email address
4. Check email for reset link
5. Click the link and reset the password
6. Verify you can login with the new password

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check server mail configuration
2. **Tokens not working**: Verify database columns are added correctly
3. **Reset link not working**: Check the domain in the reset link URL
4. **Database errors**: Ensure all required columns exist in the users table

### Debugging

Check the PHP error logs for any issues with the endpoints. The endpoints include error logging for debugging purposes. 