import test from 'node:test';
import assert from 'node:assert/strict';
import { initComposition } from '../../src/scripts/modules/composition.js';
import { initFolio } from '../../src/scripts/modules/folio.js';

class Element extends EventTarget {
  constructor(dataset = {}, id = '') { super(); this.dataset=dataset; this.id=id; this.attributes={}; this.hidden=false; }
  setAttribute(key,value) { this.attributes[key]=value; }
  removeAttribute(key) { delete this.attributes[key]; }
  focus() { this.focused=true; }
  closest() { return this; }
}
function environment(hash='') {
  const window=new EventTarget();
  window.location={hash}; const history=[];
  window.history={pushState(_state,_title,value) { history.push(value); window.location.hash=value; }};
  const keys=['sisa','bagibill','kertas'];
  const links=keys.map(key=>new Element({choice:key},`choice-${key}`));
  const panels=keys.map(key=>new Element({panel:key},`${key}-note`));
  panels.forEach(panel=>panel.querySelector=()=>({id:`${panel.dataset.panel}-heading`}));
  const root=new Element(),index=new Element();
  root.querySelectorAll=selector=>selector==='[data-choice]'?links:panels;
  root.querySelector=()=>index; root.contains=link=>links.includes(link);
  const dispose=initComposition(root,window);
  function action(type,i,fields={}) {
    const event=new Event(type,{cancelable:true});Object.defineProperty(event,'target',{value:links[i]});
    Object.assign(event,fields);root.dispatchEvent(event);return event;
  }
  return {root,index,links,panels,window,history,action,dispose};
}
test('initial enhancement and fragment restore expose exactly one panel',()=>{
 const e=environment('#kertas-note');
 assert.deepEqual(e.panels.map(p=>p.hidden),[true,true,false]);
 assert.deepEqual(e.links.map(l=>l.tabIndex),[-1,-1,0]);
 assert.equal(e.links[2].attributes['aria-selected'],'true');assert.equal(e.history.length,0);e.dispose();
});
test('keyboard selection, back navigation, unrelated anchors and repeated clicks',()=>{
 const e=environment();
 assert.ok(e.action('keydown',0,{key:'ArrowRight'}).defaultPrevented);
 assert.equal(e.window.location.hash,'#bagibill-note');assert.ok(e.links[1].focused);
 e.action('click',1,{button:0});assert.equal(e.history.length,1,'same selection must not add history');
 e.window.location.hash='#studio';e.window.dispatchEvent(new Event('hashchange'));
 assert.equal(e.root.dataset.active,'bagibill','studio anchor must not reset selection');
 e.window.location.hash='';e.window.dispatchEvent(new Event('popstate'));assert.equal(e.root.dataset.active,'sisa');
 e.action('keydown',0,{key:'End'});assert.equal(e.root.dataset.active,'kertas');
 e.action('keydown',2,{key:'ArrowRight'});assert.equal(e.root.dataset.active,'sisa');
 e.action('keydown',0,{key:'ArrowLeft'});assert.equal(e.root.dataset.active,'kertas');
 e.action('keydown',2,{key:'Home'});assert.equal(e.root.dataset.active,'sisa');e.dispose();
});
test('modified links remain native; disposal restores complete fallback',()=>{
 const e=environment();assert.equal(e.action('click',1,{ctrlKey:true}).defaultPrevented,false);assert.equal(e.history.length,0);
 e.action('click',1);e.dispose();assert.ok(e.panels.every(p=>!p.hidden));assert.equal(e.index.attributes.role,undefined);
 e.action('click',2);assert.equal(e.history.length,1);assert.equal(e.root.dataset.enhanced,undefined);
});
test('invalid enhancement leaves semantic HTML untouched',()=>{
 const root=new Element();root.querySelectorAll=()=>[];root.querySelector=()=>null;
 assert.equal(initComposition(root,{}),undefined);assert.equal(root.dataset.enhanced,undefined);
});
test('folio deep links reveal the correct fold; malformed fragments stay harmless',()=>{
 const window=new EventTarget();window.location={hash:'#invitation'};
 const folds=['printable','interactive','custom','invitation'].map(id=>({id,open:false,scrollIntoView(){this.scrolled=true;}}));
 const dispose=initFolio({querySelectorAll:()=>folds},window);
 assert.ok(folds[3].open);assert.ok(folds[3].scrolled);assert.equal(folds[1].open,false);
 window.location.hash='#interactive';window.dispatchEvent(new Event('hashchange'));assert.ok(folds[1].open);
 window.location.hash='#%E0';assert.doesNotThrow(()=>window.dispatchEvent(new Event('hashchange')));
 dispose();window.location.hash='#custom';window.dispatchEvent(new Event('hashchange'));assert.equal(folds[2].open,false);
});
