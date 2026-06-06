/* ═══════════════════════════════════════
   Spendly v2 — app.js
═══════════════════════════════════════ */

// ─── SVG Icon library (category icons) ───────────
const CAT_ICONS = {
  food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  transport: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  shopping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  entertainment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/></svg>`,
  health: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  utilities: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  education: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  travel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-2 0-4 1-4 1L11 8.2"/><path d="m5 3 4 4"/><path d="m9 9-3-1"/><path d="M7 12.8l-1.3 3.3-3.3 1.3 3.3 1.3 1.3 3.3 1.3-3.3 3.3-1.3-3.3-1.3z"/></svg>`,
  savings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.8 1.7-1.6 2-3h1v-5h-1z"/><path d="M2 9v1c0 1.1.4 2 1 2.5"/><path d="M16 11h.01"/></svg>`,
  other: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
};

const PALETTE = [
  '#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b'
];

const ICON_DEFAULT_COLORS = {
  food:'#f97316', transport:'#3b82f6', shopping:'#ec4899',
  entertainment:'#8b5cf6', health:'#10b981', utilities:'#f59e0b',
  education:'#6366f1', travel:'#14b8a6', savings:'#22c55e', other:'#64748b'
};

// ─── State ───────────────────────────────
const state = {
  month: new Date().getMonth() + 1,
  year:  new Date().getFullYear(),
  categories: [],
  expenses: [],
  charts: {},
  selectedColor: PALETTE[0],
};

