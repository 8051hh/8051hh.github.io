/* ============================================================
   哈哈 · 开源雷达 —— 主应用
   ============================================================ */
(function () {
  'use strict';

  const REPO = '521xueweihan/HelloGitHub';
  const API_LIST = 'https://api.github.com/repos/' + REPO + '/contents/content';
  const FALLBACK_ISSUES = Array.from({ length: 125 }, (_, i) => i + 1);

  const els = {
    bg: document.getElementById('bg'),
    badgeText: document.getElementById('hero-badge-text'),
    statIssues: document.getElementById('stat-issues'),
    statProjects: document.getElementById('stat-projects'),
    statLangs: document.getElementById('stat-langs'),
    search: document.getElementById('search'),
    chips: document.getElementById('chips'),
    issueSelect: document.getElementById('issue-select'),
    issuePrev: document.getElementById('issue-prev'),
    issueNext: document.getElementById('issue-next'),
    issueMeta: document.getElementById('issue-meta'),
    spotlight: document.getElementById('spotlight'),
    grid: document.getElementById('grid'),
    status: document.getElementById('status')
  };

  const state = {
    issues: [],
    current: null,
    issue: null,
    langFilter: 'all',
    query: ''
  };

  /* ---------- 背景：星图粒子 ---------- */
  function initBackground() {
    const canvas = els.bg;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, stars = [], raf = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const count = Math.min(110, Math.floor(w * h / 16000));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 1.3 + 0.3,
          a: Math.random() * 0.6 + 0.2
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // 星点
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = w; else if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h; else if (s.y > h) s.y = 0;
        ctx.globalAlpha = s.a;
        ctx.fillStyle = '#c9d4de';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 连线（近邻）
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#c9d4de';
      const linkDist = 130;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    if (reduced) {
      step();
      cancelAnimationFrame(raf);
    } else {
      step();
    }
  }

  /* ---------- 工具 ---------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad2(n) { return n < 100 ? String(n).padStart(2, '0') : String(n); }

  function repoShort(repoUrl) {
    try {
      const u = new URL(repoUrl);
      return u.hostname === 'github.com'
        ? u.pathname.replace(/^\/|\/$/g, '')
        : repoUrl.replace(/^https?:\/\//, '');
    } catch (e) {
      return repoUrl;
    }
  }

  function cleanDesc(text) {
    return String(text || '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // [text](url) -> text
      .replace(/\[([^\]]+)\]/g, '$1')             // stray [text] -> text
      .replace(/\s+/g, ' ')
      .trim();
  }

  function animateNumber(el, target) {
    const start = performance.now();
    const dur = 700;
    const from = 0;
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 数据获取 ---------- */
  async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.text();
  }

  function issueMarkdownUrl(n) {
    const file = 'HelloGitHub' + pad2(n) + '.md';
    return 'https://cdn.jsdelivr.net/gh/' + REPO + '@master/content/' + file;
  }

  async function loadIssueList() {
    try {
      const data = await fetchJson(API_LIST);
      const nums = [];
      for (const item of data) {
        const m = /^HelloGitHub(\d+)\.md$/.exec(item.name);
        if (m) nums.push(parseInt(m[1], 10));
      }
      if (nums.length) {
        nums.sort((a, b) => a - b);
        return nums;
      }
      throw new Error('empty list');
    } catch (e) {
      console.warn('Issue list fallback used:', e);
      return FALLBACK_ISSUES;
    }
  }

  async function loadIssue(n) {
    const url = issueMarkdownUrl(n);
    let md;
    try {
      md = await fetchText(url);
    } catch (e) {
      // 回退 raw.githubusercontent
      md = await fetchText('https://raw.githubusercontent.com/' + REPO + '/master/content/HelloGitHub' + pad2(n) + '.md');
    }
    return HaParser.parseIssue(md);
  }

  /* ---------- 渲染 ---------- */
  function setStatus(kind, message) {
    if (kind === 'loading') {
      els.status.hidden = false;
      els.status.innerHTML = '<span class="loader"></span>' + escapeHtml(message);
    } else if (kind === 'error') {
      els.status.hidden = false;
      els.status.innerHTML = '⚠ ' + escapeHtml(message) + ' <a href="#" id="retry" style="color:var(--accent)">重试</a>';
      const retry = document.getElementById('retry');
      if (retry) retry.addEventListener('click', (e) => { e.preventDefault(); loadIssueIntoView(state.current); });
    } else {
      els.status.hidden = true;
      els.status.innerHTML = '';
    }
  }

  function buildChips(projects) {
    const counts = new Map();
    for (const p of projects) counts.set(p.lang, (counts.get(p.lang) || 0) + 1);
    const langs = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

    const chip = (lang, count, color, active) => {
      const dot = lang === 'all'
        ? '<span class="dot" style="background:linear-gradient(135deg,var(--accent),var(--accent-2))"></span>'
        : '<span class="dot" style="background:' + color + '"></span>';
      return '<button class="chip' + (active ? ' active' : '') + '" data-lang="' + escapeHtml(lang) + '" role="tab">' +
        dot + '<span>' + escapeHtml(lang) + '</span>' +
        '<span class="count">' + count + '</span></button>';
    };

    let html = chip('all', projects.length, null, state.langFilter === 'all');
    for (const [lang, count] of langs) {
      html += chip(lang, count, HaLang.colorFor(lang), state.langFilter === lang);
    }
    els.chips.innerHTML = html;

    els.chips.querySelectorAll('.chip').forEach((c) => {
      c.addEventListener('click', () => {
        state.langFilter = c.dataset.lang;
        buildChips(projects);
        renderContent(projects);
      });
    });
  }

  function projectCard(p, featured) {
    const langColor = HaLang.colorFor(p.lang);
    const repo = repoShort(p.repoUrl || p.url);
    const hasImg = !!p.image;

    if (featured) {
      const media = hasImg
        ? '<div class="spot-media"><img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" /></div>'
        : '<div class="spot-media noimg">NO&nbsp;PREVIEW</div>';
      return '<article class="spot-card reveal">' + media +
        '<div class="spot-body">' +
          '<div class="spot-top"><span class="spot-idx"># ' + String(p.num).padStart(2, '0') + '</span>' +
          '<span class="spot-tag" style="color:' + langColor + '">' + escapeHtml(p.lang) + '</span></div>' +
          '<h3 class="spot-name">' + escapeHtml(p.name) + '</h3>' +
          '<p class="spot-desc">' + escapeHtml(cleanDesc(p.desc)) + '</p>' +
          '<a class="spot-link" href="' + escapeHtml(p.repoUrl || p.url) + '" target="_blank" rel="noopener">打开仓库 ↗</a>' +
        '</div></article>';
    }

    const media = hasImg
      ? '<div class="card-media"><img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" /></div>'
      : '<div class="card-media noimg">NO&nbsp;PREVIEW</div>';

    return '<article class="card reveal">' + media +
      '<div class="card-body">' +
        '<div class="card-meta">' +
          '<span class="lang-badge"><span class="dot" style="background:' + langColor + '"></span>' + escapeHtml(p.lang) + '</span>' +
          '<span class="card-idx">#' + String(p.num).padStart(2, '0') + '</span>' +
        '</div>' +
        '<h3 class="card-name">' + escapeHtml(p.name) + '</h3>' +
        '<p class="card-desc">' + escapeHtml(cleanDesc(p.desc)) + '</p>' +
        '<div class="card-foot">' +
          '<span class="card-repo" title="' + escapeHtml(repo) + '">' + escapeHtml(repo) + '</span>' +
          '<a class="card-link" href="' + escapeHtml(p.repoUrl || p.url) + '" target="_blank" rel="noopener">GitHub ↗</a>' +
        '</div>' +
      '</div></article>';
  }

  function renderContent(projects) {
    const q = state.query.trim().toLowerCase();
    let list = projects;

    if (state.langFilter !== 'all') {
      list = list.filter((p) => p.lang === state.langFilter);
    }
    if (q) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q)
      );
    }

    // 焦点：仅在「全部 + 无搜索」时展示
    const showSpot = (state.langFilter === 'all' && !q);
    if (showSpot) {
      const featured = projects.slice(0, 3);
      els.spotlight.style.display = '';
      els.spotlight.innerHTML = featured.map((p) => projectCard(p, true)).join('');
    } else {
      els.spotlight.style.display = 'none';
      els.spotlight.innerHTML = '';
    }

    if (!list.length) {
      els.grid.innerHTML = '<div class="status">没有匹配的项目，换个关键词或语言试试。</div>';
      return;
    }
    els.grid.innerHTML = list.map((p) => projectCard(p, false)).join('');
  }

  function render(issue) {
    state.issue = issue;
    const projects = issue.projects || [];

    // 顶部数据
    animateNumber(els.statProjects, projects.length);
    animateNumber(els.statLangs, new Set(projects.map((p) => p.lang)).size);
    animateNumber(els.statIssues, state.issues.length);

    els.issueMeta.textContent = issue.title + ' · 共 ' + projects.length + ' 个项目';

    // 期数切换
    const max = state.issues[state.issues.length - 1];
    const min = state.issues[0];
    els.issuePrev.disabled = state.current <= min;
    els.issueNext.disabled = state.current >= max;
    els.issueSelect.value = String(state.current);

    // 重置筛选（切换期数时）
    state.langFilter = 'all';
    state.query = '';
    els.search.value = '';

    buildChips(projects);
    renderContent(projects);
  }

  async function loadIssueIntoView(n) {
    setStatus('loading', '正在下载第 ' + n + ' 期数据…');
    try {
      const issue = await loadIssue(n);
      state.current = issue.number || n;
      setStatus('ok');
      render(issue);
      // 滚动到雷达区域
      if (window.innerWidth > 720) {
        document.getElementById('radar').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      console.error(e);
      setStatus('error', '加载失败：' + e.message);
    }
  }

  function populateIssueSelect() {
    const opts = state.issues.slice().reverse().map((n) =>
      '<option value="' + n + '">第 ' + n + ' 期</option>'
    ).join('');
    els.issueSelect.innerHTML = opts;
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    els.search.addEventListener('input', () => {
      state.query = els.search.value;
      if (state.issue) renderContent(state.issue.projects);
    });

    els.issuePrev.addEventListener('click', () => {
      if (state.current <= state.issues[0]) return;
      loadIssueIntoView(state.current - 1);
    });

    els.issueNext.addEventListener('click', () => {
      const max = state.issues[state.issues.length - 1];
      if (state.current >= max) return;
      loadIssueIntoView(state.current + 1);
    });

    els.issueSelect.addEventListener('change', () => {
      const n = parseInt(els.issueSelect.value, 10);
      if (n && n !== state.current) loadIssueIntoView(n);
    });
  }

  /* ---------- 启动 ---------- */
  async function init() {
    initBackground();
    bindEvents();
    setStatus('loading', '正在接入 HelloGitHub 数据流…');

    state.issues = await loadIssueList();
    populateIssueSelect();

    const latest = state.issues[state.issues.length - 1];
    els.badgeText.textContent = 'HelloGitHub · 已收录 ' + state.issues.length + ' 期 · 数据实时更新';

    await loadIssueIntoView(latest);
  }

  init();
})();
