(async function(){
  try {
    const res = await fetch('./rates.json', { cache: 'no-cache' });
    const data = await res.json();

    const fmt = (n) => (Math.round(n * 10000) / 10000).toFixed(4);
    const updated = document.getElementById('updated');
    updated.textContent = 'Ažurirano: ' + new Date(data.g).toLocaleString();

    // Tabela
    const tbody = document.querySelector('#rates tbody');
    const important = ['EUR','USD','CHF'];
    const rows = data.rates
      .filter(x => important.includes(x.code))
      .sort((a,b)=> important.indexOf(a.code) - important.indexOf(b.code));
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td'); td1.textContent = row.code; tr.appendChild(td1);
      const td2 = document.createElement('td'); td2.textContent = fmt(row.mid); tr.appendChild(td2);
      tbody.appendChild(tr);
    });

    // Konverter
    const sel = document.getElementById('currency');
    important.forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o); });
    const amountEl = document.getElementById('amount');
    const resultEl = document.getElementById('result');
    const rateOf = (code) => (data.rates.find(x=>x.code===code)||{}).mid || null;

    document.getElementById('btn-to-rsd').onclick = () => {
      const amt = parseFloat(amountEl.value||'0'); const cur = sel.value; const rate = rateOf(cur);
      if(!rate) { resultEl.textContent='Nema podataka'; return; }
      resultEl.textContent = `${fmt(amt*rate)} RSD po kursu ${fmt(rate)} (${cur})`;
    };
    document.getElementById('btn-from-rsd').onclick = () => {
      const amt = parseFloat(amountEl.value||'0'); const cur = sel.value; const rate = rateOf(cur);
      if(!rate) { resultEl.textContent='Nema podataka'; return; }
      resultEl.textContent = `${fmt(amt/rate)} ${cur} po kursu ${fmt(rate)} (RSD→${cur})`;
    };
  } catch(err) {
    console.error(err);
    document.getElementById('updated').textContent = 'Greška pri učitavanju podataka';
  }
})();