const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── API ──────────────────────────────────
const api = {
  get:    url    => fetch(url).then(r=>r.json()),
  post:   (u,d)  => fetch(u,{method:'POST',  headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()),
  put:    (u,d)  => fetch(u,{method:'PUT',   headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()),
  delete: u      => fetch(u,{method:'DELETE'}).then(r=>r.json()),
};

// ─── Toast ────────────────────────────────
function toast(msg, type='success') {
  const el = document.getElementById('toast');
  const icon = type === 'success'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" width="16" height="16"><path d="M20 6 9 17l-5-5"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" width="16" height="16"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
  el.innerHTML = icon + msg;
  el.className = `toast ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 2800);
}

// ─── Month navigation ────────────────────
function updateMonthLabel() {
  document.getElementById('currentMonthLabel').textContent = `${MN[state.month-1].slice(0,3)} ${state.year}`;
  document.getElementById('pageMonthSub').textContent = `${MN[state.month-1]} ${state.year}`;
}

$('prevMonth').addEventListener('click', () => {
  state.month--; if (state.month < 1) { state.month=12; state.year--; }
  updateMonthLabel(); refreshCurrent();
});
$('nextMonth').addEventListener('click', () => {
  state.month++; if (state.month > 12) { state.month=1; state.year++; }
  updateMonthLabel(); refreshCurrent();
});

// ─── Navigation ──────────────────────────
function $(id) { return document.getElementById(id); }

const PAGE_TITLES = { dashboard:'Dashboard', expenses:'Expenses', analytics:'Analytics', categories:'Categories' };

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  $('pageTitle').textContent = PAGE_TITLES[page];
  closeSidebar();
  if (page==='dashboard')  refreshDashboard();
  if (page==='expenses')   refreshExpenses();
  if (page==='analytics')  refreshAnalytics();
  if (page==='categories') refreshCategories();
}

function refreshCurrent() {
  const active = document.querySelector('.page.active');
  if (active) navigate(active.id.replace('page-',''));
}

document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', ()=>navigate(b.dataset.page)));
document.querySelectorAll('.text-btn[data-page]').forEach(b => b.addEventListener('click', ()=>navigate(b.dataset.page)));

// Sidebar mobile
function openSidebar()  { $('sidebar').classList.add('open'); $('overlayBg').classList.remove('hidden'); }
function closeSidebar() { $('sidebar').classList.remove('open'); $('overlayBg').classList.add('hidden'); }
$('menuToggle').addEventListener('click', openSidebar);
$('sidebarClose').addEventListener('click', closeSidebar);
$('overlayBg').addEventListener('click', closeSidebar);

// ─── Data ────────────────────────────────
async function loadCategories() {
  state.categories = await api.get('/api/categories');
  fillCategorySelects();
}
async function loadExpenses() {
  state.expenses = await api.get(`/api/expenses?month=${state.month}&year=${state.year}`);
}

function fillCategorySelects() {
  // Filter select
  const sel = $('filterCategory');
  const prev = sel.value;
  sel.innerHTML = '<option value="">All Categories</option>';
  state.categories.forEach(c => {
    const o = new Option(`${c.name}`, c.id);
    sel.appendChild(o);
  });
  if (prev) sel.value = prev;
}

// ─── Dashboard ───────────────────────────
async function refreshDashboard() {
  await Promise.all([loadCategories(), loadExpenses()]);
  const [summary, daily] = await Promise.all([
    api.get(`/api/analytics/summary?month=${state.month}&year=${state.year}`),
    api.get(`/api/analytics/daily?month=${state.month}&year=${state.year}`)
  ]);

  const total = summary.total;
  const count = state.expenses.length;
  const days  = new Date(state.year, state.month, 0).getDate();
  const avg   = total / days;
  const top   = summary.categories[0];

  // Budget total for ring calc
  const totalBudget = state.categories.reduce((s,c) => s+c.budget, 0);
  const pct = totalBudget ? Math.min(total/totalBudget*100, 100) : 50;

  $('statTotal').textContent = fmt(total);
  $('statMonth').textContent = `${MN[state.month-1]} ${state.year}`;
  $('statCount').textContent = count;
  $('statAvg').textContent   = fmt(avg);
  $('statTop').textContent   = top ? top.name : '—';
  $('statTopAmt').textContent = top ? fmt(top.total) : '₹0';
  $('kpiBarFill').style.width = pct + '%';
  $('dailySub').textContent = `${MN[state.month-1]} ${state.year}`;

  renderDailyChart(daily);
  renderDonutChart(summary.categories);
  renderTxnList('recentList', state.expenses.slice(0,10), false);
}

// ─── Expenses ────────────────────────────
async function refreshExpenses() {
  await Promise.all([loadCategories(), loadExpenses()]);
  filterAndRender();
}

function filterAndRender() {
  const q   = $('searchInput').value.toLowerCase();
  const cat = $('filterCategory').value;
  const list = state.expenses.filter(e =>
    (!q   || e.title.toLowerCase().includes(q) || (e.note||'').toLowerCase().includes(q)) &&
    (!cat || String(e.category_id) === cat)
  );
  renderTxnList('expensesList', list, true);
  $('noExpenses').classList.toggle('hidden', list.length > 0);
}

$('searchInput').addEventListener('input', filterAndRender);
$('filterCategory').addEventListener('change', filterAndRender);

// ─── Analytics ───────────────────────────
async function refreshAnalytics() {
  await loadCategories();
  const [summary, trend] = await Promise.all([
    api.get(`/api/analytics/summary?month=${state.month}&year=${state.year}`),
    api.get(`/api/analytics/trend?year=${state.year}`)
  ]);
  renderTrendChart(trend);
  renderBudgetBars(summary.categories);
  renderCatTable(summary.categories, summary.total);
}

// ─── Categories ──────────────────────────
async function refreshCategories() {
  await loadCategories();
  const [summary] = await Promise.all([
    api.get(`/api/analytics/summary?month=${state.month}&year=${state.year}`)
  ]);
  const spentMap = {};
  summary.categories.forEach(c => spentMap[c.id] = c.total);

  const grid = $('categoriesGrid');
  grid.innerHTML = '';
  state.categories.forEach(c => {
    const spent = spentMap[c.id] || 0;
    const pct   = c.budget ? Math.min(spent/c.budget*100, 100) : 0;
    const fill  = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : c.color;
    const card  = document.createElement('div');
    card.className = 'cat-card';
    card.innerHTML = `
      <div class="cc-stripe" style="background:${c.color}"></div>
      <div class="cc-top">
        <div class="cc-icon" style="background:${c.color}18">
          <svg viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="1.8">${CAT_ICONS[c.icon]||CAT_ICONS.other}</svg>
        </div>
        <div class="cc-menu">
          <button class="cc-btn" data-id="${c.id}" data-act="edit" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="cc-btn del" data-id="${c.id}" data-act="del" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <div class="cc-name">${c.name}</div>
      <div class="cc-budget">${c.budget ? `Budget: ${fmt(c.budget)}/mo · Spent: ${fmt(spent)}` : 'No budget set'}</div>
      ${c.budget ? `<div class="cc-spent-bar"><div class="cc-spent-fill" style="width:${pct}%;background:${fill}"></div></div>` : ''}
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.cc-btn').forEach(b => {
    b.addEventListener('click', () => {
      const id = parseInt(b.dataset.id);
      if (b.dataset.act === 'edit') openCategoryModal(id);
      else deleteCategory(id);
    });
  });
}

