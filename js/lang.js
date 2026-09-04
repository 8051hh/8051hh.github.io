/* 语言 / 分类 → 颜色与规范化 */
(function (global) {
  'use strict';

  // GitHub 语言色 + 自定义分类色
  const LANG_COLORS = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'C++': '#f34b7d',
    'C': '#8b9db0',
    'C#': '#178600',
    'Rust': '#dea584',
    'Kotlin': '#A97BFF',
    'Swift': '#F05138',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'CSS': '#563d7c',
    'HTML': '#e34c26',
    'Vue': '#41b883',
    'Shell': '#89e051',
    'Dart': '#00B4AB',
    'Lua': '#000080',
    'Scala': '#c22d40',
    'Objective-C': '#438eff',
    'R': '#198CE7',
    'Perl': '#0298c3',
    'Haskell': '#5e5086',
    'Dockerfile': '#384d54',
    'Makefile': '#427819',
    '开源书籍': '#ffc247',
    '机器学习': '#ff6b35',
    '人工智能': '#ff6b35',
    'AI': '#ff6b35',
    'Skills': '#f59e0b',
    '其它': '#8b95a5',
    '其他': '#8b95a5'
  };

  const DEFAULT_COLOR = '#8b95a5';

  // 从 "### XXX 项目" 标题规范化出语言名
  function normalizeLang(heading) {
    let h = (heading || '').trim();
    if (!h) return '其它';
    // 去掉常见后缀
    h = h.replace(/\s*项目\s*$/, '');
    h = h.replace(/\s*(类|专题|篇|精选)\s*$/, '');
    if (!h) return '其它';
    return h;
  }

  function colorFor(lang) {
    return LANG_COLORS[lang] || DEFAULT_COLOR;
  }

  global.HaLang = {
    LANG_COLORS: LANG_COLORS,
    DEFAULT_COLOR: DEFAULT_COLOR,
    normalizeLang: normalizeLang,
    colorFor: colorFor
  };
})(window);
