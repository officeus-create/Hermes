# Repair Shop Customer CRM final validation

Production-track scope: Repair Shops only.

Required gates before merge:
- release manifest includes the private Customers route as noindex
- owner workspace exposes a Customers navigation action
- customer CRM source contract passes
- Playwright customer CRM contract passes on desktop and mobile projects
- full Website checks pass without skipped Repair Shop acceptance tests
- production smoke runs on the custom domain after merge and cleans its isolated test data