// ─── Render: Transaction list ────────────
function renderTxnList(containerId, expenses, showActions) {
  const el = $(containerId);
  if (!expenses.length) {
    el.innerHTML = '<div class="empty-state" style="padding:32px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="36" height="36" opacity=".25"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><p style="margin-top:8px">No transactions yet</p></div>';
    return;
  }

  // Group by date
  const groups = {};
  expenses.forEach(e => { if (!groups[e.date]) groups[e.date]=[]; groups[e.date].push(e); });

  el.innerHTML = '';
  Object.entries(groups).forEach(([d, items]) => {
    const sep = document.createElement('div');
    sep.className = 'txn-date-sep';
    sep.textContent = fmtDate(d);
    el.appendChild(sep);

    items.forEach(e => {
      const cat   = state.categories.find(c=>c.id===e.category_id) || {};
      const icon  = CAT_ICONS[cat.icon || 'other'] || CAT_ICONS.other;
      const color = cat.color || '#6366f1';

      const row = document.createElement('div');
      row.className = 'txn-item';
      row.innerHTML = `
        <div class="txn-icon" style="background:${color}18">
          <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8">${icon}</svg>
        </div>
        <div class="txn-body">
          <div class="txn-title">${e.title}</div>
          <div class="txn-meta">${e.category}${e.note ? ' · ' + e.note : ''}</div>
        </div>
        <div class="txn-right">
          <span class="txn-amt">${fmt(e.amount)}</span>
          ${showActions ? `
          <div class="txn-actions">
            <button class="act-btn" data-id="${e.id}" data-act="edit" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="act-btn del" data-id="${e.id}" data-act="del" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>` : ''}
        </div>
      `;
      el.appendChild(row);
    });
  });

  if (showActions) {
    el.querySelectorAll('.act-btn').forEach(b => {
      b.addEventListener('click', ev => {
        ev.stopPropagation();
        const id = parseInt(b.dataset.id);
        b.dataset.act === 'edit' ? openExpenseModal(id) : deleteExpense(id);
      });
    });
  }
}

// ─── Render: Budget bars ──────────────────
function renderBudgetBars(cats) {
  const el = $('budgetBars');
  const withBudget = cats.filter(c => c.budget > 0);
  if (!withBudget.length) {
    el.innerHTML = '<div class="empty-state" style="padding:32px"><p>Set budgets in Categories to track here</p></div>';
    return;
  }
  el.innerHTML = withBudget.map(c => {
    const pct  = Math.min(c.total/c.budget*100, 100);
    const fill = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : c.color;
    return `
      <div class="b-row">
        <div class="b-hd">
          <span class="b-cat"><span class="b-cat-dot" style="background:${c.color}"></span>${c.name}</span>
          <span class="b-amts"><strong>${fmt(c.total)}</strong> / ${fmt(c.budget)}</span>
        </div>
        <div class="b-track"><div class="b-fill" style="width:${pct}%;background:${fill}"></div></div>
      </div>`;
  }).join('');
}

