// troncamp · hanging_mug 排行榜渲染(匿名 token 榜)。
// 主榜 = T4 纯成功率降序;T1-T3 显示达标门(绿勾/未达标圈/未提交点)。
// 匿名:只显示 token 尾号(token_suffix),永不显示队名。
// 契约:leaderboard.json { generated_at, deadline, final_unlocked, dev:[...], final:[...] }
//   每行 { token_suffix, t1/t2/t3:{pass,success_rate}, t4:{success_rate,submitted_at}|null }
(function () {
  'use strict';

  var cfg = window.BOARD_CONFIG || {};
  var URL = cfg.BOARD_DATA_URL || './data/leaderboard.json';
  var REFRESH = (cfg.REFRESH_SECONDS || 60) * 1000;
  var BOARD = 'dev';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // 达标门:达标=绿勾,未达标=空圈(hover 看 SR),未提交=点。
  function gate(g) {
    if (!g) return '<span class="gate gate-none" title="未提交">·</span>';
    if (g.pass) return '<span class="gate gate-ok" title="已达标">✓</span>';
    var sr = (g.success_rate != null) ? ' ' + Math.round(g.success_rate * 100) + '%' : '';
    return '<span class="gate gate-miss" title="未达标' + sr + '">○</span>';
  }

  // T4 主榜分数 = 纯成功率(×100 一位小数)+ 进度条。
  function t4cell(t4) {
    if (!t4 || t4.success_rate == null) {
      return '<td class="c-score"><span class="dimcell">未上场</span></td>';
    }
    var pct = t4.success_rate * 100;
    var w = Math.max(2, Math.min(100, pct));
    var sub = t4.submitted_at ? '<span class="scoresub">' + esc(t4.submitted_at) + '</span>' : '';
    return '<td class="c-score"><div class="scorewrap">' +
      '<span class="scorenum">' + pct.toFixed(1) + '</span>' + sub +
      '<span class="scorebar"><i style="width:' + w + '%"></i></span></div></td>';
  }

  function rowHtml(r, i) {
    var rank = i + 1;
    var cls = rank <= 3 ? ' top' + rank : '';
    return '<tr class="brow' + cls + '">' +
      '<td class="c-rank">' + rank + '</td>' +
      '<td class="c-token"><span class="tprefix">…</span>' + esc(r.token_suffix || '------') + '</td>' +
      '<td class="c-gate">' + gate(r.t1) + '</td>' +
      '<td class="c-gate">' + gate(r.t2) + '</td>' +
      '<td class="c-gate">' + gate(r.t3) + '</td>' +
      t4cell(r.t4) +
      '</tr>';
  }

  // 主榜排序:有 T4 成绩的按成功率降序在前;无 T4 的按 token 尾号稳定排后。
  function sortRows(rows) {
    return rows.slice().sort(function (a, b) {
      var sa = (a.t4 && a.t4.success_rate != null) ? a.t4.success_rate : -1;
      var sb = (b.t4 && b.t4.success_rate != null) ? b.t4.success_rate : -1;
      if (sb !== sa) return sb - sa;
      return String(a.token_suffix || '').localeCompare(String(b.token_suffix || ''));
    });
  }

  var countdownTimer = null;

  function renderCountdown(deadline) {
    var el = document.getElementById('countdown');
    if (!el) return false;
    if (!deadline) { el.textContent = ''; return false; }
    var end = new Date(deadline).getTime();
    function tick() {
      var ms = end - Date.now();
      if (ms <= 0) { el.textContent = '已截止 · 榜单已冻结'; return; }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400);
      var pad = function (n) { return String(n).padStart(2, '0'); };
      el.textContent = '距截止 ' + d + ' 天 ' + pad(Math.floor(s % 86400 / 3600)) +
        ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
    }
    if (countdownTimer) clearInterval(countdownTimer);
    tick();
    countdownTimer = setInterval(tick, 1000);
    return end - Date.now() <= 0;
  }

  function render(data) {
    var updated = document.getElementById('updated');
    if (updated) updated.textContent = '更新于 ' + (data.generated_at || '—');
    var over = renderCountdown(data.deadline);

    var locked = document.getElementById('locked');
    var table = document.getElementById('board-table');
    var empty = document.getElementById('empty');

    var rows;
    if (BOARD === 'final') {
      // final 在 final_unlocked 前显示「赛末公布」
      if (data.final_unlocked && (data.final || []).length) {
        rows = data.final;
      } else {
        if (locked) locked.hidden = false;
        if (table) table.hidden = true;
        if (empty) empty.hidden = true;
        return;
      }
    } else {
      rows = data.dev || [];
    }
    if (locked) locked.hidden = true;

    rows = sortRows(rows || []);
    if (!rows.length) {
      if (table) table.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    table.hidden = false;
    if (empty) empty.hidden = true;
    table.querySelector('tbody').innerHTML = rows.map(rowHtml).join('');
  }

  function load() {
    fetch(URL + '?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () { /* 静态站:加载失败保持现状,下轮重试 */ });
  }

  window.addEventListener('DOMContentLoaded', function () {
    BOARD = document.body.dataset.board || 'dev';
    load();
    setInterval(load, REFRESH);
  });
})();
