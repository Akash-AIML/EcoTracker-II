# Security Policy — EcoGuide AI

## Supported Versions

Only the current version of EcoGuide AI is actively supported with security updates.

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

We take the security of EcoGuide AI seriously. If you find any security vulnerabilities, please do **not** report them via public GitHub issues. Instead, report them privately by emailing:

**[security@ecoguide.ai](mailto:security@ecoguide.ai)**

We will acknowledge receipt of your report within 48 hours and provide a timeline for mitigation.

---

## Threat Model & Security Architecture

EcoGuide AI has been designed from the ground up with defensive security best practices to protect user data and maintain service availability.

### 1. Data Minimization & Privacy

- **Anonymous Sessions**: EcoGuide AI does **not** collect, process, or store any Personally Identifiable Information (PII) such as names, passwords, or emails.
- **UUID-Only Identifiers**: Users are identified solely by randomly generated client-side UUIDs (`crypto.randomUUID()`) saved in the browser's local storage.
- **Synthetic Email Generation**: The backend generates dummy emails (`${uuid}@ecoguide.ai`) purely to satisfy database unique constraints for relational user models. These are never used for communications or authentication.

### 2. SQL Injection Prevention

- **Prisma ORM Parameterization**: All database interactions use Prisma Client. Prisma parameterized query builders ensure input values are never interpolated directly into SQL queries, neutralizing SQL injection vectors by design.

### 3. API Security & Over-Posting Protections

- **Input Validation (Zod)**: All endpoints validate incoming request payloads against strict Zod schemas.
- **Unknown-Key Guard**: The assessment creation route rejects any request containing extra, undeclared JSON body keys. This prevents over-posting attacks where malicious users try to inject variables like roles or metadata.
- **Strict Size Limits**: Express request body parser sizes are limited to `100kb` to prevent memory exhaustion and Denial of Service (DoS) attacks via oversized payloads.

### 4. Client-Side Security (XSS / CSRF)

- **Input Sanitization**: Client-side inputs are programmatically sanitized and validated prior to transmission, stripping HTML elements and script tags.
- **DOM Injection Avoidance**: The frontend codebase avoids the use of `dangerouslySetInnerHTML`. Text content is rendered using secure DOM elements.
- **Strict CORS Policy**: Cross-Origin Resource Sharing is locked down to standard trusted domains, local developers, and subdomains of the hosting environment (`*.vercel.app`).
- **Content Security Policy (CSP)**: Secure CSP rules restrict script sources to `'self'`. Dynamic CSS styling uses `'unsafe-inline'` exclusively to accommodate Vite dev server hot reloading and Tailwind CSS class injection, with comments detailing this exception.

### 5. Rate Limiting & Denial of Service

- **IP-based Limits**: All `/api/` endpoints are rate-limited to 100 requests per 15 minutes per IP address using `express-rate-limit` to prevent brute force attacks and resource starvation.
- **Reverse Proxy Setup**: `trust proxy` is enabled to securely capture the correct client IP address behind API hosting gateways.