// ─── Render: Category table ───────────────
function renderCatTable(cats, total) {
  const el = $('categoryTable');
  el.innerHTML = `
    <div class="cb-header">
      <div></div><div>Category</div><div>Spent</div><div>% Share</div><div>Bar</div>
    </div>
    ${cats.map(c => `
    <div class="cb-row">
      <div class="cb-icon" style="background:${c.color}18">
        <svg viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="1.8">${CAT_ICONS[c.icon]||CAT_ICONS.other}</svg>
      </div>
      <div class="cb-name">${c.name}</div>
      <div class="cb-amt">${fmt(c.total)}</div>
      <div class="cb-pct">${c.pct}%</div>
      <div class="cb-bar"><div class="cb-fill" style="width:${c.pct}%;background:${c.color}"></div></div>
    </div>`).join('')}
  `;
}

// ─── Charts ──────────────────────────────
const gCfg = {
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1d27',
      borderColor: 'rgba(255,255,255,.1)', borderWidth: 1,
      titleColor: '#f0f1f5', bodyColor: '#8891a8',
      padding: 10, cornerRadius: 8,
      callbacks: { label: ctx => ' ₹' + ctx.raw.toLocaleString('en-IN') }
    }
  }
};

function renderDailyChart(data) {
  const ctx = $('dailyChart').getContext('2d');
  if (state.charts.daily) state.charts.daily.destroy();
  const vals   = data.map(d=>d.total);
  const maxVal = Math.max(...vals, 1);
  state.charts.daily = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d=>d.day),
      datasets: [{
        data: vals,
        backgroundColor: ctx2 => {
          const v = vals[ctx2.dataIndex];
          return v === maxVal ? '#6366f1' : 'rgba(99,102,241,.2)';
        },
        hoverBackgroundColor: '#818cf8',
        borderRadius: 5, borderSkipped: false,
        borderWidth: 0
      }]
    },
    options: {
      ...gCfg, responsive: true, maintainAspectRatio: true,
      scales: {
        x: { grid:{display:false}, border:{display:false}, ticks:{color:'#4a5068',font:{size:10,family:"'Outfit'"}} },
        y: { grid:{color:'rgba(255,255,255,.04)'}, border:{display:false},
          ticks:{color:'#4a5068',font:{size:10,family:"'Outfit'"},
            callback: v => v>=1000?'₹'+(v/1000).toFixed(0)+'k':'₹'+v} }
      }
    }
  });
}

function renderDonutChart(cats) {
  const ctx = $('donutChart').getContext('2d');
  if (state.charts.donut) state.charts.donut.destroy();
  const top = cats.slice(0,7);

  if (!top.length) {
    $('donutLabel').querySelector('.dl-pct').textContent = '₹0';
    $('donutLabel').querySelector('.dl-name').textContent = 'No data';
    $('donutLegend').innerHTML = '';
    return;
  }

  state.charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: top.map(c=>c.name),
      datasets: [{
        data: top.map(c=>c.total),
        backgroundColor: top.map(c=>c.color),
        borderColor: '#13151c', borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      ...gCfg, cutout: '72%', responsive: false,
      plugins: {
        ...gCfg.plugins,
        tooltip: {
          ...gCfg.plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')} (${top[ctx.dataIndex].pct}%)`
          }
        }
      },
      onHover: (e, els) => {
        if (els.length) {
          const c = top[els[0].index];
          $('donutLabel').querySelector('.dl-pct').textContent = c.pct + '%';
          $('donutLabel').querySelector('.dl-name').textContent = c.name;
        } else {
          const total = top.reduce((s,c)=>s+c.total,0);
          $('donutLabel').querySelector('.dl-pct').textContent = fmt(total);
          $('donutLabel').querySelector('.dl-name').textContent = 'Total';
        }
      }
    }
  });

  const total = top.reduce((s,c)=>s+c.total,0);
  $('donutLabel').querySelector('.dl-pct').textContent = fmt(total);
  $('donutLabel').querySelector('.dl-name').textContent = 'Total';

  $('donutLegend').innerHTML = top.map(c=>`
    <div class="d-leg-item">
      <div class="d-leg-dot" style="background:${c.color}"></div>
      <span class="d-leg-name">${c.name}</span>
      <span class="d-leg-val">${fmt(c.total)}</span>
    </div>`).join('');
}

