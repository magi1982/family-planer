// Every way through every evolution tree: after choosing it, the pet is found on exactly that way again
// (the next evolution offers the children of the chosen node, not of the first node of the same step).
// Run: node tests/js/pet_tree_path.js  (used by tests/test_pets_tree.py)
const path = require('path');
global.window = {};
require(path.join(__dirname, '../../frontend_src/pets/pets4.js'));
require(path.join(__dirname, '../../frontend_src/pets/tree.js'));
const TR = window.FPTREE; const errors = []; let n = 0;
for (const [k] of window.P4.LIST) {
  if (!window.P4.BY[k]) continue;
  const t = TR.tree(k);
  const walk = (nd, p) => {
    if (p.length) {
      // what the server stores after a step: the step number and the name (max. 24 characters)
      const pet = { kind: k, step: p.length, name: p.length === 1 && nd.name === 'Baby' ? '' : String(nd.name).slice(0, 24) };
      const got = TR.pathOf(t, pet); n += 1;
      if (got.join('.') !== p.join('.')) errors.push(`${k}: ${nd.name} (step ${p.length}) found at ${got.join('.')} instead of ${p.join('.')}`);
    }
    nd.kids.forEach((c, i) => walk(c, p.concat(i)));
  };
  walk(t, []);
  if (TR.tree(k) && JSON.stringify(TR.tree(k)) !== JSON.stringify(t)) errors.push(`${k}: tree is not the same on every call`);
}
if (errors.length) { console.error(errors.slice(0, 20).join('\n')); console.error(`${errors.length} errors in ${n} ways`); process.exit(1); }
console.log(`ok: ${n} ways`);
