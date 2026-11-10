# Security

## Reporting a vulnerability

Please **do not** open a public issue. Use GitHub's *Report a vulnerability* (Security tab → Advisories)
or the contact on the profile. You get an answer within 7 days.

## How the code is checked

| Check | Tool | Where |
|---|---|---|
| Static analysis Python + JavaScript (taint tracking, OWASP/CWE queries) | GitHub CodeQL `security-extended` | `.github/workflows/security.yml` |
| Python security linter | Bandit | same workflow |
| Unsafe DOM sinks / eval | ESLint + `eslint-plugin-no-unsanitized` | same workflow |
| Integration manifest and structure | hassfest, HACS/Marketplace validation | `validate.yml` |
| Logic incl. input validation, PIN, points | pytest | `validate.yml` |

## Review summary (v0.3.0)

Reviewed by category like a SAST report (Checkmarx/CodeQL style). Every finding below is fixed.

| # | Category (CWE) | Severity | Finding | Fix |
|---|---|---|---|---|
| 1 | Stored XSS (CWE-79) | High | Person colours were inserted unescaped into `style` attributes; a crafted colour could break out of the attribute. | Server accepts only `#rrggbb` (`validate.color`), the cards re-check (`COLOR()`), all text goes through `esc()`. |
| 2 | Stored XSS / tracking (CWE-79, CWE-201) | Medium | Picture field accepted any string (`img:https://…` would load external content). | Whitelist `av:` / `svg:` / own upload path only (`validate.image`), checked server- and client-side. |
| 3 | Untrusted data in UI (CWE-79) | Medium | Calendar titles (ICS), to-do items (Alexa/AnyList) and AI category names are third-party data. | Always escaped; category names, icons and texts normalised (control/bidi characters removed, length limits). |
| 4 | Path traversal (CWE-22) | High | Deleting an old photo used a path from storage. | Only the file *name* is used, inside the fixed avatar folder; names are server-generated. |
| 5 | Unrestricted upload (CWE-434) | Medium | Photo upload. | Data-URL only, MIME + magic-byte check (JPEG/PNG/WebP), 1.5 MB limit, random 96-bit file name, no user-controlled path. |
| 6 | Information exposure (CWE-200) | Low | Photos are served without login (like `/local`). | Unguessable names; documented; nothing else is stored there. |
| 7 | Missing authorization (CWE-862) | Medium | Every HA user could change plan, people and categories. | Option "Only admins may change the plan"; approving rewards and changing points needs admin **or** the parent PIN. |
| 8 | Weak credential storage (CWE-916) | Medium | Parent PIN. | PBKDF2-SHA256, 200 000 iterations, random salt, constant-time compare, lockout after 5 wrong tries (5 min). The PIN hash never leaves the server. |
| 9 | Resource exhaustion (CWE-400) | Low | Unbounded lists in websocket messages; repeated AI calls cost money. | Length limits on all schemas (assignments, aliases, categories, texts); AI optimisation at most once per minute per list. |
| 10 | Prompt injection (CWE-1427) | Low | List items are sent to the configured AI task. | AI output is only used as category *names* (validated, length-limited, max. category limit); it can never trigger actions. |
| 11 | Sensitive data in diagnostics (CWE-532) | Low | Diagnostics download. | Only counts and settings, no names, photos, list contents or PIN. |
| 12 | Default credentials (CWE-1392) | Medium | Start PIN 123456 (0.6.0). | Must be changed before any PIN-protected change is possible; repair issue while active; 123456 can never be chosen again. |
| 13 | Missing authorization (CWE-862) | Medium | Settings page and reward editing in the dashboard (0.6.0). | Always require the parent PIN, also for admins; the PIN is exchanged for a random 256-bit token valid 10 minutes (sliding), bound to the entry, compared in constant time; the PIN is never kept in the browser. Own points per to-do also need the token. |
| 14 | Denial of service (CWE-400) | Low | PBKDF2 (200 000 iterations) in the event loop. | PIN checks run in the executor (0.6.0); empty PINs are not counted as wrong guesses. |
| 15 | Mass assignment (CWE-915) | Medium | Settings saved from the browser (0.6.0). | Every section is rebuilt from known keys only (`settings_spec.py`, unit-tested): numbers clamped, entity ids must match the expected domain, enums whitelisted, texts normalised. |
| 16 | Improper input validation (CWE-20) | Low | Sizes, reward categories, money value and currency (0.7.0). | Sizes and categories are whitelisted enums; point values are always computed on the server (a client cannot send its own cost for a categorised reward); the money value is a finite number clamped to 0–100 000 (NaN/∞ refused); the currency keeps letters, digits and currency symbols only (max. 8). A to-do size other than the default needs the parent-PIN token. |

Not applicable: SQL/command injection (no database or shell), SSRF (no outgoing HTTP besides the HA services you choose), CSRF (HA websocket is authenticated per connection).
