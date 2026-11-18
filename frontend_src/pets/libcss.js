// shared styles of the evolution tree and the wheel (used in the Tierchen popups)
window.FPLIBCSS = `.wb{position:absolute;right:0;top:0;width:36px;height:36px;border-radius:50%;background:#262a31;border:2px solid #353b46;display:flex;align-items:center;justify-content:center}
.wb svg.mw{width:26px;height:26px}.wb.grey svg.mw{filter:grayscale(1) brightness(.75)}
.wb .pr{position:absolute;inset:-5px;width:calc(100% + 10px);height:calc(100% + 10px)}
.wb.glow{border-color:#FFD34D;box-shadow:0 0 0 3px rgba(255,211,77,.3),0 0 16px rgba(255,211,77,.7);animation:wglow 1.4s ease-in-out infinite}
.wb.glow svg.mw{animation:wspin 5s linear infinite}
.wb .dots{position:absolute;inset:-7px;width:calc(100% + 14px);height:calc(100% + 14px)}
.wb .ok{position:absolute;right:-5px;bottom:-5px;width:16px;height:16px;border-radius:50%;background:#3FA66B;border:2px solid #1f2228;display:flex;align-items:center;justify-content:center}
.wb .ok::after{content:"";width:3px;height:6px;border:solid #fff;border-width:0 1.6px 1.6px 0;transform:rotate(45deg) translate(-.5px,-.5px)}
@keyframes wglow{50%{box-shadow:0 0 0 5px rgba(255,211,77,.12),0 0 24px rgba(255,211,77,.85)}}@keyframes wspin{to{transform:rotate(360deg)}}
.be{animation:be2 .6s steps(1) infinite}.bo{animation:bo2 .6s steps(1) infinite}@keyframes be2{0%{opacity:1}50%{opacity:.2}}@keyframes bo2{0%{opacity:.2}50%{opacity:1}}
.wheelbox{margin:0 14px 10px;background:#0f1115;border-radius:12px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px}
.wwrap{position:relative;width:320px;height:320px;max-width:100%}
.wwrap svg.w{width:100%;height:100%}
.wwrap .ptr{position:absolute;left:50%;top:-10px;width:30px;height:40px;margin-left:-15px;transform-origin:50% 25%;z-index:2}
.spin{font:800 15px system-ui;border:0;border-radius:22px;padding:11px 26px;background:#F5C542;color:#141414;cursor:pointer;min-height:44px}
.tw2,.tw3,.tw4,.tw5{overflow-x:auto}.tw2{margin:0 14px 12px;background:radial-gradient(ellipse at 50% 120%,#2b4a2a,#0f1115 70%);border-radius:14px;padding:10px}
.tx{display:flex;align-items:center;gap:14px}.tg{position:relative;flex:none}.tg svg.tl{position:absolute;left:0;top:0}
.tn{position:absolute;padding:0;border-radius:10px;border:2px solid #2a3140;background:#151a20;cursor:pointer;overflow:visible}.tn svg{width:100%;height:100%;overflow:visible}.tn.on{border-color:#69C350;background:#1c2a1d}
.tf{display:flex;flex-direction:column;align-items:center;min-width:110px}.tf svg{width:110px;height:110px;overflow:visible}.tf small{font-size:11.5px;color:#cfd6df;text-align:center;line-height:1.3}
.spin:disabled{background:#3a3f4a;color:#9aa3b2;cursor:default;font-size:13px}
.wwrap.sm{width:170px;height:170px}.hatch{text-align:center}.hatch .egg svg{width:110px;height:110px;overflow:visible}.hatch small{display:block;color:#FFE27A;font-weight:700}
.tf b{color:#FFE27A}.tf{max-width:180px}.tf svg{width:130px;height:130px}
.th{position:absolute;top:0;text-align:center}.th b{display:block;font-size:11.5px}.th small{display:block;font-size:10px;color:#FFE27A}
.tn .bdg{position:absolute;right:-7px;top:-7px;font-size:12px;line-height:1}.tn.k-farbe{border-color:#F5C542}.tn.k-form{border-color:#B58CFF;border-style:dashed}.tn.k-schein{border-color:#7FE3FF;box-shadow:0 0 8px #7FE3FF}.tn.k-legende{border-color:transparent;background:linear-gradient(#151a20,#151a20) padding-box,conic-gradient(#FF5A5A,#FFD34D,#8CE07A,#7FD3FF,#B58CFF,#FF5A5A) border-box}.tn.on{box-shadow:0 0 0 2px #69C350}
.kb{display:inline-block;margin:4px 0 2px;font-size:11px;font-weight:800;padding:2px 8px;border-radius:9px;background:#252932}.kb.k-farbe{color:#F5C542}.kb.k-form{color:#CDB8FF}.kb.k-schein{color:#7FE3FF}.kb.k-legende{color:#FFE27A}
.rq{display:block;margin-top:5px;font-size:11px;color:#cfd6df}.rq b{color:#9fe39a}`;
