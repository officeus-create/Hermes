# Cookie & Tracking Design Boundary

The current site-wide GA4 implementation loads before a visitor makes a privacy choice. The next compliance sprint must move analytics behind an affirmative choice while keeping necessary site functionality available without analytics.

Target behavior:
- necessary site functionality is available by default;
- GA4 is not requested on a fresh visit before analytics consent;
- the visitor can choose `Accept analytics` or `Necessary only` with comparable prominence;
- the visitor can reopen privacy settings later;
- no Meta Pixel, Google Ads remarketing, or other advertising tracker is approved by this sprint;
- consent-state storage contains only the preference/version needed to remember the choice;
- privacy copy must describe the deployed behavior rather than a future intention;
- automated tests must fail if GA4 becomes unconditional again.

This engineering baseline does not determine statutory applicability for every visitor or Hermes business. Regional legal review remains required when a targeted market or new tracking purpose changes the applicable obligations.
