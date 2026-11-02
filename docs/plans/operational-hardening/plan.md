# Operational Hardening Plan & Architecture

## Overview
Hardening the Tandem web application with:
1. Security headers via `helmet` and Content Security Policy (CSP).
2. Response payload compression via `compression`.
3. Validation of `DATABASE_URL` format on server startup in `db.js`.
4. Standardized `npm test` script pipelines across root, server, and client workspaces.
5. GitHub Actions Continuous Integration (CI) in `.github/workflows/ci.yml`.

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Backend Application (tandem/server)
    ├── [Configuration/Env] PORT=3001, NODE_ENV=production, DATABASE_URL=postgresql://user:pass@host:5432/tandem
    └── [Folder] tandem/server/src
        ├── [File] src/index.js
        │   └── [Class] ServerBootstrapModule
        │       ├── [Method] validateDatabaseUrl(databaseUrl: string)
        │       │   ├── [Folder] tandem/server/src
        │       │   └── [File] src/db.js
        │       │       └── [Class] DatabaseConfigValidator
        │       │           └── [Method] validateDatabaseUrl(databaseUrl = process.env.DATABASE_URL)
        │       │               ├── [Variable State Shift] Inbound Param: databaseUrl = "postgresql://user:pass@host:5432/tandem"
        │       │               ├── [Variable State Shift] Check Regex/Prefix: startsWith('postgres://') || startsWith('postgresql://') => true
        │       │               └── [Variable State Shift] Mutated Result: valid = true (no warning logged)
        │       └── [Method] app.listen(port, '0.0.0.0')
        │           ├── [Folder] tandem/server/src
        │           └── [File] src/app.js
        │               └── [Class] ExpressAppInstance
        │                   ├── [Method] app.use(helmet())
        │                   │   ├── [Folder] node_modules/helmet
        │                   │   └── [File] index.js
        │                   │       └── [Method] helmetMiddleware(req, res, next)
        │                   │           ├── [Variable State Shift] Inbound HTTP Request: Headers = {}
        │                   │           └── [Variable State Shift] Outbound Headers: Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options set
        │                   ├── [Method] app.use(helmet.contentSecurityPolicy({ directives }))
        │                   │   └── [Method] cspMiddleware(req, res, next)
        │                   │       └── [Variable State Shift] Outbound Header: Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
        │                   ├── [Method] app.use(compression())
        │                   │   ├── [Folder] node_modules/compression
        │                   │   └── [File] index.js
        │                   │       └── [Method] compressionMiddleware(req, res, next)
        │                   │           ├── [Variable State Shift] Inbound Header: Accept-Encoding = "gzip, deflate, br"
        │                   │           └── [Variable State Shift] Response Transformer: res.write / res.end hooked with zlib Gzip stream
        │                   └── [Method] Express Route Matching & Handlers (/api/..., static client files)
        │                       └── [Variable State Shift] Output: Secure, compressed HTTP response payload delivered to caller
```
