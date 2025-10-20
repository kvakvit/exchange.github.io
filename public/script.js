const state = { data:null, active:'EUR' };

function qs(s){ return document.querySelector(s); }
function qsa(s){ return Array.from(document.querySelectorAll(s)); }
const fmt = (n)=> (Math.round(n*10000)/10000).toFixed(4);

async function load(){
  const res = await fetch('./rates.json', {cache:'no-cache'});
  const data = await res.json();
  state.data = data;
  renderAll();
  showToast('Podaci učitani');
}

function renderAll(){
  const d = state.data;
  qs('#updated').textContent = 'Ažurirano: ' + new Date(d.g).toLocaleString();

  // chips + select
  const chips = qs('#chips'); chips.innerHTML = '';
  const sel = qs('#currency'); sel.innerHTML='';
  const allCodes = d.rates.map(r=>r.code);
  const order = ['EUR','USD','CHF', ...allCodes.filter(c=>!['EUR','USD','CHF'].includes(c))];
  order.forEach(code=>{
    if(!allCodes.includes(code)) return;
    const b = document.createElement('button');
    b.textContent = code; b.className = 'chip' + (state.active===code?' active':'');
    b.onclick = ()=>{ state.active = code; renderActive(); };
    chips.appendChild(b);
    const o = document.createElement('option'); o.value=code; o.textContent=code; sel.appendChild(o);
  });
  sel.value = state.active;
  renderActive();

  // table
  renderTable(d.rates);
}

function renderActive(){
  const d = state.data;
  qs('#currency').value = state.active;
  // highlight row in table
  qsa('#rates tbody tr').forEach(tr=>{ tr.classList.toggle('hl', tr.dataset.code===state.active); });
}

function renderTable(rows){
  const tbody = qs('#rates tbody'); tbody.innerHTML='';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.dataset.code = r.code;
    const td1 = document.createElement('td'); td1.textContent = r.code; tr.appendChild(td1);
    const td2 = document.createElement('td'); td2.textContent = fmt(r.mid); tr.appendChild(td2);
    tbody.appendChild(tr);
  });

  // sorting
  qsa('#rates thead th').forEach(th=>{
    th.onclick = () => {
      const key = th.dataset.key;
      const table = qs('#rates');
      const dir = table.dataset.dir === 'asc' ? 'desc' : 'asc';
      table.dataset.sort = key; table.dataset.dir = dir;
      const sorted = rows.slice().sort((a,b)=>{
        let va=a[key], vb=b[key];
        if(key==='code'){ va=String(va); vb=String(vb); return dir==='asc'?va.localeCompare(vb):vb.localeCompare(va); }
        va=Number(va); vb=Number(vb); return dir==='asc'?va-vb:vb-va;
      });
      renderTable(sorted);
    };
  });

  // search
  const search = qs('#search');
  search.oninput = () => {
    const q = search.value.trim().toUpperCase();
    const filtered = rows.filter(r => r.code.includes(q));
    renderTable(filtered);
  };
}

function attachConverter(){
  const amount = qs('#amount');
  const sel = qs('#currency');
  const result = qs('#result');
  const rateOf = (code)=> (state.data.rates.find(x=>x.code===code)||{}).mid || null;
  qs('#btn-to-rsd').onclick = ()=>{
    const amt = parseFloat(amount.value||'0'); const c = sel.value; const r = rateOf(c);
    if(!r){ result.textContent='Nema podataka'; return; }
    result.textContent = `${fmt(amt*r)} RSD po kursu ${fmt(r)} (${c})`;
  };
  qs('#btn-from-rsd').onclick = ()=>{
    const amt = parseFloat(amount.value||'0'); const c = sel.value; const r = rateOf(c);
    if(!r){ result.textContent='Nema podataka'; return; }
    result.textContent = `${fmt(amt/r)} ${c} po kursu ${fmt(r)} (RSD→${c})`;
  };
  qs('#btn-copy').onclick = async ()=>{
    try{ await navigator.clipboard.writeText(result.textContent); showToast('Kopirano'); }catch{}
  };
  qsa('.quick button').forEach(b=>{
    b.onclick = ()=>{ amount.value = b.dataset.q; };
  });
  sel.onchange = ()=>{ state.active = sel.value; renderActive(); };
}

function themeInit(){
  const root = document.documentElement;
  qs('#toggle-theme').onclick = ()=>{
    const isDark = root.classList.toggle('theme-dark');
    if(!isDark) root.classList.add('theme-light'); else root.classList.remove('theme-light');
    localStorage.setItem('theme', isDark?'dark':'light');
  };
  const saved = localStorage.getItem('theme');
  if(saved==='light'){ root.classList.remove('theme-dark'); root.classList.add('theme-light'); }
}

function shareInit(){
  const a = qs('#share-link');
  a.onclick = (e)=>{
    e.preventDefault();
    const url = location.href;
    if(navigator.share){ navigator.share({title:document.title, url}).catch(()=>{}); }
    else { navigator.clipboard.writeText(url).then(()=>showToast('Link kopiran')); }
  };
}

function showToast(text){
  const t = qs('#toast');
  t.textContent = text; t.hidden = false;
  clearTimeout(showToast._id); showToast._id = setTimeout(()=> t.hidden = true, 1800);
}

window.addEventListener('DOMContentLoaded', ()=>{
  themeInit(); shareInit(); attachConverter(); load();
});
