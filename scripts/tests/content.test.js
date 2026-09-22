import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../../src/content/products.js';
import { validateContent, publicationIssues, releaseIssues, assertRelease } from '../../src/content/validate.js';
const copy = () => structuredClone(content);
const valid = (data) => validateContent(data, { checkFiles: false });
const verify = (value) => Object.assign(value, { status: 'Verified', source: 'Test fixture only: product inspection', verifiedAt: '2026-09-21T00:00:00Z' });
function readyFixture() {
  const data = copy();
  for (const locale of ['id','en']) data.studio.locales[locale].status = 'Ready';
  for (const action of data.actions) verify(action.verification);
  for (const item of data.media) item.status = 'Ready';
  const product = data.products[0]; for (const locale of ['id','en']) product.locales[locale].status = 'Ready'; verify(product.availabilityVerification);
  product.facts.forEach((fact) => verify(fact.verification));
  Object.assign(data.offers[0].purchaseDetails, { contents: 'Fixture contents', access: 'Fixture access', demoLimits: 'Fixture limits' });
  verify(data.offers[0].purchaseDetails.verification);
  return data;
}
test('current records pass integrity without pretending to be releasable', () => { valid(copy()); assert.ok(releaseIssues().length > 0); assert.throws(() => assertRelease(), /Release blocked/); });
test('release requires both languages and does not invent a local price', () => { const data = readyFixture(); valid(data); assert.deepEqual(releaseIssues(data), []); data.products[0].locales.id = null; assert.ok(releaseIssues(data).some(issue => issue.includes('sisa.id'))); });
test('incomplete unrequested draft does not block another product', () => {
  const data = readyFixture(); const draft = structuredClone(data.products[0]);
  Object.assign(draft, { id: 'draft', slug: 'draft', availability: 'Coming soon', offerId: null, demoId: null, mediaIds: [], facts: [], actionPlacement: {}, locales: { en: { status: 'Draft' }, id: null } });
  data.products.push(draft); valid(data); assert.deepEqual(releaseIssues(data), []);
});
for (const [label, mutate] of [
  ['duplicate ID', d => d.products.push(structuredClone(d.products[0]))],
  ['duplicate slug', d => d.products.push({ ...structuredClone(d.products[0]), id: 'different' })],
  ['broken offer relation', d => d.products[0].offerId = 'missing'],
  ['broken action relation', d => d.products[0].actionPlacement.hero = ['missing']],
  ['bad enum', d => d.products[0].availability = 'Free'],
  ['unsafe URL', d => d.actions[0].destination = 'javascript:alert(1)'],
  ['protocol relative URL', d => d.actions[1].destination = '//evil.test/'],
  ['HTTP destination', d => d.actions[0].destination = 'http://example.test'],
  ['wrong action kind', d => d.offers[0].purchaseActionId = 'sisa-demo'],
  ['false verification date', d => d.actions[0].verification.status = 'Verified'],
  ['Exact without amount', d => d.offers[0].price.mode = 'Exact'],
  ['invented destination price', d => d.offers[0].price.amount = 0],
  ['unknown currency', d => d.offers[0].price = { mode: 'Exact', amount: 3, currency: 'ZZZ', source: 'fixture' }],
  ['invalid example', d => d.demos[0].expenseAmount = 130000],
  ['missing Ready copy', d => d.products[0].locales.en = { status: 'Ready', title: 'Only a title' }],
]) test(`integrity rejects ${label}`, () => { const data = copy(); mutate(data); assert.throws(() => valid(data)); });
test('Exact price needs a real currency and source', () => { const data = copy(); data.offers[0].price = { mode: 'Exact', amount: 10, currency: 'USD', source: 'Test fixture' }; valid(data); });
test('Ready copy alone cannot approve claims or offers', () => { const data = copy(); data.products[0].locales.en.status = 'Ready'; assert.ok(publicationIssues(data.products[0], 'en', data).some(value => value.includes('claim'))); assert.ok(publicationIssues(data.products[0], 'en', data).some(value => value.includes('offer'))); });
test('required Sisa cannot vanish silently', () => { const data = readyFixture(); data.products = []; assert.ok(releaseIssues(data).includes('Required route /sisa/ missing')); });
test('missing local asset fails even in preview', () => { const data = copy(); data.media[0].source = '/missing.png'; assert.throws(() => validateContent(data), /missing asset/); });
