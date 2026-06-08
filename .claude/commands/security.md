Run a security scan of the codebase.

## Instructions

1. Activate skills: `security-audit`, `vulnerability-scan`, `secrets-management`, `dependency-check`
2. Scan the codebase for the following categories:

### Hardcoded Secrets
- Search for API keys, tokens, passwords, and credentials in source files
- Check common patterns: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`

### OWASP Top 10 Vulnerabilities
- Injection flaws (SQL, command, etc.)
- Broken authentication patterns
- Sensitive data exposure
- XML external entities (XXE)
- Broken access control
- Security misconfiguration
- Cross-site scripting (XSS)
- Insecure deserialization
- Using components with known vulnerabilities
- Insufficient logging and monitoring

### Dependency Audit
- Run the appropriate audit tool for the project type:
  - Node.js: `npm audit` or `yarn audit`
  - Python: `pip-audit` or `safety check`
  - Go: `govulncheck`
  - Rust: `cargo audit`
- Flag outdated dependencies with known CVEs

### Git History Secrets
- Run `git log -p --all -S 'API_KEY'`, `git log -p --all -S 'SECRET'`, etc. for common secret patterns
- Report any leaked secrets found in history

### Missing .gitignore Entries
- Check for files that should be ignored: `.env`, credentials, private keys, build artifacts

3. Output a security report with severity levels:

```
## Security Report

### Critical
- [category] Description and location

### High
- [category] Description and location

### Medium
- [category] Description and location

### Low
- [category] Description and location
```

4. If $ARGUMENTS contains a path, scope the scan to that path only
