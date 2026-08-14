import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const pagePath = path.join(process.cwd(), 'src/pages/services/seo-for-logistics-companies/index.astro');
const source = fs.readFileSync(pagePath, 'utf8');
const caseHubPath = path.join(process.cwd(), 'src/pages/case/index.astro');
const caseHubSource = fs.readFileSync(caseHubPath, 'utf8');

test('Logistics SEO page remains the canonical commercial owner for observed demand', () => {
  expect(source).toContain('Logistics SEO Agency for Trucking & Transportation Companies | Hermes');
  expect(source).toContain('Logistics SEO for Trucking, Transportation and Freight Companies');
  expect(source).toContain('logistics SEO agency');
  expect(source).toContain('trucking SEO company');
  expect(source).toContain('transportation-company SEO');
  expect(source).toContain('warehousing SEO');
  expect(source).toContain('/services/seo/');
});

test('Logistics SEO pass keeps anti-doorway and non-guarantee boundaries', () => {
  expect(source).toContain('thin pages for every keyword variation');
  expect(source).toContain('does not guarantee rankings, traffic, inquiries or revenue');
  expect(source).toContain('A separate page is justified only when the business actually provides a distinct service');
});

test('published case hub provides contextual internal support to the Logistics SEO canonical owner', () => {
  expect(caseHubSource).toContain('href="/services/seo-for-logistics-companies/"');
  expect(caseHubSource).toContain('Logistics SEO services for trucking and transportation companies');
});
