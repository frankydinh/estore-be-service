# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@example.com.

**DO NOT** create a public issue.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

We aim to respond to security reports within 48 hours.

## Security Measures

This application implements:

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet.js for HTTP headers
- Input validation
- SQL injection prevention
- XSS protection

## Best Practices

1. Never commit secrets
2. Use environment variables
3. Keep dependencies updated
4. Enable 2FA for production
5. Use HTTPS in production
6. Regularly update secrets