function renderTrendChart(data) {
  const ctx = $('trendChart').getContext('2d');
  if (state.charts.trend) state.charts.trend.destroy();

  const grad = ctx.createLinearGradient(0,0,0,220);
  grad.addColorStop(0,'rgba(99,102,241,.3)');
  grad.addColorStop(1,'rgba(99,102,241,0)');

  state.charts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d=>d.month),
      datasets: [{
        data: data.map(d=>d.total),
        borderColor: '#6366f1', borderWidth: 2.5,
        backgroundColor: grad, fill: true, tension: 0.4,
        pointBackgroundColor: '#6366f1', pointRadius: 4, pointHoverRadius: 7,
        pointBorderColor: '#13151c', pointBorderWidth: 2
      }]
    },
    options: {
      ...gCfg, responsive: true, maintainAspectRatio: true,
      scales: {
        x: { grid:{display:false}, border:{display:false}, ticks:{color:'#4a5068',font:{size:11,family:"'Outfit'"}} },
        y: { grid:{color:'rgba(255,255,255,.04)'}, border:{display:false},
          ticks:{color:'#4a5068',font:{size:11,family:"'Outfit'"},
            callback: v => v>=1000?'₹'+(v/1000).toFixed(0)+'k':'₹'+v} }
      }
    }
  });
}

// ─── Helpers ─────────────────────────────
function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtDate(s) {
  const d = new Date(s+'T00:00:00'), t = new Date(); t.setHours(0,0,0,0);
  const diff = Math.round((t-d)/86400000);
  if (diff===0) return 'Today'; if (diff===1) return 'Yesterday';
  return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
}

// ─── Color swatches setup ─────────────────
function buildSwatches(selected) {
  state.selectedColor = selected || PALETTE[0];
  const el = $('colorSwatches');
  el.innerHTML = PALETTE.map(c=>`
    <div class="swatch ${c===state.selectedColor?'active':''}" style="background:${c}" data-color="${c}" title="${c}"></div>
  `).join('');
  el.querySelectorAll('.swatch').forEach(s => {
    s.addEventListener('click', () => {
      state.selectedColor = s.dataset.color;
      el.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active'));
      s.classList.add('active');
    });
  });
}

// ─── Category chip picker (expense modal) ─
function buildCatPicker(selectedId) {
  const el = $('catPicker');
  el.innerHTML = '';
  state.categories.forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'cat-chip' + (String(c.id)===String(selectedId)?' active':'');
    if (String(c.id)===String(selectedId)) {
      chip.style.borderColor = c.color;
      chip.style.color = c.color;
    }
    chip.innerHTML = `
      <div class="cat-chip-icon" style="background:${c.color}20">
        <svg viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="1.8">${CAT_ICONS[c.icon]||CAT_ICONS.other}</svg>
      </div>
      ${c.name}
    `;
    chip.addEventListener('click', () => {
      $('expCategory').value = c.id;
      el.querySelectorAll('.cat-chip').forEach(x=>{
        x.classList.remove('active');
        x.style.borderColor = ''; x.style.color='';
      });
      chip.classList.add('active');
      chip.style.borderColor = c.color;
      chip.style.color = c.color;
    });
    el.appendChild(chip);
  });
  if (selectedId) $('expCategory').value = selectedId;
  else if (state.categories[0]) {
    $('expCategory').value = state.categories[0].id;
    el.querySelector('.cat-chip')?.click();
  }
}

