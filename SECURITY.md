# 🔒 Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of our package seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [security@harishkhojare.com](mailto:security@harishkhojare.com).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

- Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Policy

We take security seriously and will make every effort to promptly address any issues that are reported to us. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release a new version with the fix
5. Publicly announce the vulnerability and the fix

## Security Best Practices

When using this package in production:

1. **Keep dependencies updated**: Regularly update to the latest versions
2. **Validate inputs**: Always validate file types and sizes on the server side
3. **Use HTTPS**: Ensure all uploads happen over secure connections
4. **Implement rate limiting**: Prevent abuse of your upload endpoints
5. **Monitor uploads**: Log and monitor file uploads for suspicious activity
6. **Scan files**: Consider implementing virus scanning for uploaded files
7. **Backup strategy**: Have a backup strategy for uploaded files

## Security Features

This package includes several security features:

- **File type validation**: Built-in validation of file types and extensions
- **Size limits**: Configurable file size limits to prevent abuse
- **Input sanitization**: Automatic sanitization of file names and metadata
- **Secure defaults**: Security-focused default configurations
- **Error handling**: Secure error messages that don't leak sensitive information

## Reporting Security Issues in Dependencies

If you find a security vulnerability in one of our dependencies, please report it to the maintainers of that package first. If the vulnerability affects our package directly, please report it to us as described above.

## Credits

We would like to thank all security researchers who responsibly disclose vulnerabilities to us. Your contributions help make our package more secure for everyone.
