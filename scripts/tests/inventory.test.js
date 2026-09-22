import test from 'node:test';
import assert from 'node:assert/strict';
import {printableBooks,inventoryNote,kertasOfferings,inventoryProvenance,codingCollection} from '../../src/content/kertas-inventory.js';
test('owner age range does not fabricate individual Coding books',()=>{
 assert.deepEqual(printableBooks.filter(x=>x.kind==='busy').map(x=>x.age),[2,3,4,5]);
 assert.equal(printableBooks.filter(x=>x.kind==='coding').length,0);
 assert.equal(codingCollection.ownerReportedCount,5);assert.equal(codingCollection.verifiedCount,null);assert.equal(codingCollection.action,null);
 assert.match(inventoryNote,/five Coding books/);assert.match(inventoryNote,/count remains unverified/);
 assert.equal(new Set(printableBooks.map(x=>x.id)).size,printableBooks.length);
});
test('source existence does not imply commercial readiness',()=>{
 for(const book of printableBooks){assert.equal(book.price,null);assert.equal(book.action,null);assert.ok(['unverified','source-available'].includes(book.availability));}
 assert.match(inventoryProvenance.revision,/^[a-f0-9]{40}$/);
 assert.equal(kertasOfferings.length,4);
 assert.equal(kertasOfferings.find(x=>x.id==='invitation').state,'past-work');
 assert.equal(kertasOfferings.find(x=>x.id==='invitation').action.href,'https://berryisthree.pika-xu.com/');
});

test('personalized books and invitation examples do not create ordering routes', async () => {
  const { customCollections, invitationExamples } = await import('../../src/content/kertas-inventory.js');
  const stories = customCollections.find(item => item.id === 'storybooks');
  assert.equal(stories.action, null);
  assert.equal(stories.state, 'coming-soon');
  assert.match(stories.description.id, /nama dan wajah/);
  assert.match(stories.description.en, /names and faces/);
  assert.equal(invitationExamples[0].href, 'https://berryisthree.pika-xu.com/');
  assert.match(invitationExamples[0].description.id, /Contoh/);
});
