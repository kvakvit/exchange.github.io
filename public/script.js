const state = { data:null, active:'EUR' };
const Q = (s)=>document.querySelector(s);
const QA = (s)=>Array.from(document.querySelectorAll(s));
const fmt = (n)=> (Math.round(n*10000)/10000).toFixed(4);
function rateOf(code){ return (state.data.rates.find(r=>r.code===code)||{}).mid||null; }

async function load(){
  const res = await fetch('./rates.json', {cache:'no-cache'});
  const data = await res.json();
  state.data = data;
  buildChips();
  fillSelect();
  renderBig();
  renderTable();
  bindSearch();
  Q('#stamp').textContent = 'Podaci ažurirani ' + new Date(data.g).toLocaleString();
}

function buildChips(){
  const wrap = Q('#chips'); wrap.innerHTML='';
  const order = ['EUR','USD','CHF', ...state.data.rates.map(r=>r.code).filter(c=>!['EUR','USD','CHF'].includes(c))];
  const uniq = [...new Set(order)];
  uniq.forEach(code=>{
    const b = document.createElement('button');
    b.textContent = code; b.className = state.active===code?'active':'';
    b.onclick = ()=>{ state.active=code; renderBig(); highlightRow(); };
    wrap.appendChild(b);
  });
}

function fillSelect(){
  const s = Q('#currency'); s.innerHTML='';
  state.data.rates.forEach(r=>{ const o=document.createElement('option'); o.value=r.code; o.textContent=r.code; s.appendChild(o); });
  s.value = state.active;
  s.onchange = ()=>{ state.active=s.value; renderBig(); highlightRow(); };
}

function renderBig(){
  const r = rateOf(state.active);
  Q('#big-rate').textContent = r? fmt(r) : '—';
}

function renderTable(){
  const tbody = Q('#rates tbody'); tbody.innerHTML='';
  const rows = state.data.rates.slice().sort((a,b)=>a.code.localeCompare(b.code));
  rows.forEach(r=>{
    const tr = document.createElement('tr'); tr.dataset.code = r.code;
    const flag = flagFor(r.code);
    td(tr, `${flag} ${r.code}`);
    td(tr, '—','right'); // kupovni (za banke u budućnosti)
    td(tr, fmt(r.mid),'right'); // srednji NBS
    td(tr, '—','right'); // prodajni
    tbody.appendChild(tr);
  });
  QA('#rates thead th').forEach(th=> th.onclick = ()=> sortBy(th.dataset.key));
  highlightRow();
}

function td(tr, text, cls){ const c=document.createElement('td'); if(cls) c.className=cls; c.textContent=text; tr.appendChild(c); return c; }

function sortBy(key){
  const table = Q('#rates');
  const dir = table.dataset.dir==='asc'?'desc':'asc';
  table.dataset.dir = dir; table.dataset.sort = key;
  const rows = Array.from(Q('#rates tbody').rows);
  const idx = {code:0,buy:1,mid:2,sell:3}[key];
  rows.sort((a,b)=>{
    let va=a.cells[idx].textContent.trim(), vb=b.cells[idx].textContent.trim();
    if(idx>0){ va=parseFloat(va)||0; vb=parseFloat(vb)||0; return dir==='asc'?va-vb:vb-va; }
    return dir==='asc'?va.localeCompare(vb):vb.localeCompare(va);
  });
  const tb = Q('#rates tbody'); rows.forEach(r=>tb.appendChild(r));
}

function bindSearch(){
  const input = Q('#search');
  input.oninput = ()=>{
    const q = input.value.trim().toUpperCase();
    QA('#rates tbody tr').forEach(tr=>{
      tr.hidden = !tr.dataset.code.includes(q);
    });
  };
}

function highlightRow(){
  QA('#rates tbody tr').forEach(tr=> tr.classList.toggle('hl', tr.dataset.code===state.active));
  Q('#currency').value = state.active;
}

function attachConverter(){
  const amount = Q('#amount'), sel = Q('#currency'), res = Q('#result');
  Q('#to-rsd').onclick = ()=>{
    const r = rateOf(sel.value); const amt = parseFloat(amount.value||'0');
    if(!r) return res.textContent='Nema podataka';
    res.textContent = `${fmt(amt*r)} RSD po kursu ${fmt(r)} (${sel.value})`;
  };
  Q('#from-rsd').onclick = ()=>{
    const r = rateOf(sel.value); const amt = parseFloat(amount.value||'0');
    if(!r) return res.textContent='Nema podataka';
    res.textContent = `${fmt(amt/r)} ${sel.value} po kursu ${fmt(r)} (RSD→${sel.value})`;
  };
  Q('#copy').onclick = async ()=>{
    try{ await navigator.clipboard.writeText(res.textContent); toast('Kopirano'); }catch{}
  };
  Q('#quick').addEventListener('click', e=>{
    if(e.target.tagName==='BUTTON'){ amount.value = e.target.dataset.q; }
  });
}

function themeInit(){
  const btn = Q('#toggle-theme');
  const set = (mode)=>{
    const root = document.documentElement;
    if(mode==='light'){ root.classList.remove('theme-dark'); root.classList.add('theme-light'); btn.textContent='Dark'; }
    else { root.classList.remove('theme-light'); root.classList.add('theme-dark'); btn.textContent='Light'; }
    localStorage.setItem('theme', mode);
  };
  btn.onclick = ()=> set(document.documentElement.classList.contains('theme-dark')?'light':'dark');
  set(localStorage.getItem('theme')||'dark');
}

function shareInit(){
  const btn = Q('#share');
  btn.onclick = async ()=>{
    const url = location.href;
    if(navigator.share){ try{ await navigator.share({title:document.title, url}); }catch(e){} }
    else { await navigator.clipboard.writeText(url); toast('Link kopiran'); }
  };
}

function toast(text){
  const t = Q('#toast'); t.textContent=text; t.hidden=false;
  clearTimeout(toast._id); toast._id = setTimeout(()=> t.hidden=true, 1800);
}

// simple flag via emoji by currency (approximate)
function flagFor(code){
  const m = { EUR:'🇪🇺', USD:'🇺🇸', CHF:'🇨🇭', GBP:'🇬🇧', AUD:'🇦🇺', CAD:'🇨🇦' };
  return m[code] || '';
}

window.addEventListener('DOMContentLoaded', ()=>{
  themeInit(); shareInit(); attachConverter(); load();
});
