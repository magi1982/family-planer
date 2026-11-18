/* Family Planer – development tree per pet (design draft, round 9).
   Egg -> Baby -> Young (the child picks a colour) -> Adult (the child picks a look). 3 x 3 = 9 different adults per animal. */
(() => {
  // colour of the young animal: name + palette override (first one is always the natural colour)
  const COL = {
    fuchs: [['Rotfuchs', {}], ['Silberfuchs', { c: '#8E96A3', tipC: '#fff' }], ['Polarfuchs', { c: '#F2F4F6', b: '#fff', earIn: '#9AA3AD', legC: '#C9D1DA', armC: '#C9D1DA' }]],
    katze: [['Grau getigert', {}], ['Rot getigert', { c: '#F0A35E', b: '#FFF1DE' }], ['Schwarz', { c: '#3A3D45', b: '#5A5E68' }]],
    hund: [['Braun', {}], ['Golden', { c: '#E9C27A', b: '#FFF1D6', earC: '#C99A50' }], ['Schwarz', { c: '#3B3B40', b: '#ECECEC', earC: '#26262A' }]],
    hase: [['Hellbraun', {}], ['Schneeweiss', { c: '#F7F7F5', footC: '#fff' }], ['Schoko', { c: '#8A6448', b: '#E9D3BE' }]],
    igel: [['Natur', {}], ['Hell', { spikes: '#D9C7AE', c: '#FFF4EA' }], ['Nacht', { spikes: '#4A4F63' }]],
    waschbaer: [['Grau', {}], ['Rötlich', { c: '#B98A6A', earC: '#8A5E40' }], ['Silber', { c: '#C9CED6', earC: '#9AA3AD' }]],
    panda: [['Klassisch', {}], ['Roter Panda', { c: '#E07A3F', earC: '#7A2E12', armC: '#3A1E10', legC: '#3A1E10' }], ['Braun', { earC: '#6A4A32', armC: '#6A4A32', legC: '#6A4A32' }]],
    erdmann: [['Natur', {}], ['Hell', { c: '#EAD7B5' }], ['Dunkel', { c: '#A88A64', earC: '#3A2E22' }]],
    eichhorn: [['Rot', {}], ['Grau', { c: '#8E96A3', b: '#F2F4F6' }], ['Schwarz', { c: '#3A3530', b: '#8A7A6A' }]],
    hamster: [['Gold', {}], ['Weiss', { c: '#F7F4EE', earC: '#E8D8C8', cheeks: '#FFE3E8' }], ['Grau', { c: '#A7ADB5', earC: '#8A9099' }]],
    maus: [['Grau', {}], ['Weiss', { c: '#F7F5F2' }], ['Braun', { c: '#9A7454' }]],
    einhorn: [['Regenbogen', {}], ['Pastell', { maneC: ['#FFD6E8', '#D6F0FF', '#E8D6FF'] }], ['Gold', { c: '#FFF4D6', maneC: ['#F7C948', '#FFE08A', '#FFFFFF'] }]],
    otter: [['Braun', {}], ['Hell', { c: '#B98A5E', armC: '#9A6A40' }], ['Schoko', { c: '#5A3A24', armC: '#46301E' }]],
    frosch: [['Grün', {}], ['Blau', { c: '#3A86C8', b: '#BFE0FF' }], ['Rot', { c: '#E5483B', b: '#FFD0C8' }]],
    axolotl: [['Rosa', {}], ['Wild', { c: '#7E8A62', b: '#C2CCA4', gills: '#4A5A3A' }], ['Gold', { c: '#F7C948', b: '#FFF0B8', gills: '#E09A20' }]],
    eidechse: [['Grün', {}], ['Blau', { c: '#4A90D9', b: '#CDE6FF', spots: '#2A5A9A' }], ['Gelb', { c: '#E8C23A', b: '#FFF2B8', spots: '#A07A10' }]],
    chamae: [['Grün', {}], ['Türkis', { c: '#2FB5B5', b: '#C0F0F0', stripesV: '#7FE0E0' }], ['Orange', { c: '#F08A3D', b: '#FFE0C0', stripesV: '#FFC08A' }]],
    drache: [['Grün', {}], ['Rot', { c: '#D9483B', b: '#F7D08A', wings: '#F08A6A' }], ['Blau', { c: '#3A86C8', b: '#CDE6FF', wings: '#7FB8F0' }]],
    eule: [['Waldkauz', {}], ['Schneeeule', { c: '#F4F4F2', b: '#fff', wingC: '#D6DADF' }], ['Grau', { c: '#8E96A3', wingC: '#6E7480' }]],
    pinguin: [['Kaiser', {}], ['Zwergpinguin', { c: '#4A6E9A' }], ['Felsen', { c: '#262626' }]],
    papagei: [['Rot', {}], ['Blau-gelb', { c: '#3E8EDE', b: '#F7C948', wingC: '#2A6AB0' }], ['Grün', { c: '#3CC48A', b: '#F7D44A', wingC: '#E5483B' }]],
    biene: [['Honig', {}], ['Orange', { c: '#F59A3B' }], ['Pastell', { c: '#FFE08A' }]],
    reh: [['Natur', {}], ['Hell', { c: '#D9A878' }], ['Weisses Reh', { c: '#F4EFE8', legC: '#E0D6CA' }]],
    pony: [['Braun', {}], ['Schimmel', { c: '#E9E6E1', muzC: '#D6D0C8', maneC: ['#C9C2B8', '#FFFFFF'] }], ['Rappe', { c: '#3A3530', muzC: '#5A524A', maneC: ['#1E1A16', '#3A3530'] }]],
    koala: [['Grau', {}], ['Hell', { c: '#C9CED6' }], ['Braun', { c: '#A8927E' }]],
    faultier: [['Natur', {}], ['Hell', { c: '#C9AE8E' }], ['Moos', { c: '#8E9A6A' }]],
    robbe: [['Grau', {}], ['Hell', { c: '#B9C3CC', b: '#E1E6EA' }], ['Dunkel', { c: '#5A6470' }]],
    biber: [['Braun', {}], ['Hell', { c: '#B07A48' }], ['Dunkel', { c: '#5A3A24' }]],
    fledermaus: [['Lila', {}], ['Braun', { c: '#7A5A44', b: '#9A7A64' }], ['Silber', { c: '#9AA3AD', b: '#C9CED6' }]],
    kolibri: [['Grün', {}], ['Blau', { c: '#3A86C8' }], ['Lila', { c: '#9A6ADF' }]],
    tiger: [['Orange', {}], ['Weisser Tiger', { c: '#F4F1EC' }], ['Gold', { c: '#F7C948' }]],
    pegasus: [['Weiss', {}], ['Nacht', { c: '#3A4060', muzC: '#4A5070', wings: '#5A6090', maneC: ['#B9A2FF', '#7FD3FF', '#FFFFFF'] }], ['Rosé', { c: '#FFE6F0', wings: '#FFD0E3' }]],
    phoenix: [['Feuer', {}], ['Eis', { c: '#3A86C8', b: '#9FD0FF', wingC: '#7FB8F0', wings: '#9FD0FF' }], ['Gold', { c: '#E8B53A', b: '#FFE08A', wingC: '#F7C948', wings: '#FFE08A' }]],
    greif: [['Gold', {}], ['Schnee', { bodyC: '#E9E6E1', wings: '#C9C2B8', wingC: '#C9C2B8' }], ['Dunkel', { bodyC: '#8A6A48', wings: '#5A4632', wingC: '#5A4632' }]],
    kitsune: [['Weiss', {}], ['Feuer', { c: '#F08A3D' }], ['Nacht', { c: '#3A3F5C', earIn: '#7FD3FF' }]],
    yeti: [['Schnee', {}], ['Eisblau', { c: '#CDE6FF', armC: '#BFD8F5', legC: '#BFD8F5' }], ['Bigfoot', { c: '#8A6A48', b: '#B99A7A', armC: '#7A5A3E', legC: '#7A5A3E' }]],
    nessie: [['Grün', {}], ['Blau', { c: '#3A86C8', b: '#BFE0FF', spots: '#2A5A9A' }], ['Lila', { c: '#9A6ADF', b: '#E6D6FF', spots: '#6A3AAF' }]],
    wolpi: [['Natur', {}], ['Weiss', { c: '#F2EEE8', earC: '#F2EEE8' }], ['Dunkel', { c: '#6A5038', earC: '#6A5038' }]],
  };
  // ---------------------------------------------------------------- round 11: varied, uneven trees with wild end forms
  // shape: A = small (one choice at the end), B = colour when young, each colour leads to 1–3 end forms (uneven),
  // C = colour already as a baby, uneven branches, D = rich (Fabelwesen, dragon, unicorn)
  const SHAPE = {};
  ['biene', 'kaefer', 'falter', 'kolibri', 'maus', 'hamster'].forEach((k) => { SHAPE[k] = 'A'; });
  ['igel', 'erdmann', 'frosch', 'axolotl', 'eidechse', 'chamae', 'pinguin', 'ente', 'koala', 'faultier', 'robbe', 'biber', 'flamingo', 'fledermaus', 'reh'].forEach((k) => { SHAPE[k] = 'B'; });
  ['fuchs', 'katze', 'hund', 'hase', 'waschbaer', 'panda', 'eichhorn', 'otter', 'eule', 'papagei', 'pony', 'tiger'].forEach((k) => { SHAPE[k] = 'C'; });
  ['einhorn', 'drache', 'pegasus', 'phoenix', 'greif', 'kitsune', 'yeti', 'nessie', 'wolpi'].forEach((k) => { SHAPE[k] = 'D'; });
  const SHAPE_TXT = { A: 'klein – erst am Ende wird gewählt', B: 'Farbe als Jungtier, jede Farbe führt zu anderen Endformen', C: 'schon das Baby wählt, die Äste sind verschieden lang', D: 'reich – viele Wege, Schein und Spezialfarben' };
  const FABEL = ['pegasus', 'phoenix', 'greif', 'kitsune', 'yeti', 'nessie', 'wolpi'];
  const THEME = {
    wasser: { skins: ['kristall', 'opal', 'smaragd', 'silber'], pats: ['tupfen', 'sternchen'], auras: ['blau', 'sterne'], extra: [['back', 'feenfluegel'], ['under', 'mondsichel']] },
    feuer: { skins: ['feuer', 'lava', 'gold'], pats: ['zebra', 'leopard'], auras: ['flammen', 'funken'], extra: [['under', 'blitz']] },
    nacht: { skins: ['galaxie', 'schatten', 'neon'], pats: ['sternchen', 'zebra'], auras: ['sterne', 'regenbogen'], extra: [['under', 'mondsichel'], ['under', 'augenfleck'], ['back', 'feenfluegel']] },
    wald: { skins: ['smaragd', 'gold', 'rosegold'], pats: ['tarn', 'leopard', 'tupfen'], auras: ['gold', 'funken'], extra: [['deco', 'geweih'], ['back', 'maehne'], ['under', 'augenfleck']] },
    suess: { skins: ['rosegold', 'opal', 'regenbogen'], pats: ['herzchen', 'tupfen', 'kariert'], auras: ['herzen', 'rosa'], extra: [['back', 'feenfluegel'], ['back', 'fluegelchen'], ['under', 'herzfleck']] },
    himmel: { skins: ['regenbogen', 'silber', 'opal', 'gold'], pats: ['sternchen', 'tupfen'], auras: ['regenbogen', 'sterne'], extra: [['back', 'feenfluegel'], ['deco', 'einhornhorn'], ['under', 'mondsichel']] },
  };
  const TH = { fuchs: 'feuer', katze: 'nacht', hund: 'wald', hase: 'suess', igel: 'wald', waschbaer: 'nacht', panda: 'suess', erdmann: 'wald', eichhorn: 'wald', hamster: 'suess', maus: 'suess', einhorn: 'himmel', otter: 'wasser', frosch: 'wasser', axolotl: 'wasser', eidechse: 'feuer', chamae: 'wald', drache: 'feuer', eule: 'nacht', pinguin: 'wasser', ente: 'wasser', papagei: 'himmel', biene: 'suess', kaefer: 'suess', falter: 'himmel', reh: 'wald', pony: 'himmel', koala: 'suess', faultier: 'wald', robbe: 'wasser', biber: 'wasser', flamingo: 'suess', fledermaus: 'nacht', kolibri: 'himmel', tiger: 'feuer', pegasus: 'himmel', phoenix: 'feuer', greif: 'wald', kitsune: 'nacht', yeti: 'wasser', nessie: 'wasser', wolpi: 'wald' };
  const MPOOL = { wasser: ['flossen', 'rueckenzacken', 'langschwanz', 'elfenohren'], feuer: ['glutmaehne', 'flammenschwanz', 'stachelfrisur', 'sonnenkranz'], nacht: ['mondhalo', 'sternschweif', 'dreischwanz', 'elfenohren'], wald: ['blattmaehne', 'pilzhut', 'grossgeweih', 'lockenpracht', 'langschwanz'], suess: ['zuckerhorn', 'riesenbluete', 'lockenpracht', 'dreischwanz'], himmel: ['wolkenschweif', 'sonnenkranz', 'kristallhorn', 'megamaehne'] };
  // wings: only a few animals get them, only as legend, and then they can really fly (Schwebeflug)
  const WINGS = { pony: 'engelsfluegel', einhorn: 'engelsfluegel', katze: 'engelsfluegel', tiger: 'drachenfluegel', reh: 'schmetterlingsfluegel', kitsune: 'feuerfluegel' };
  const ABP = { wasser: ['blasen', 'kristall', 'schnee', 'regenbogen'], feuer: ['feuer', 'blitz', 'funken'], nacht: ['sterne', 'blitz', 'glitzer'], wald: ['bluemchen', 'pilze', 'blaetter', 'falter'], suess: ['herzchen', 'bluemchen', 'falter', 'regenbogen'], himmel: ['regenbogen', 'wolke', 'noten', 'sterne'] };
  const REQ = { ei: 'Start', baby: 'ab 30 Wachstum', jung: 'ab 150 Wachstum – Farbe wählen', gross: 'ab 450 Wachstum', merkmal: 'ab 450 Wachstum – wird gross', farbe: 'ab 450 Wachstum + 1 Entwicklungs-Pille', schein: 'ab 1150 Wachstum', form: 'ab 800 Wachstum – neue Form', legende: 'ab 1750 Wachstum + 1 Entwicklungs-Pille' };
  // ---------------------------------------------------------------- round 15: every colour opens a theme line that grows step by step
  // Gross (450 Wachstum earned): one body feature · Endform (800): a new shape · Legende (1750 + Entwicklungs-Pille): special colour, glow, 2nd shape and an ability
  // no patterns, no dots – only shapes, colours, glow and marks
  THEME.schnee = { skins: ['silber', 'kristall', 'opal'], auras: ['blau', 'sterne'], extra: [['under', 'mondsichel'], ['back', 'feenfluegel']] };
  MPOOL.schnee = ['eiskragen', 'rueckenzacken', 'kristallhorn', 'megamaehne'];
  ABP.schnee = ['schnee', 'kristall', 'sterne'];
  const WORD = { feuer: ['Glut', 'Flammen', 'Lava'], wasser: ['Tau', 'Wellen', 'Ozean'], nacht: ['Mond', 'Schatten', 'Galaxie'], wald: ['Moos', 'Wald', 'Urwald'], suess: ['Zucker', 'Feen', 'Zauber'], himmel: ['Wolken', 'Sternen', 'Himmels'], schnee: ['Frost', 'Eis', 'Polar'] };
  const THEME_TXT = { feuer: 'Feuer-Linie', wasser: 'Wasser-Linie', nacht: 'Nacht-Linie', wald: 'Wald-Linie', suess: 'Zauber-Linie', himmel: 'Himmels-Linie', schnee: 'Frost-Linie' };
  const LSKIN = { feuer: 'lava', wasser: 'kristall', nacht: 'galaxie', wald: 'smaragd', suess: 'rosegold', himmel: 'regenbogen', schnee: 'silber' };
  const LAURA = { feuer: 'flammen', wasser: 'blau', nacht: 'sterne', wald: 'gold', suess: 'herzen', himmel: 'regenbogen', schnee: 'blau' };
  const LMARK = { feuer: 'blitz', wasser: 'mondsichel', nacht: 'mondsichel', wald: null, suess: 'herzfleck', himmel: null, schnee: 'mondsichel' };
  const strongTh = (name) => /polar|schnee|weiss|silber|eis|schimmel|pastell|schwarz|nacht|schatten|dunkel|rappe|lila|rot|feuer|orange|gold|lava|rötlich|honig|blau|türkis|wild|rosa|rosé|pink/.test((name || '').toLowerCase());
  const themeOf = (k, name, i) => { const n = (name || '').toLowerCase();
    if (/silber|gold/.test(n)) return 'himmel';
    if (/polar|schnee|weiss|eis|schimmel|pastell/.test(n)) return 'schnee';
    if (/schwarz|nacht|schatten|dunkel|rappe|lila/.test(n)) return 'nacht';
    if (/rot|feuer|orange|lava|rötlich|honig/.test(n)) return 'feuer';
    if (/blau|türkis|wild/.test(n)) return 'wasser';
    if (/rosa|rosé|pink/.test(n)) return 'suess';
    if (/grün|moos|braun|natur|hell/.test(n) && i > 0) return 'wald';
    const order = [TH[k] || 'wald', 'nacht', 'schnee', 'feuer', 'suess', 'himmel', 'wasser', 'wald']; return order[i % order.length]; };
  const TRAITS = ['fell_tolle', 'fell_locke', 'fell_irokese', 'backen', 'stern', 'socken', 'glitzer'];
  const MARKS = ['blitz', 'herzfleck', 'mondsichel', 'augenfleck', 'halbgesicht'];
  const rng = (k) => { let x = [...k].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 11) + 1; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; };
  const tree = (k) => {
    const P4 = window.P4; const r = rng(k); const nm = (P4.LIST.find((q) => q[0] === k) || [])[1] || k; const sh = SHAPE[k] || 'B'; const bird = !!P4.BY[k][2].bird;
    const cols = (COL[k] || [['Natur', {}]]); const NAMES = new Set(); const usedTh = new Set();
    const TH_ORDER = ['feuer', 'nacht', 'schnee', 'wald', 'suess', 'himmel', 'wasser'];
    const pre = {}; cols.forEach(([cn], i) => { if (strongTh(cn) && !Object.values(pre).includes(themeOf(k, cn, i))) pre[i] = themeOf(k, cn, i); }); Object.values(pre).forEach((t) => usedTh.add(t));
    const uthI = (i, th) => (pre[i] ? pre[i] : uth(th));
    const uth = (th) => { if (!usedTh.has(th)) { usedTh.add(th); return th; } const o = TH_ORDER.filter((t) => !usedTh.has(t)); const t2 = o[Math.floor(r() * o.length)] || th; usedTh.add(t2); return t2; };
    const n = (st, kind, look, name, kids) => { let nn = name; let i = 2; while (NAMES.has(nn)) nn = `${name} ${['', '', 'II', 'III', 'IV'][i++] || i}`; NAMES.add(nn); return { st, kind, ...look, name: nn, kids: kids || [] }; };
    const usedT = new Set(); const pick = (arr) => { const f = arr.filter((v) => !usedT.has(v)); const src = f.length ? f : arr; const v = src[Math.floor(r() * src.length)]; usedT.add(v); return v; };
    const pool = (th) => [...new Set([...(bird ? ['tukan', 'haken', 'kakadu', 'faecher'] : []), ...MPOOL[th]])].filter((m) => !(bird && ['megamaehne', 'elfenohren', 'lockenpracht', 'glutmaehne', 'blattmaehne', 'pilzhut'].includes(m))); let wingUsed = false;
    // one line: Gross (feature) -> Endform (shape) -> Legende (colour, glow, 2nd shape, ability). depth = 1..3
    const line = (th, base, depth, wide) => {
      const W = WORD[th]; const tr = pick(TRAITS); const mk = r() < .5 ? pick(MARKS.filter((m) => m !== 'augenfleck' || th === 'nacht')) : null;
      const g = { ...base, deco: [...(base.deco || []), tr], under: mk ? [mk] : [] };
      const m1 = pick(pool(th)); const f = { ...g, morph: [m1] };
      let m2 = pick(pool(th).filter((m) => m !== m1)); if (WINGS[k] && !wingUsed && depth >= 3) { m2 = WINGS[k]; wingUsed = true; } const leg = { ...f, morph: [m1, m2], skin: LSKIN[th], aura: LAURA[th], ability: pick(ABP[th]), under: LMARK[th] ? [...new Set([...(g.under || []), LMARK[th]])] : g.under };
      const kids2 = []; if (depth >= 2) { const fNode = n('gross', 'form', f, `${W[1]}-${nm}`); if (depth >= 3) fNode.kids.push(n('gross', 'legende', leg, `${W[2]}-${nm}`)); else if (r() < .5) fNode.kids.push(n('gross', 'schein', { ...f, aura: LAURA[th] }, `Leucht-${W[1]}-${nm}`)); kids2.push(fNode); }
      const gNode = n('gross', 'merkmal', g, `${W[0]}-${nm}`, kids2);
      const out = [gNode];
      if (wide) { const sk = pick(THEME[th].skins); out.push(n('gross', 'farbe', { ...base, skin: sk, deco: [...(base.deco || []), pick(TRAITS)] }, `${P4.SKIN[sk][0]}${bird ? 'feder' : P4.BY[k][2].reptile || P4.BY[k][2].frog || P4.BY[k][2].insect ? 'haut' : 'fell'}-${nm}`)); }
      return out;
    };
    const ei = (kids) => n('ei', 'ei', {}, 'Ei', kids);
    if (sh === 'A') { const c = cols[0]; const th = uth(themeOf(k, c[0], 0)); const th2 = uth(themeOf(k, 'x', 2));
      return ei([n('baby', 'baby', {}, 'Baby', [n('jung', 'jung', { pal: c[1] }, 'Jung', [...line(th, { pal: c[1] }, 1, true), ...line(th2, { pal: c[1] }, 2, false)])])]); }
    if (sh === 'B') { const depths = [3, 2, 1].sort(() => r() - .5);
      return ei([n('baby', 'baby', {}, 'Baby', cols.map(([cn, p], i) => { const th = uthI(i, themeOf(k, cn, i)); return n('jung', 'jung', { pal: p, theme: th }, `${cn}`, line(th, { pal: p }, depths[i % 3], i === 0 && r() < .5)); }))]); }
    if (sh === 'C') { const depths = [3, 3, 2].sort(() => r() - .5);
      return ei([n('baby', 'baby', {}, 'Baby', cols.map(([cn, p], i) => { const th = uthI(i, themeOf(k, cn, i)); return n('jung', 'jung', { pal: p, theme: th }, `${cn}`, line(th, { pal: p }, depths[i % 3], i === 1)); }))]); }
    // D: the baby already picks its colour, the young one a feature, every line reaches a legend
    return ei(cols.map(([cn, p], i) => { const th = uthI(i, themeOf(k, cn, i)); const th2 = i < 2 ? uth(themeOf(k, 'x', i + 3)) : th; const t1 = pick(TRAITS), t2 = pick(TRAITS);
      return n('baby', 'baby', { pal: p, theme: th }, cn, [n('jung', 'jung', { pal: p, deco: [t1] }, `${cn} · ${P4.TRAIT_TXT[t1]}`, line(th, { pal: p, deco: [t1] }, 3, false)), ...(i < 2 ? [n('jung', 'jung', { pal: p, deco: [t2] }, `${cn} · ${P4.TRAIT_TXT[t2]}`, line(th2, { pal: p, deco: [t2] }, 3, false))] : [])]); }));
  };
  const feat = (nd) => { const P4 = window.P4; const f = [nd.skin && 'Spezialfarbe ' + P4.SKIN[nd.skin][0], nd.aura && P4.AURA_TXT[nd.aura], ...(nd.morph || []).map((m) => P4.MORPH_TXT[m]), ...(nd.under || []).map((u) => P4.UNDER_TXT[u]), ...(nd.back || []).map((b) => P4.BACK_TXT[b]), ...(nd.deco || []).map((d) => P4.TRAIT_TXT[d] || ({ hoernchen: 'Hörnchen', geweih: 'Geweih', einhornhorn: 'Horn' })[d])].filter(Boolean); if (nd.ability && window.FPMOTION && window.FPMOTION.ABIL[nd.ability]) f.unshift('⚡ Fähigkeit: ' + window.FPMOTION.ABIL[nd.ability].n); const fu = [...new Set(f)]; return fu.length ? `<span class="chips2">${fu.map((x) => `<i>${x}</i>`).join('')}</span>` : ''; };
  const look = (nd) => ({ pal: nd.pal, deco: nd.deco, under: nd.under, back: nd.back, skin: nd.skin, aura: nd.aura, morph: nd.morph, ability: nd.ability });
  const endForms = (k) => { const out = []; const walk = (nd) => { if (!nd.kids.length) out.push(nd); nd.kids.forEach(walk); }; walk(tree(k)); return out; };
  const leaves = (t) => t.kids.length ? t.kids.reduce((a, c) => a + leaves(c), 0) : 1;
  // compact left-to-right drawing: columns Ei | Baby | Jung | Gross, curved lines, the chosen path is highlighted
  const BADGE = { merkmal: ['⭐', 'gross'], farbe: ['💊', 'Spezialfarbe'], schein: ['✨', 'Schein'], form: ['🪽', 'neue Form'], legende: ['👑', 'Legende'] };
  const COLS = ['Ei', 'Baby', 'Jung', 'Gross', 'Endform', 'Legende'];
  const COLREQ = ['', '30 Wachstum', '150 Wachstum', '450 Wachstum', '800 Wachstum', '1750 Wachstum'];
  const render = (host, k, opt) => {
    const P4 = window.P4; const o = opt || {}; const NS = o.size || 44, GAP = o.gap || 6, CW = o.colW || 78; const t = tree(k);
    const L = leaves(t); const H = L * (NS + GAP); const nodes = []; const edges = []; let li = 0; let maxCol = 0;
    const lay = (nd, col, path) => { maxCol = Math.max(maxCol, col); let y; if (!nd.kids.length) { y = li * (NS + GAP) + NS / 2; li += 1; } else { const ys = nd.kids.map((c, i) => lay(c, col + 1, path.concat(i))); y = (ys[0] + ys[ys.length - 1]) / 2; nd.kids.forEach((c, i) => edges.push([col, y, col + 1, ys[i], path.concat(i), c.kind])); } nodes.push({ nd, col, y, path }); return y; };
    lay(t, 0, []);
    let sel = o.sel || (() => { const p = []; let c = t; while (c.kids.length) { p.push(c.kids.length - 1); c = c.kids[c.kids.length - 1]; } return p; })();
    const onPath = (p) => p.length <= sel.length && p.every((v, i) => sel[i] === v);
    const x = (col) => col * CW + NS / 2; const head = o.small ? 0 : 30;
    // fog: everything after column o.fog is a secret silhouette (the Weitblick-Kristall lifts it for 1 hour)
    const hid = (col) => o.fog != null && col > o.fog; const SIL = 'style="display:block;width:100%;height:100%;filter:brightness(0);opacity:.5"';
    const draw = () => {
      let leaf = t; sel.forEach((i) => { leaf = leaf.kids[i]; });
      const W = maxCol * CW + NS; const ecol = { form: '#B58CFF', legende: '#FFD34D', schein: '#7FE3FF', farbe: '#F5C542' };
      host.innerHTML = `<div class="tx"><div class="tg" style="width:${W}px;height:${H + head}px">${o.small ? '' : COLS.slice(0, maxCol + 1).map((c, i) => `<div class="th" style="left:${x(i) - CW / 2}px;width:${CW}px"><b>${c}</b><small>${COLREQ[i]}</small></div>`).join('')}
        <svg width="${W}" height="${H}" class="tl" style="top:${head}px">${edges.map(([c0, y0, c1, y1, p, kd]) => `<path d="M${x(c0) + NS / 2 - 2} ${y0} C${x(c0) + CW / 2 + 6} ${y0} ${x(c1) - CW / 2 - 6} ${y1} ${x(c1) - NS / 2 + 2} ${y1}" fill="none" stroke="${onPath(p) ? '#69C350' : ecol[kd] ? ecol[kd] + '55' : '#39414f'}" stroke-width="${onPath(p) ? 2.6 : 1.6}" ${kd === 'form' || kd === 'legende' ? 'stroke-dasharray="4 3"' : ''}/>`).join('')}</svg>
        ${nodes.map(({ nd, col, y, path }) => `<button class="tn k-${hid(col) ? 'fog' : nd.kind} ${onPath(path) ? 'on' : ''}" data-p="${path.join('.')}" style="left:${x(col) - NS / 2}px;top:${y - NS / 2 + head}px;width:${NS}px;height:${NS}px" title="${hid(col) ? '??? – noch geheim' : nd.name + ' – ' + (REQ[nd.kind] || '')}">${nd.st === 'ei' ? P4.egg(k) : `<span ${hid(col) ? SIL : 'style="display:block;width:100%;height:100%"'}>${P4.svg(k, nd.st, 'froh', { noShadow: 1, ...(hid(col) ? {} : look(nd)), aura: !hid(col) && (nd.kind === 'schein' || nd.kind === 'legende') ? nd.aura : undefined })}</span>`}${BADGE[nd.kind] && !o.small && !hid(col) ? `<span class="bdg">${BADGE[nd.kind][0]}</span>` : ''}</button>`).join('')}</div>
        ${!o.small && o.fog != null && sel.length > o.fog ? `<div class="tf"><span ${SIL}>${P4.svg(k, 'gross', 'froh', { noShadow: 1 })}</span><small><b>??? – noch geheim</b><span class="rq">Mit dem <b>Weitblick-Kristall</b> siehst du 1 Stunde lang den ganzen Baum.</span></small></div>` : o.small ? `<div class="tf">${P4.svg(k, 'gross', 'freut', { noShadow: 1, ...look(leaf) })}</div>` : `<div class="tf">${P4.svg(k, 'gross', 'freut', { noShadow: 1, ...look(leaf) })}<small><b>${leaf.name}</b>${BADGE[leaf.kind] ? `<span class="kb k-${leaf.kind}">${BADGE[leaf.kind][0]} ${BADGE[leaf.kind][1]}</span>` : ''}${feat(leaf)}<span class="rq">So bekommt man es: <b>${REQ[leaf.kind] || ''}</b></span></small></div>`}</div>`;
      host.querySelectorAll('.tn').forEach((b) => b.addEventListener('click', () => { const p = b.dataset.p ? b.dataset.p.split('.').map(Number) : []; let c = t; p.forEach((i) => { c = c.kids[i]; }); while (c.kids.length) { p.push(0); c = c.kids[0]; } sel = p; draw(); }));
    };
    draw();
  };
  window.FPTREE = { THEME_TXT, WORD, REQ, BADGE, feat, tree, render, leaves, look, endForms, COL, SHAPE, SHAPE_TXT, FABEL, THEME, TH };
})();
