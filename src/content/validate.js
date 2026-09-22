import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { content } from './products.js';

const fail = (message) => { throw new Error(`Content validation failed: ${message}`); };
const requireValue = (condition, message) => { if (!condition) fail(message); };
const validText = (text) => typeof text === 'string' && text.trim().length > 0;
const states = ['Draft', 'Review', 'Ready'];
function verification(value, label) {
  requireValue(value && ['Recorded', 'Verified', 'Rejected'].includes(value.status) && validText(value.source), `${label}: invalid provenance`);
  if (value.status === 'Verified') requireValue(validText(value.verifiedAt) && Number.isFinite(Date.parse(value.verifiedAt)), `${label}: verification date required`);
  else requireValue(value.verifiedAt === null, `${label}: unverified date must be null`);
}
function locales(values, fields, label) {
  requireValue(values && typeof values === 'object', `${label}: locales required`);
  for (const [locale, copy] of Object.entries(values)) {
    requireValue(['en', 'id'].includes(locale), `${label}: invalid locale`);
    if (copy === null) continue;
    requireValue(states.includes(copy.status), `${label}: invalid copy status`);
    if (copy.status === 'Ready') for (const field of fields) requireValue(validText(copy[field]), `${label}.${locale}: ${field} required`);
  }
}
export function validateContent(data = content, { checkFiles = true } = {}) {
  const maps = {};
  for (const group of ['products', 'actions', 'offers', 'demos', 'media']) {
    requireValue(Array.isArray(data[group]), `${group}: array required`);
    maps[group] = new Map();
    for (const item of data[group]) {
      requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) && !maps[group].has(item.id), `${group}: invalid or duplicate ID`);
      maps[group].set(item.id, item);
    }
  }
  const ref = (group, id) => requireValue(maps[group].has(id), `missing ${group} reference: ${id}`);
  locales(data.studio.locales, ['title', 'description', 'headline', 'intro', 'body'], 'studio');
  ref('products', data.studio.productId); ref('actions', data.studio.contactActionId); ref('media', data.studio.socialMediaId); data.studio.artworkMediaIds.forEach((id) => ref('media', id));
  for (const action of data.actions) {
    requireValue(['Try demo', 'View product', 'Buy product', 'Contact email'].includes(action.type), `${action.id}: invalid action type`);
    requireValue(['same', 'new'].includes(action.openMode), `${action.id}: invalid open mode`);
    requireValue(typeof action.external === 'boolean', `${action.id}: external required`);
    requireValue(action.locales && Object.values(action.locales).every(validText) && Object.keys(action.locales).every((key) => ['en', 'id'].includes(key)), `${action.id}: invalid labels`);
    const value = action.destination;
    requireValue(validText(value) && !/[\\\s]/.test(value), `${action.id}: invalid destination`);
    if (action.type === 'View product') requireValue(!action.external && /^\/(?!\/)[a-z0-9/-]*\/$/.test(value), `${action.id}: invalid internal URL`);
    else if (action.type === 'Contact email') requireValue(action.external && /^mailto:[^@?]+@[^@?]+\.[^@?]+$/.test(value), `${action.id}: invalid email`);
    else {
      let url; try { url = new URL(value); } catch { fail(`${action.id}: invalid URL`); }
      requireValue(action.external && url.protocol === 'https:' && !url.username && !url.password, `${action.id}: HTTPS required`);
    }
    verification(action.verification, action.id);
  }
  const slugs = new Set();
  for (const product of data.products) {
    requireValue(validText(product.name) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) && !slugs.has(product.slug), 'invalid identity or duplicate slug'); slugs.add(product.slug);
    requireValue(product.kind === 'Stand-alone product' && product.productTypes?.every((v) => ['Tool', 'Play', 'Printable'].includes(v)) && product.formats?.every((v) => ['Web app', 'PDF'].includes(v)), `${product.id}: invalid classification`);
    requireValue(['Available', 'Preview', 'Coming soon'].includes(product.availability), `${product.id}: invalid availability`);
    verification(product.availabilityVerification, product.id);
    locales(product.locales, ['title', 'description', 'oneLineBenefit', 'summary'], product.id);
    if (product.offerId !== null) ref('offers', product.offerId);
    if (product.demoId !== null) ref('demos', product.demoId);
    product.mediaIds.forEach((id) => ref('media', id));
    Object.values(product.actionPlacement).flat().forEach((id) => ref('actions', id));
    const facts = new Set();
    for (const fact of product.facts) {
      requireValue(validText(fact.id) && !facts.has(fact.id), 'duplicate or invalid fact ID'); facts.add(fact.id);
      requireValue(fact.locales && Object.values(fact.locales).every(validText), `${fact.id}: invalid fact text`);
      verification(fact.verification, fact.id);
    }
  }
  for (const offer of data.offers) {
    ref('products', offer.productId); ref('actions', offer.purchaseActionId);
    requireValue(maps.products.get(offer.productId).offerId === offer.id, `${offer.id}: inconsistent product relation`);
    requireValue(typeof offer.commercial === 'boolean' && maps.actions.get(offer.purchaseActionId).type === 'Buy product', `${offer.id}: invalid purchase action`);
    const price = offer.price;
    requireValue(price && ['Exact', 'On destination'].includes(price.mode), `${offer.id}: invalid price mode`);
    if (price.mode === 'Exact') requireValue(Number.isFinite(price.amount) && price.amount >= 0 && /^[A-Z]{3}$/.test(price.currency) && Intl.supportedValuesOf('currency').includes(price.currency) && validText(price.source), `${offer.id}: exact price needs amount, currency and source`);
    else requireValue(price.amount === null && price.currency === null, `${offer.id}: destination price must not invent a local amount`);
    verification(offer.purchaseDetails.verification, offer.id);
  }
  for (const demo of data.demos) requireValue(demo.mode === 'fixed-example' && demo.currency === 'IDR' && Number.isSafeInteger(demo.initialAmount) && Number.isSafeInteger(demo.expenseAmount) && demo.expenseAmount > 0 && demo.initialAmount >= demo.expenseAmount, `${demo.id}: invalid example`);
  for (const item of data.media) {
    requireValue(['social-card', 'studio-artwork', 'product-screenshot', 'audio'].includes(item.role) && states.includes(item.status), `${item.id}: invalid media enum`);
    requireValue(validText(item.rights) && item.width > 0 && item.height > 0 && typeof item.decorative === 'boolean' && (item.decorative ? item.alt === '' : validText(item.alt)), `${item.id}: invalid media metadata`);
    requireValue(/^\/(?!\/)[a-zA-Z0-9/_.-]+$/.test(item.source) && !item.source.includes('..'), `${item.id}: invalid media path`);
    if (checkFiles) requireValue(existsSync(resolve('public', `.${item.source}`)), `${item.id}: missing asset`);
  }
  return data;
}
export function publicationIssues(product, locale = 'en', data = content) {
  const issues = [];
  const copy = product.locales[locale];
  if (copy?.status !== 'Ready' || !['title', 'description', 'oneLineBenefit', 'summary'].every((key) => validText(copy?.[key]))) issues.push(`${product.id}.${locale}: copy under review`);
  if (product.availability !== 'Available' || product.availabilityVerification.status !== 'Verified') issues.push(`${product.id}: availability unverified`);
  for (const fact of product.facts.filter((fact) => fact.verification.status !== 'Rejected')) if (fact.verification.status !== 'Verified' || !fact.locales[locale]) issues.push(`${product.id}.${fact.id}: claim unverified or untranslated`);
  for (const id of new Set(Object.values(product.actionPlacement).flat())) {
    const action = data.actions.find((value) => value.id === id);
    if (!action || action.verification.status !== 'Verified' || !action.locales[locale]) issues.push(`${id}: destination or label unverified`);
  }
  const offer = data.offers.find((value) => value.id === product.offerId);
  if (!offer || offer.purchaseDetails.verification.status !== 'Verified' || !['contents', 'access', 'demoLimits'].every((key) => validText(offer.purchaseDetails[key]))) issues.push(`${product.id}: offer details unverified`);
  if (!product.mediaIds.length) issues.push(`${product.id}: media missing`);
  for (const id of product.mediaIds) if (data.media.find((value) => value.id === id)?.status !== 'Ready') issues.push(`${id}: media under review`);
  return issues;
}
export function releaseIssues(data = content) {
  const issues = [];
  for (const locale of ['id', 'en']) if (data.studio.locales[locale]?.status !== 'Ready') issues.push(`studio.${locale}: copy under review`);
  if (data.media.find((item) => item.id === data.studio.socialMediaId)?.status !== 'Ready') issues.push('studio: social media under review');
  if (data.actions.find((item) => item.id === data.studio.contactActionId)?.verification.status !== 'Verified') issues.push('studio: contact operation unverified');
  for (const id of data.studio.artworkMediaIds) if (data.media.find((item) => item.id === id)?.status !== 'Ready') issues.push(`${id}: artwork under review`);
  const required = data.products.find((item) => item.slug === 'sisa');
  if (!required) issues.push('Required route /sisa/ missing');
  else for (const locale of ['id', 'en']) issues.push(...publicationIssues(required, locale, data));
  return issues;
}
export function assertRelease(data = content) {
  validateContent(data);
  const issues = releaseIssues(data);
  if (issues.length) throw new Error(`Release blocked:\n${issues.join('\n')}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateContent();
  if (process.argv.includes('--release')) assertRelease();
  else console.log(`Content integrity passed. Local preview only; ${releaseIssues().length} release blockers remain.`);
}