// ─── Expense modal ───────────────────────
function openExpenseModal(editId=null) {
  $('expenseForm').reset();
  $('expenseId').value = editId || '';
  $('modalTitle').textContent = editId ? 'Edit Expense' : 'Add Expense';
  $('expDate').value = new Date().toISOString().split('T')[0];
  buildCatPicker(null);

  if (editId) {
    const e = state.expenses.find(x=>x.id===editId);
    if (e) {
      $('expTitle').value  = e.title;
      $('expAmount').value = e.amount;
      $('expDate').value   = e.date;
      $('expNote').value   = e.note||'';
      buildCatPicker(e.category_id);
    }
  }
  $('expenseModal').classList.remove('hidden');
  setTimeout(()=>$('expTitle').focus(), 80);
}

function closeExpenseModal() { $('expenseModal').classList.add('hidden'); }
$('openAddExpense').addEventListener('click', ()=>openExpenseModal());
$('closeExpenseModal').addEventListener('click', closeExpenseModal);
$('cancelExpense').addEventListener('click', closeExpenseModal);
$('expenseModal').addEventListener('click', e=>{ if(e.target===e.currentTarget) closeExpenseModal(); });

$('expenseForm').addEventListener('submit', async e => {
  e.preventDefault();
  const catId = $('expCategory').value;
  if (!catId) { toast('Please select a category', 'error'); return; }
  const id = $('expenseId').value;
  const payload = {
    title: $('expTitle').value.trim(),
    amount: parseFloat($('expAmount').value),
    category_id: catId,
    date: $('expDate').value,
    note: $('expNote').value.trim()
  };
  if (id) { await api.put(`/api/expenses/${id}`, payload); toast('Expense updated'); }
  else    { await api.post('/api/expenses', payload); toast('Expense added'); }
  closeExpenseModal();
  refreshCurrent();
});

async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  await api.delete(`/api/expenses/${id}`);
  toast('Deleted', 'error');
  refreshCurrent();
}

// ─── Category modal ──────────────────────
function openCategoryModal(editId=null) {
  $('categoryForm').reset();
  $('catId').value = editId||'';
  $('catModalTitle').textContent = editId ? 'Edit Category' : 'New Category';
  buildSwatches(editId ? null : PALETTE[0]);

  if (editId) {
    const c = state.categories.find(x=>x.id===editId);
    if (c) {
      $('catName').value = c.name;
      $('catIconSelect').value = c.icon||'other';
      $('catBudget').value = c.budget||'';
      buildSwatches(c.color);
    }
  }
  $('categoryModal').classList.remove('hidden');
  setTimeout(()=>$('catName').focus(), 80);
}

function closeCategoryModal() { $('categoryModal').classList.add('hidden'); }
$('openAddCategory').addEventListener('click', ()=>openCategoryModal());
$('closeCategoryModal').addEventListener('click', closeCategoryModal);
$('cancelCategory').addEventListener('click', closeCategoryModal);
$('categoryModal').addEventListener('click', e=>{ if(e.target===e.currentTarget) closeCategoryModal(); });

$('categoryForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('catId').value;
  const iconKey = $('catIconSelect').value;
  const payload = {
    name:   $('catName').value.trim(),
    icon:   iconKey,
    color:  state.selectedColor,
    budget: parseFloat($('catBudget').value)||0
  };
  if (id) { await api.put(`/api/categories/${id}`, payload); toast('Category updated'); }
  else    { await api.post('/api/categories', payload); toast('Category created'); }
  closeCategoryModal();
  refreshCurrent();
});

async function deleteCategory(id) {
  if (!confirm('Delete this category? All its expenses will be removed.')) return;
  await api.delete(`/api/categories/${id}`);
  toast('Category deleted', 'error');
  refreshCurrent();
}

// ─── Boot ────────────────────────────────
updateMonthLabel();
refreshDashboard();
