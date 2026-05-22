# Business Central Time Tracker for Zendesk

Zendesk Support sidebar app that lets agents log ticket work directly to Microsoft Dynamics 365 Business Central `timeRegistrationEntries`.

## Features
- Ticket-sidebar UI using ZAF v2
- Customer/client selector from Business Central customers
- Project/job selector from Business Central jobs, filtered by selected customer when possible
- Date, decimal hours, and 250-character work description validation
- Zendesk ticket URL appended to the Business Central time entry description
- Current Zendesk agent email matched against Business Central employees
- Secure Zendesk app setting for the Business Central password
- React 18 + Webpack 5 project structure

## Configure
Install the app in Zendesk and set:
- `bc_tenant_id`
- `bc_environment` (`production` by default)
- `bc_company_id`
- `bc_username`
- `bc_password` (secure password parameter)
- `bc_default_unit` (`HOUR` by default)

## Development
```bash
npm install
npm test
npm run build
```

Package with Zendesk app tooling after build.

## Notes
This MVP uses Basic Authentication as allowed by the bounty spec. For production, consider OAuth 2.0 / Entra ID and a small backend proxy for token exchange and audit logging.
