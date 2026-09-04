/* HelloGitHub 期数 Markdown 解析器
   输入：HelloGitHubNNN.md 原始文本
   输出：{ number, title, projects: [{ num, name, url, repoUrl, desc, image, lang }] }
*/
(function (global) {
  'use strict';

  const SKIP_HEADINGS = /目录|赞助|声明|贡献|Tips|内容|反馈|上一期|下一期|微信公众号/i;

  function extractIssueNumber(md) {
    const m = md.match(/#\s*《?HelloGitHub》?\s*第\s*(\d+)\s*期/);
    if (m) return parseInt(m[1], 10);
    const alt = md.match(/HelloGitHub\s*(\d+)/);
    return alt ? parseInt(alt[1], 10) : null;
  }

  function extractTitle(md) {
    const m = md.match(/^#\s*(.+)$/m);
    return m ? m[1].trim() : 'HelloGitHub';
  }

  // 从 hellogithub 点击统计链接中解析出真实 GitHub 仓库地址
  function resolveRepoUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url);
      const target = u.searchParams.get('target');
      if (target) return target;
      return url;
    } catch (e) {
      return url;
    }
  }

  function parseEntries(body) {
    const entries = [];
    const lines = body.split(/\r?\n/);
    let cur = null;

    const flush = function () {
      if (cur) {
        cur.desc = (cur.desc || '').trim();
        entries.push(cur);
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 条目：1、[名称](链接)：描述
      const m = line.match(/^\s*(\d+)、\s*\[([^\]]+)\]\(([^)]+)\)\s*[：:]?\s*(.*)$/);
      if (m) {
        flush();
        cur = {
          num: parseInt(m[1], 10),
          name: m[2].trim(),
          url: m[3].trim(),
          desc: m[4] || '',
          image: null
        };
      } else if (cur) {
        const img = line.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (img && !cur.image) cur.image = img[1];
      }
    }
    flush();
    return entries;
  }

  function parseIssue(md) {
    const issue = {
      number: extractIssueNumber(md),
      title: extractTitle(md),
      projects: []
    };

    // 定位「内容」到「赞助/声明」之间
    let content = md;
    const startIdx = md.indexOf('## 内容');
    if (startIdx >= 0) content = md.slice(startIdx);
    const endIdx = content.search(/\n##\s*(赞助|声明)/);
    if (endIdx >= 0) content = content.slice(0, endIdx);

    // 按 "### " 分节
    const parts = content.split(/^###\s+/m);
    // parts[0] 是第一个 ### 之前的导航内容，忽略
    for (let i = 1; i < parts.length; i++) {
      const block = parts[i];
      const nl = block.indexOf('\n');
      const heading = (nl >= 0 ? block.slice(0, nl) : block).trim();
      const body = nl >= 0 ? block.slice(nl + 1) : '';

      if (!heading || SKIP_HEADINGS.test(heading)) continue;

      const lang = global.HaLang ? global.HaLang.normalizeLang(heading) : heading;
      const entries = parseEntries(body);

      for (const e of entries) {
        e.lang = lang;
        e.repoUrl = resolveRepoUrl(e.url);
        issue.projects.push(e);
      }
    }

    return issue;
  }

  global.HaParser = { parseIssue: parseIssue, resolveRepoUrl: resolveRepoUrl };
})(window);
