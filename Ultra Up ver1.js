// ゲーム起動用関数
function startUltraUp() {
  const fn = n => (typeof n === 'number' || !isNaN(n)) ? Number(n).toLocaleString() : n;

  // 既存要素の削除[cite: 1]
  const ex = document.getElementById('bml-ultra-up');
  if (ex) ex.remove();
  const exDpad = document.getElementById('ps-neon-dpad-overlay');
  if (exDpad) exDpad.remove();

  // 位置設定の読み込み[cite: 1]
  let isRightPos = false;
  try {
    isRightPos = localStorage.getItem('jg_pos_right') === 'true';
  } catch (e) {}

  // メインコンテナ[cite: 1]
  const c = document.createElement('div');
  c.id = 'bml-ultra-up';
  c.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;box-sizing:border-box;font-family:sans-serif;user-select:none;';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:flex;align-items:center;gap:15px;';
  c.appendChild(wrap);

  // 対戦相手用 Canvas[cite: 1]
  const opCv = document.createElement('canvas');
  opCv.width = 400;
  opCv.height = 600;
  opCv.style.cssText = 'background:#1a1a2e;box-shadow:0 0 30px rgba(0,255,255,0.4);border-radius:15px;display:none;outline:none;';
  wrap.appendChild(opCv);

  // プレイヤー用 Canvas[cite: 1]
  const cv = document.createElement('canvas');
  cv.width = 400;
  cv.height = 600;
  cv.tabIndex = 1;
  cv.style.cssText = 'background:#1a1a2e;box-shadow:0 0 30px rgba(0,255,255,0.4);border-radius:15px;display:block;outline:none;';
  wrap.appendChild(cv);

  // 閉じるボタン[cite: 1]
  const cb = document.createElement('button');
  cb.innerText = '✕ CLOSE';
  cb.style.cssText = 'position:absolute;bottom:12px;right:12px;padding:6px 14px;font-size:11px;letter-spacing:1px;background:rgba(255,51,102,0.15);color:#ff3366;border:1px solid rgba(255,51,102,0.6);border-radius:20px;cursor:pointer;font-weight:bold;z-index:10;backdrop-filter:blur(4px);box-shadow:0 0 10px rgba(255,51,102,0.2);transition:all 0.2s;outline:none;display:none;';
  cb.onmouseenter = () => {
    cb.style.background = 'rgba(255,51,102,0.35)';
    cb.style.boxShadow = '0 0 15px rgba(255,51,102,0.6)';
    cb.style.transform = 'scale(1.05)';
  };
  cb.onmouseleave = () => {
    cb.style.background = 'rgba(255,51,102,0.15)';
    cb.style.boxShadow = '0 0 10px rgba(255,51,102,0.2)';
    cb.style.transform = 'scale(1)';
  };
  cb.onclick = () => {
    c.remove();
    dpadWrap.remove();
    if (aid) cancelAnimationFrame(aid);
    window.removeEventListener('keydown', dpadKD);
    window.removeEventListener('keyup', dpadKU);
    document.removeEventListener('keydown', kd);
    document.removeEventListener('keyup', ku);
  };
  wrap.appendChild(cb);

  function applyPos() {
    if (isRightPos) {
      c.style.justifyContent = 'flex-end';
      c.style.paddingRight = '30px';
    } else {
      c.style.justifyContent = 'center';
      c.style.paddingRight = '0px';
    }
  }
  applyPos();
  document.body.appendChild(c);

  // D-Pad UI[cite: 1]
  const dpadWrap = document.createElement('div');
  dpadWrap.id = 'ps-neon-dpad-overlay';
  dpadWrap.style.cssText = 'position:fixed;top:20px;left:20px;z-index:1000000;user-select:none;touch-action:none;display:flex;flex-direction:column;gap:10px;font-family:monospace,sans-serif;';

  const dpadGrid = document.createElement('div');
  dpadGrid.style.cssText = 'width:160px;height:160px;background:rgba(20,20,30,0.8);backdrop-filter:blur(8px);border-radius:28px;box-shadow:0 0 15px rgba(0,0,255,0.4),inset 0 1px 1px rgba(255,255,255,0.1);display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:10px;box-sizing:border-box;';

  const lBox = document.createElement('div');
  lBox.style.cssText = 'width:160px;height:220px;background:rgba(20,20,30,0.85);backdrop-filter:blur(8px);border-radius:12px;border:1px solid #00aaff;box-shadow:0 0 10px rgba(0,170,255,0.3);padding:8px;box-sizing:border-box;color:#fff;font-size:11px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;scrollbar-width:thin;';

  const dpadStyle = 'display:flex;align-items:center;justify-content:center;background:transparent;border:2px solid currentColor;cursor:pointer;transition:all 0.08s ease;box-shadow:0 0 8px currentColor;';

  const aSvg = function (d) {
    return '<svg viewBox="0 0 100 100" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:14;transform:rotate(' + d + 'deg);"><path d="M50 0 L0 100 L100 100 Z" /></svg>';
  };

  const dpB = {
    'ArrowUp': { n: 'UP ▲', g: '1/2', l: aSvg(0), s: 'border-radius:10px 10px 2px 2px;margin-bottom:3px;', color: '#ff3131' },
    'ArrowLeft': { n: 'LEFT ◄', g: '2/1', l: aSvg(270), s: 'border-radius:10px 2px 2px 10px;margin-right:3px;', color: '#bf00ff' },
    'ArrowRight': { n: 'RIGHT ►', g: '2/3', l: aSvg(90), s: 'border-radius:2px 10px 10px 2px;margin-left:3px;', color: '#32cd32' },
    'ArrowDown': { n: 'DOWN ▼', g: '3/2', l: aSvg(180), s: 'border-radius:2px 2px 10px 10px;margin-top:3px;', color: '#1e90ff' }
  };
  let dpadEls = {}, dpadActive = {};

  Object.entries(dpB).forEach(function (entry) {
    var k = entry[0], v = entry[1], el = document.createElement('div');
    el.style.cssText = dpadStyle + v.s + 'color:' + v.color + ';grid-area:' + v.g + ';';
    el.innerHTML = v.l;
    dpadGrid.appendChild(el);
    dpadEls[k] = el;
  });

  const pit = document.createElement('div');
  pit.style.cssText = 'grid-area:2/2;width:30px;height:30px;background:rgba(20,20,30,0.5);border-radius:50%;border:2px solid #0055ff;box-shadow:inset 0 0 10px rgba(0,85,255,0.6);justify-self:center;align-self:center;';
  dpadGrid.appendChild(pit);
  dpadWrap.appendChild(dpadGrid);
  dpadWrap.appendChild(lBox);
  document.body.appendChild(dpadWrap);

  const dpadSt = document.createElement('style');
  dpadSt.textContent = '.dpad-press{transform:scale(0.85) translateY(2px)!important;box-shadow:0 0 20px currentColor, inset 0 0 5px currentColor!important;}';
  dpadWrap.appendChild(dpadSt);

  const dpadStart = function (k, fromUI) {
    if (!dpB[k] || dpadActive[k]) return;
    dpadEls[k].classList.add('dpad-press');
    const t0 = Date.now(), row = document.createElement('div');
    row.style.cssText = 'white-space:nowrap;opacity:0.8;';
    row.innerHTML = '<span style="color:' + dpB[k].color + ';">' + dpB[k].n + '</span>: 0.00s';
    lBox.insertBefore(row, lBox.firstChild);

    const tid = setInterval(function () {
      row.innerHTML = '<span style="color:' + dpB[k].color + ';">' + dpB[k].n + '</span>: ' + ((Date.now() - t0) / 1000).toFixed(2) + 's';
    }, 30);

    dpadActive[k] = { t0: t0, tid: tid, row: row };
    if (fromUI) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: k, bubbles: true }));
    }
  };

  const dpadEnd = function (k, fromUI) {
    if (!dpadActive[k]) return;
    dpadEls[k].classList.remove('dpad-press');
    var a = dpadActive[k];
    clearInterval(a.tid);
    a.row.innerHTML = '<span style="color:' + dpB[k].color + ';">' + dpB[k].n + '</span>: ' + ((Date.now() - a.t0) / 1000).toFixed(2) + 's';
    a.row.style.cssText = 'white-space:nowrap;color:#fff;font-weight:bold;';
    delete dpadActive[k];
    if (fromUI) {
      document.dispatchEvent(new KeyboardEvent('keyup', { code: k, bubbles: true }));
    }
  };

  const dpadKD = function (e) {
    if (!e.repeat) dpadStart(e.code, false);
  };
  const dpadKU = function (e) {
    dpadEnd(e.code, false);
  };

  window.addEventListener('keydown', dpadKD);
  window.addEventListener('keyup', dpadKU);

  Object.keys(dpB).forEach(function (k) {
    var el = dpadEls[k],
      p = function (e) {
        e.preventDefault();
        dpadStart(k, true);
      },
      r = function (e) {
        e.preventDefault();
        dpadEnd(k, true);
      };
    el.onmousedown = p;
    el.onmouseup = r;
    el.onmouseleave = r;
    el.ontouchstart = p;
    el.ontouchend = r;
  });

  // ゲームシステム変数[cite: 1]
  const ctx = cv.getContext('2d');
  let b, p, s, go, k = {}, aid, pt, cl, jc, chg, tm = 0, ms = true, gm = 0, win = false, cd = 0, nr = false, ve = false, ftm = 0, bigTm = 0, monoTm = 0, airWalkTimer = 0, allStopTimer = 0, yellowWorldTimer = 0, vePage = 0, lh = 0, rh = 0, plf = false, prf = false, dc = 2, uc = 0;
  let hi = 0, bt = 999999, bt100 = 999999, gn = 0, cp = 0, tp = 0, storyMax = 1, storyStage = 1, storyBannerTimer = 0;
  let seenTypes = {}, platBannerTimer = 0, platBannerInfo = null;
  let tickets = 100, showGacha = false, gachaMenuState = 0, gachaSelIndex = 0, gachaTopMsg = '', showOption = false, gachaMsg = '', gachaColor = '#fff', gachaTab = 0, uGachaMsg = '', uGachaColor = '#fff';

  const bColors = [
    { n: 'ネオンレッド', c: '#ff3131' },
    { n: 'ネオンブルー', c: '#00f0ff' },
    { n: 'ライムグリーン', c: '#00ff22' },
    { n: 'サンイエロー', c: '#ffcc00' },
    { n: 'ポイズンパープル', c: '#bf00ff' },
    { n: 'ホットピンク', c: '#ff00aa' },
    { n: 'スノーホワイト', c: '#ffffff' },
    { n: 'ダークシャドウ', c: '#333333' },
    { n: 'シャイニーゴールド', c: '#ffd700' },
    { n: 'サイバーレインボー', c: 'rainbow' }
  ];
  let ownedColors = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], curColorIdx = 0;

  const bPatterns = [
    { n: 'ノーマル', t: 'none' },
    { n: 'ストライプ', t: 'stripe' },
    { n: 'ドット', t: 'dots' },
    { n: '★スター', t: 'star' },
    { n: 'サイバー', t: 'grid' }
  ];
  let ownedPatterns = [1, 0, 0, 0, 0], curPatternIdx = 0;

  const bTrails = [
    { n: 'ノーマル', t: 'none' },
    { n: 'キラキラ', t: 'sparkle' },
    { n: 'フレイム', t: 'flame' },
    { n: 'バブル', t: 'bubble' },
    { n: 'ネオン残像', t: 'neon' }
  ];
  let ownedTrails = [1, 0, 0, 0, 0], curTrailIdx = 0;

  const ultras = [
    { n: 'ハイパージャンプ', d: '一気に上空へ超絶大ジャンプ！', c: '#00f0ff' },
    { n: '空中ウォーク', d: '2秒間、空中ジャンプが無限に可能！', c: '#ff00ff' },
    { n: 'オールストップ', d: '5秒間全足場が停止＆幅が2倍になる！', c: '#ffff00' },
    { n: 'イエローワールド', d: '3秒間足場がすべて黄色の足場になる！', c: '#ffcc00' }
  ];
  let ownedUltras = [1, 0, 0, 0], curUltraIdx = 0;

  const pi = [
    { n: '通常足場', c: '#00ff22', d: '基本の安全な足場' },
    { n: '大ジャンプ床', c: '#ffcc00', d: '通常より高く跳べる！' },
    { n: '移動足場', c: '#ff3333', d: '左右にゆらゆら動く床' },
    { n: '消える足場', c: '#cc33ff', d: '乗ると崩壊して消滅する床' },
    { n: '移動消える床', c: '#ff00aa', d: '動く＋乗ると消滅する危険床' },
    { n: '移動大跳躍床', c: '#ff9900', d: '動く＋高く跳べる床' },
    { n: '移動急上昇床', c: '#0099ff', d: '動く＋乗ると消滅＆大きく急上昇' },
    { n: '急上昇足場', c: '#00f0ff', d: '乗ると消滅＆一気に急上昇' },
    { n: '時間停止床', c: '#ffffff', d: '動く足場を1秒間停止させる床' },
    { n: '黒色の足場', c: '#000000', d: '画面内の他の足場半分を破壊！' },
    { n: '茶色の足場', c: '#8b4513', d: '1秒間巨大化＋ジャンプ力2倍！' },
    { n: '銀色の足場', c: '#c0c0c0', d: '1秒間世界がモノクロになる床' }
  ];

  let peer = null, conn = null, op = null, isHost = false, netStatus = '', roomCode = '', bp = 0, bpUpdated = false, matchResult = '';
  let enc = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // ローカルストレージ復元[cite: 1]
  try {
    let oh = localStorage.getItem('jg_hi') ? parseInt(localStorage.getItem('jg_hi'), 10) : 0;
    hi = localStorage.getItem('jg_hi_v2') ? parseInt(localStorage.getItem('jg_hi_v2'), 10) : oh * 2;
    bt = localStorage.getItem('jg_bt') ? parseFloat(localStorage.getItem('jg_bt')) : 999999;
    bt100 = localStorage.getItem('jg_bt100') ? parseFloat(localStorage.getItem('jg_bt100')) : 999999;
    let og = localStorage.getItem('jg_gn') ? parseInt(localStorage.getItem('jg_gn'), 10) : 0;
    gn = localStorage.getItem('jg_gn_v2') ? parseInt(localStorage.getItem('jg_gn_v2'), 10) : og * 2;
    let oc = localStorage.getItem('jg_cp') ? parseInt(localStorage.getItem('jg_cp'), 10) : 0;
    cp = localStorage.getItem('jg_cp_v2') ? parseInt(localStorage.getItem('jg_cp_v2'), 10) : oc * 2;
    let ot = localStorage.getItem('jg_tp') ? parseInt(localStorage.getItem('jg_tp'), 10) : 0;
    tp = localStorage.getItem('jg_tp_v2') ? parseInt(localStorage.getItem('jg_tp_v2'), 10) : ot * 2;
    let ob = localStorage.getItem('jg_bp') ? parseInt(localStorage.getItem('jg_bp'), 10) : 0;
    bp = localStorage.getItem('jg_bp_v2') ? parseInt(localStorage.getItem('jg_bp_v2'), 10) : ob * 2;
    storyMax = localStorage.getItem('jg_story_max') ? parseInt(localStorage.getItem('jg_story_max'), 10) : 1;
    let st = localStorage.getItem('jg_tickets');
    tickets = st !== null ? parseInt(st, 10) : 100;

    let soc = localStorage.getItem('jg_owned_colors');
    if (soc) {
      ownedColors = soc.split(',').map(Number);
      while (ownedColors.length < 10) ownedColors.push(0);
    }
    let scc = localStorage.getItem('jg_cur_color');
    if (scc !== null) curColorIdx = parseInt(scc, 10);

    let sop = localStorage.getItem('jg_owned_patterns');
    if (sop) {
      ownedPatterns = sop.split(',').map(Number);
      while (ownedPatterns.length < 5) ownedPatterns.push(0);
    }
    let scp = localStorage.getItem('jg_cur_pattern');
    if (scp !== null) curPatternIdx = parseInt(scp, 10);

    let sot = localStorage.getItem('jg_owned_trails');
    if (sot) {
      ownedTrails = sot.split(',').map(Number);
      while (ownedTrails.length < 5) ownedTrails.push(0);
    }
    let sct = localStorage.getItem('jg_cur_trail');
    if (sct !== null) curTrailIdx = parseInt(sct, 10);

    let sou = localStorage.getItem('jg_owned_ultras');
    if (sou) {
      ownedUltras = sou.split(',').map(Number);
      while (ownedUltras.length < 4) ownedUltras.push(0);
    }
    let scu = localStorage.getItem('jg_cur_ultra');
    if (scu !== null) curUltraIdx = parseInt(scu, 10);

    let se = localStorage.getItem('jg_enc');
    if (se) {
      enc = se.split(',').map(Number);
      while (enc.length < 12) enc.push(0);
    }
  } catch (e) {}

  function cs(x, y, d) {
    for (let i = 0; i < 12; i++) {
      pt.push({
        x: x, y: y,
        vx: (Math.random() * 4 + 2) * d,
        vy: (Math.random() - 0.6) * 5,
        c: '#ff9900', l: 20, ml: 20, sz: Math.random() * 2 + 1
      });
    }
  }

  function lp(cb) {
    if (window.Peer) {
      cb();
    } else {
      netStatus = 'LOADING';
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js';
      s.onload = cb;
      s.onerror = () => {
        alert('通信ライブラリの読込に失敗しました。');
        netStatus = '';
      };
      document.head.appendChild(s);
    }
  }

  function sc() {
    conn.on('open', () => {
      netStatus = 'CONNECTED';
      op = { x: 200, y: 450, s: 0, go: false, win: false, tt: 0, tm: 0, p: [] };
      if (isHost) {
        conn.send({ t: 'init', gm: gm });
        init(0);
      }
    });
    conn.on('data', d => {
      if (d.t === 'init') {
        gm = d.gm;
        init(0);
      } else if (d.t === 'sync') {
        op = d;
      }
    });
    conn.on('close', () => {
      alert('対戦相手が切断しました。');
      netStatus = '';
      ms = true;
      if (peer) {
        peer.destroy();
        peer = null;
        conn = null;
      }
    });
  }

  function cr() {
    lp(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      roomCode = code;
      netStatus = 'WAITING';
      isHost = true;
      if (peer) peer.destroy();
      peer = new Peer('jg-room-' + code);
      peer.on('open', () => {});
      peer.on('connection', c => {
        conn = c;
        sc();
      });
      peer.on('error', e => {
        alert('エラー: ' + e.type);
        netStatus = '';
        if (peer) peer.destroy();
      });
    });
  }

  function jr() {
    lp(() => {
      const code = prompt('4桁の部屋コードを入力してください（例: 1234）:');
      if (!code || code.length !== 4 || isNaN(code)) return;
      roomCode = code;
      netStatus = 'CONNECTING';
      isHost = false;
      if (peer) peer.destroy();
      peer = new Peer();
      peer.on('open', () => {
        conn = peer.connect('jg-room-' + roomCode);
        sc();
      });
      peer.on('error', e => {
        alert('接続エラー: ' + e.type);
        netStatus = '';
        if (peer) peer.destroy();
      });
    });
  }

  function drawGacha() {
    if (tickets < 1) {
      gachaMsg = 'チケットが足りません！';
      gachaColor = '#ff3366';
      return;
    }
    tickets--;
    try { localStorage.setItem('jg_tickets', tickets); } catch (e) {}

    let pool = [];
    for (let i = 0; i < bColors.length; i++) if (!ownedColors[i]) pool.push({ cat: 'col', idx: i, name: '[カラー] ' + bColors[i].n });
    for (let i = 0; i < bPatterns.length; i++) if (!ownedPatterns[i]) pool.push({ cat: 'pat', idx: i, name: '[模様] ' + bPatterns[i].n });
    for (let i = 0; i < bTrails.length; i++) if (!ownedTrails[i]) pool.push({ cat: 'tra', idx: i, name: '[トレイル] ' + bTrails[i].n });

    if (pool.length > 0) {
      let picked = pool[Math.floor(Math.random() * pool.length)];
      if (picked.cat === 'col') {
        ownedColors[picked.idx] = 1; curColorIdx = picked.idx; gachaTab = 0;
        gachaColor = bColors[picked.idx].c === 'rainbow' ? '#ff00ff' : bColors[picked.idx].c;
        try { localStorage.setItem('jg_owned_colors', ownedColors.join(',')); localStorage.setItem('jg_cur_color', curColorIdx); } catch (e) {}
      } else if (picked.cat === 'pat') {
        ownedPatterns[picked.idx] = 1; curPatternIdx = picked.idx; gachaTab = 1; gachaColor = '#00ffaa';
        try { localStorage.setItem('jg_owned_patterns', ownedPatterns.join(',')); localStorage.setItem('jg_cur_pattern', curPatternIdx); } catch (e) {}
      } else if (picked.cat === 'tra') {
        ownedTrails[picked.idx] = 1; curTrailIdx = picked.idx; gachaTab = 2; gachaColor = '#ff9900';
        try { localStorage.setItem('jg_owned_trails', ownedTrails.join(',')); localStorage.setItem('jg_cur_trail', curTrailIdx); } catch (e) {}
      }
      gachaMsg = '【新カスタマイズGET!】 ' + picked.name;
    } else {
      tickets += 2;
      try { localStorage.setItem('jg_tickets', tickets); } catch (e) {}
      gachaMsg = '【全アイテム獲得済み!】 チケット+2枚 還元!';
      gachaColor = '#00f0ff';
    }
  }

  function drawUltraGacha() {
    if (tickets < 1) {
      uGachaMsg = 'チケットが足りません！';
      uGachaColor = '#ff3366';
      return;
    }
    tickets--;
    try { localStorage.setItem('jg_tickets', tickets); } catch (e) {}

    let pool = [];
    for (let i = 0; i < ultras.length; i++) if (!ownedUltras[i]) pool.push(i);

    if (pool.length > 0) {
      let picked = pool[Math.floor(Math.random() * pool.length)];
      ownedUltras[picked] = 1; curUltraIdx = picked;
      uGachaColor = ultras[picked].c;
      uGachaMsg = '【新ウルトラGET!】 ' + ultras[picked].n;
      try { localStorage.setItem('jg_owned_ultras', ownedUltras.join(',')); localStorage.setItem('jg_cur_ultra', curUltraIdx); } catch (e) {}
    } else {
      tickets += 2;
      try { localStorage.setItem('jg_tickets', tickets); } catch (e) {}
      uGachaMsg = '【全ウルトラ獲得済み!】 チケット+2枚 還元!';
      uGachaColor = '#00f0ff';
    }
  }

  function setPlatformType(pl, score) {
    let r = Math.random();
    if (score > 94000) {
      if (r < 0.34) { pl.t = 4; pl.vx = 0; }
      else if (r < 0.67) { pl.t = 6; pl.vx = 0; }
      else { pl.t = 9; pl.vx = 0; }
    } else if (score > 90000) {
      if (r < 0.25) { pl.t = 7; pl.vx = 0; }
      else if (r < 0.50) { pl.t = 6; pl.vx = 0; }
      else if (r < 0.75) { pl.t = 3; pl.vx = 0; }
      else { pl.t = 11; pl.vx = 0; }
    } else if (score > 84000) {
      if (r < 0.34) { pl.t = 7; pl.vx = 0; }
      else if (r < 0.67) { pl.t = 6; pl.vx = 0; }
      else { pl.t = 3; pl.vx = 0; }
    } else if (score > 80000) {
      if (r < 0.05) { pl.t = 10; pl.vx = 0; }
      else if (r < 0.10) { pl.t = 9; pl.vx = 0; }
      else if (r < 0.25) { pl.t = 8; pl.vx = 0; }
      else if (r < 0.45) { pl.t = 5; }
      else if (r < 0.70) { pl.t = 3; pl.vx = 0; }
      else if (r < 0.90) { pl.t = 2; }
      else { pl.t = 0; pl.vx = 0; }
    } else if (score > 70000) {
      let sp = 1.8;
      pl.vx = (Math.random() < 0.5 ? -sp : sp);
      if (r < 0.05) { pl.t = 9; pl.vx = 0; }
      else if (r < 0.20) { pl.t = 8; pl.vx = 0; }
      else if (r < 0.45) { pl.t = 5; }
      else if (r < 0.70) { pl.t = 3; pl.vx = 0; }
      else if (r < 0.90) { pl.t = 2; }
      else { pl.t = 0; pl.vx = 0; }
    } else if (score > 64000) {
      if (r < 0.15) { pl.t = 8; pl.vx = 0; }
      else if (r < 0.25) { pl.t = 6; }
      else if (r < 0.35) { pl.t = 5; }
      else { pl.t = 4; }
    } else if (score > 62000) {
      if (r < 0.15) { pl.t = 6; }
      else if (r < 0.25) { pl.t = 5; }
      else { pl.t = 4; }
    } else if (score > 52000) {
      if (r < 0.10) { pl.t = 5; }
      else { pl.t = 4; }
    } else if (score > 40000) {
      if (r < 0.20) { pl.t = 7; pl.vx = 0; }
      else { pl.t = 4; }
    } else if (score > 30000) {
      if (r < 0.40) { pl.t = 4; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else if (r < 0.80) { pl.t = 3; pl.vx = 0; }
      else { pl.t = 7; pl.vx = 0; }
    } else if (score > 26000) {
      if (r < 0.35) { pl.t = 4; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else if (r < 0.70) { pl.t = 3; pl.vx = 0; }
      else { pl.t = 2; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
    } else if (score > 20000) {
      if (r < 0.30) { pl.t = 4; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else if (r < 0.60) { pl.t = 3; pl.vx = 0; }
      else if (r < 0.90) { pl.t = 2; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else { pl.t = 1; pl.vx = 0; }
    } else if (score > 16000) {
      if (r < 0.50) { pl.t = 3; pl.vx = 0; }
      else if (r < 0.90) { pl.t = 2; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else { pl.t = 1; pl.vx = 0; }
    } else if (score > 10000) {
      if (r < 0.40) { pl.t = 3; pl.vx = 0; }
      else if (r < 0.55) { pl.t = 2; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else if (r < 0.60) { pl.t = 1; pl.vx = 0; }
      else { pl.t = 0; pl.vx = 0; }
    } else if (score > 6000) {
      if (r < 0.20) { pl.t = 3; pl.vx = 0; }
      else if (r < 0.35) { pl.t = 2; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else if (r < 0.40) { pl.t = 1; pl.vx = 0; }
      else { pl.t = 0; pl.vx = 0; }
    } else if (score > 4000) {
      if (r < 0.15) { pl.t = 2; pl.vx = (Math.random() < 0.5 ? -1.8 : 1.8); }
      else if (r < 0.20) { pl.t = 1; pl.vx = 0; }
      else { pl.t = 0; pl.vx = 0; }
    } else if (score > 2000) {
      if (r < 0.05) { pl.t = 1; pl.vx = 0; }
      else { pl.t = 0; pl.vx = 0; }
    } else {
      pl.t = 0; pl.vx = 0;
    }

    if (pl.t === 2 || pl.t === 4 || pl.t === 5 || pl.t === 6) {
      if (pl.vx === 0) {
        let sp = score > 70000 ? 1.8 : 1.5;
        pl.vx = (Math.random() < 0.5 ? -sp : sp);
      }
    }
    if (!ms) {
      if (pl.t < 12) enc[pl.t] = 1;
      try { localStorage.setItem('jg_enc', enc.join(',')); } catch (ex) {}
    }
  }

  function init(startScore = 0) {
    b = { x: 200, y: 450, vx: 0, vy: 0, r: 10, g: 0.3, jf: -10.5, tt: 0 };
    p = []; pt = []; cl = 0;
    jc = gm === 1 ? 2 : 1;
    chg = 0; s = startScore; tm = 0;
    go = false; win = false; ms = false; nr = false;
    ftm = 0; bigTm = 0; monoTm = 0;
    airWalkTimer = 0; allStopTimer = 0; yellowWorldTimer = 0;
    vePage = 0; bpUpdated = false; matchResult = '';
    lh = 0; rh = 0; dc = 2; plf = false; prf = false; uc = 0;
    storyStage = 1; storyBannerTimer = gm === 6 ? 180 : 0;
    seenTypes = {}; platBannerTimer = 0; platBannerInfo = null;
    showGacha = false; gachaMenuState = 0; gachaSelIndex = 0; gachaTopMsg = '';
    showOption = false; cd = 180;

    p.push({ x: 170, y: 500, w: 60, h: 10, t: 0, vx: 0 });
    for (let i = 1; i < 10; i++) {
      let pl = { x: Math.random() * 340, y: 500 - i * 60, w: 60, h: 10, t: 0, vx: 0 };
      setPlatformType(pl, s);
      p.push(pl);
    }
    k = {};
  }

  const kd = e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Enter'].includes(e.code)) e.preventDefault();
    k[e.code] = true;

    if (showOption) {
      if (['Space', 'Enter', 'KeyM', 'Escape'].includes(e.code)) showOption = false;
      return;
    }

    if (showGacha) {
      if (gachaMenuState === 0) {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') gachaSelIndex = (gachaSelIndex + 3) % 4;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') gachaSelIndex = (gachaSelIndex + 1) % 4;
        if (e.code === 'Space' || e.code === 'Enter') {
          if (gachaSelIndex === 0) gachaMenuState = 1;
          else if (gachaSelIndex === 1) gachaMenuState = 2;
          else if (gachaSelIndex === 2) gachaTopMsg = '※期間限定ガチャは現在開催されていません';
          else if (gachaSelIndex === 3) showGacha = false;
        }
        if (e.code === 'KeyM' || e.code === 'Escape') showGacha = false;
      } else {
        if (['Space', 'Enter', 'KeyM', 'Escape'].includes(e.code)) gachaMenuState = 0;
      }
      return;
    }

    if (ve) {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { if (vePage === 0) vePage = 1; return; }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') { if (vePage === 1) vePage = 0; return; }
      if (['Space', 'Enter', 'KeyM', 'Escape'].includes(e.code)) { ve = false; vePage = 0; }
      return;
    }

    if (netStatus === 'WAITING' || netStatus === 'CONNECTING') {
      if (['Space', 'Enter', 'KeyM', 'Escape'].includes(e.code)) {
        netStatus = '';
        if (peer) { peer.destroy(); peer = null; conn = null; }
      }
      return;
    }

    if (ms) {
      const mo = [0, 6, 1, 2, 3, 4, 5];
      let ci = mo.indexOf(gm);
      if (ci < 0) ci = 0;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') gm = mo[(ci + 6) % 7];
      if (e.code === 'ArrowDown' || e.code === 'KeyS') gm = mo[(ci + 1) % 7];
      if (e.code === 'Space' || e.code === 'Enter') init(0);
      return;
    }

    if (!go && !win && !ms && cd <= 0) {
      if (airWalkTimer > 0 && ['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        b.vy = -9;
        for (let i = 0; i < 6; i++) {
          pt.push({ x: b.x + (Math.random() - 0.5) * 10, y: b.y + b.r, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2 + 1, c: '#ff00ff', l: 15, ml: 15, sz: Math.random() * 2 + 1 });
        }
      }
      if (e.code === 'Enter') {
        if (uc >= 30) {
          uc = 0;
          if (curUltraIdx === 0) {
            b.vy = -30;
            for (let i = 0; i < 35; i++) {
              let a = Math.random() * Math.PI * 2, sp = Math.random() * 8 + 4;
              pt.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: i % 2 === 0 ? '#ff00ff' : '#00ffff', l: 30, ml: 30, sz: Math.random() * 4 + 2 });
            }
          } else if (curUltraIdx === 1) {
            airWalkTimer = 120;
            for (let i = 0; i < 35; i++) {
              let a = Math.random() * Math.PI * 2, sp = Math.random() * 8 + 4;
              pt.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: '#ff00ff', l: 30, ml: 30, sz: Math.random() * 4 + 2 });
            }
          } else if (curUltraIdx === 2) {
            allStopTimer = 300;
            for (let i = 0; i < 35; i++) {
              let a = Math.random() * Math.PI * 2, sp = Math.random() * 8 + 4;
              pt.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: '#ffff00', l: 30, ml: 30, sz: Math.random() * 4 + 2 });
            }
          } else if (curUltraIdx === 3) {
            yellowWorldTimer = 180;
            for (let i = 0; i < 35; i++) {
              let a = Math.random() * Math.PI * 2, sp = Math.random() * 8 + 4;
              pt.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: '#ffcc00', l: 30, ml: 30, sz: Math.random() * 4 + 2 });
            }
          }
        }
      }
    }

    if (go || win) {
      if (e.code === 'KeyM') {
        ms = true; go = false; win = false;
        if (peer) { peer.destroy(); peer = null; conn = null; }
      }
      if (e.code === 'KeyR') { init(0); }
      return;
    }
  };

  const ku = e => {
    k[e.code] = false;
    if (!go && !win && !ms && cd <= 0 && (e.code === 'ArrowDown' || e.code === 'KeyS')) {
      if (jc > 0 && b.vy > -9) {
        let ct = gm === 1 ? 24 : 48;
        if (chg >= ct) {
          b.vy = b.jf * 1.6; jc--;
          for (let i = 0; i < 25; i++) {
            let a = Math.random() * Math.PI * 2, sp = Math.random() * 5 + 3;
            pt.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: '#ffff00', l: 25, ml: 25, sz: Math.random() * 4 + 2 });
          }
        } else if (chg > 0) {
          b.vy = b.jf; jc--;
          for (let i = 0; i < 10; i++) {
            pt.push({ x: b.x, y: b.y + b.r, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 1, c: '#00ffff', l: 15, ml: 15, sz: Math.random() * 2.5 + 1 });
          }
        }
      }
      chg = 0;
    }
  };

  document.addEventListener('keydown', kd);
  document.addEventListener('keyup', ku);

  function update() {
    if (ms || go || win) return;
    if (cd > 0) { cd--; chg = 0; return; }
    if (cd > -30) cd--;
    tm++;
    if (ftm > 0) ftm--;

    if (airWalkTimer > 0) {
      airWalkTimer--; jc = 999;
      if (airWalkTimer === 0) jc = 0;
      if (Math.random() < 0.8) {
        pt.push({ x: b.x + (Math.random() - 0.5) * b.r * 2, y: b.y + b.r, vx: (Math.random() - 0.5) * 2, vy: Math.random() * 2, c: '#ff00ff', l: 15, ml: 15, sz: Math.random() * 3 + 1 });
      }
    }
    if (allStopTimer > 0) {
      allStopTimer--;
      if (Math.random() < 0.4) {
        pt.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, vx: 0, vy: -1, c: '#ffff00', l: 20, ml: 20, sz: Math.random() * 2 + 1 });
      }
    }
    if (yellowWorldTimer > 0) {
      yellowWorldTimer--;
      if (Math.random() < 0.4) {
        pt.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, vx: 0, vy: -1, c: '#ffcc00', l: 20, ml: 20, sz: Math.random() * 2 + 1 });
      }
    }
    if (bigTm > 0) { bigTm--; b.r = 20; } else { b.r = 10; }
    if (monoTm > 0) monoTm--;

    if (jc > 0 && (k['ArrowDown'] || k['KeyS']) && b.vy > -9) {
      chg++;
      let ct = gm === 1 ? 24 : 48;
      if (Math.random() < 0.6) {
        let a = Math.random() * Math.PI * 2, di = 30 + Math.random() * 20, px = b.x + Math.cos(a) * di, py = b.y + Math.sin(a) * di;
        pt.push({ x: px, y: py, vx: (b.x - px) * 0.15, vy: (b.y - py) * 0.15, c: chg >= ct ? '#ffff00' : '#ff33cc', l: 10, ml: 10, sz: Math.random() * 2 + 1 });
      }
    } else {
      chg = 0;
    }

    let lp = k['ArrowLeft'] || k['KeyA'], rp = k['ArrowRight'] || k['KeyD'];
    if (cl > 0) {
      cl--;
    } else {
      if (rp && !prf && lh >= 12 && dc > 0) {
        let m = (dc === 1 ? Math.SQRT2 : 1);
        b.vx = 6.5 * m; b.vy = -6.0 * m; cl = 0; chg = 0; dc--;
        for (let i = 0; i < 12; i++) pt.push({ x: b.x, y: b.y, vx: (Math.random() - 0.7) * 4 * m, vy: (Math.random() - 0.5) * 4 * m, c: '#ff9900', l: 15, ml: 15, sz: Math.random() * 2 + 1 });
        lh = 0;
      } else if (lp && !plf && rh >= 12 && dc > 0) {
        let m = (dc === 1 ? Math.SQRT2 : 1);
        b.vx = -6.5 * m; b.vy = -6.0 * m; cl = 0; chg = 0; dc--;
        for (let i = 0; i < 12; i++) pt.push({ x: b.x, y: b.y, vx: (Math.random() - 0.3) * 4 * m, vy: (Math.random() - 0.5) * 4 * m, c: '#ff9900', l: 15, ml: 15, sz: Math.random() * 2 + 1 });
        rh = 0;
      } else {
        if (k['ArrowLeft'] || k['KeyA']) {
          b.vx -= 0.8; if (b.vx < -5.5) b.vx = -5.5;
        } else if (k['ArrowRight'] || k['KeyD']) {
          b.vx += 0.8; if (b.vx > 5.5) b.vx = 5.5;
        } else {
          b.vx *= 0.85;
        }
      }
    }

    if (lp) lh++; else lh = 0;
    if (rp) rh++; else rh = 0;
    plf = lp; prf = rp;

    if (b.tt > 0) b.tt--;
    b.vy += b.g;
    b.x += b.vx;
    b.y += b.vy;

    if (b.tt <= 0 && (Math.abs(b.vx) > 0.5 || Math.abs(b.vy) > 0.5)) {
      let trt = bTrails[curTrailIdx].t;
      if (trt === 'sparkle' && Math.random() < 0.6) {
        pt.push({ x: b.x + (Math.random() - 0.5) * b.r, y: b.y + (Math.random() - 0.5) * b.r, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1, c: '#ffff00', l: 15, ml: 15, sz: Math.random() * 2.5 + 1 });
      } else if (trt === 'flame' && Math.random() < 0.7) {
        pt.push({ x: b.x + (Math.random() - 0.5) * b.r * 0.8, y: b.y + b.r * 0.5, vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 2 + 1, c: Math.random() < 0.5 ? '#ff3300' : '#ffcc00', l: 12, ml: 12, sz: Math.random() * 3 + 2 });
      } else if (trt === 'bubble' && Math.random() < 0.5) {
        pt.push({ x: b.x + (Math.random() - 0.5) * b.r, y: b.y + (Math.random() - 0.5) * b.r, vx: (Math.random() - 0.5) * 0.8, vy: -Math.random() * 1.5, c: '#00f0ff', l: 20, ml: 20, sz: Math.random() * 2.5 + 1.5 });
      } else if (trt === 'neon' && Math.random() < 0.8) {
        pt.push({ x: b.x, y: b.y, vx: -b.vx * 0.2, vy: -b.vy * 0.2, c: '#ff00aa', l: 10, ml: 10, sz: b.r * 0.6 });
      }
    }

    if (b.x - b.r < 0) { b.x = b.r; b.vx = 8.0; b.vy = -7.5; cl = 22; chg = 0; cs(0, b.y, 1); }
    if (b.x + b.r > cv.width) { b.x = cv.width - b.r; b.vx = -8.0; b.vy = -7.5; cl = 22; chg = 0; cs(cv.width, b.y, -1); }

    if (b.y < cv.height / 2) {
      const d = cv.height / 2 - b.y;
      b.y = cv.height / 2;
      s += Math.round(d) * 2;
      p.forEach(pl => pl.y += d);
      pt.forEach(pa => pa.y += d);
    }

    p.forEach(pl => {
      if (pl.t === 2 || pl.t === 4 || pl.t === 5 || pl.t === 6) {
        if (ftm <= 0 && allStopTimer <= 0) {
          pl.x += pl.vx;
          if (pl.x < 0) { pl.x = 0; pl.vx = -pl.vx; }
          if (pl.x + pl.w > cv.width) { pl.x = cv.width - pl.w; pl.vx = -pl.vx; }
        }
      }

      let isAS = (allStopTimer > 0);
      let curW = isAS ? pl.w * 2 : pl.w;
      let curX = isAS ? pl.x - pl.w * 0.5 : pl.x;
      let effType = (yellowWorldTimer > 0) ? 1 : pl.t;

      if (b.vy > 0 && b.x + b.r > curX && b.x - b.r < curX + curW && b.y + b.r >= pl.y && b.y + b.r - b.vy <= pl.y + 10) {
        if (uc < 30) uc++;
        if (gm === 6 && !seenTypes[effType]) {
          seenTypes[effType] = true;
          platBannerTimer = 180;
          platBannerInfo = pi[effType];
        }

        b.vy = b.jf * ((effType === 1 || effType === 5) ? 1.5 : (effType === 10 ? 2 : 1));
        b.y = pl.y - b.r;
        jc = gm === 1 ? 2 : 1;
        chg = 0; lh = 0; rh = 0; dc = 2;

        if (effType === 3 || effType === 4 || effType === 6 || effType === 7) {
          const ec = effType === 3 ? '#cc33ff' : (effType === 4 ? '#ff00aa' : (effType === 6 ? '#0099ff' : '#00f0ff'));
          for (let i = 0; i < 15; i++) {
            pt.push({ x: pl.x + pl.w / 2 + (Math.random() - 0.5) * 50, y: pl.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 1) * 5, c: ec, l: 25, ml: 25, sz: Math.random() * 3 + 1.5 });
          }
          pl.y = cv.height + 100;
          if (effType === 6 || effType === 7) { b.tt = 12; }
        }

        if (effType === 8) {
          ftm = 60;
          for (let i = 0; i < 15; i++) {
            pt.push({ x: pl.x + pl.w / 2 + (Math.random() - 0.5) * 50, y: pl.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 1) * 4, c: '#ffffff', l: 20, ml: 20, sz: Math.random() * 2 + 1 });
          }
        }

        if (effType === 9) {
          for (let i = 0; i < 15; i++) {
            pt.push({ x: pl.x + pl.w / 2 + (Math.random() - 0.5) * 50, y: pl.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 1) * 4, c: '#555555', l: 20, ml: 20, sz: Math.random() * 2 + 1 });
          }
          let am = p.filter(x => x.y < cv.height && x !== pl);
          let dCnt = Math.floor(p.filter(x => x.y < cv.height).length / 2);
          am.sort(() => Math.random() - 0.5);
          for (let i = 0; i < Math.min(dCnt, am.length); i++) am[i].y = cv.height + 100;
          pl.y = cv.height + 100;
        }

        if (effType === 10) {
          bigTm = 60;
          for (let i = 0; i < 15; i++) {
            pt.push({ x: pl.x + pl.w / 2 + (Math.random() - 0.5) * 50, y: pl.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 1) * 4, c: '#8b4513', l: 20, ml: 20, sz: Math.random() * 2 + 1 });
          }
        }

        if (effType === 11) {
          monoTm = 60;
          for (let i = 0; i < 15; i++) {
            pt.push({ x: pl.x + pl.w / 2 + (Math.random() - 0.5) * 50, y: pl.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 1) * 4, c: '#c0c0c0', l: 20, ml: 20, sz: Math.random() * 2 + 1 });
          }
        }
      }

      if (pl.y > cv.height) {
        pl.y = Math.min(...p.map(x => x.y)) - (55 + Math.random() * 35);
        pl.x = Math.random() * (cv.width - pl.w);
        setPlatformType(pl, s);
      }
    });

    pt.forEach(pa => {
      pa.x += pa.vx; pa.y += pa.vy;
      if (pa.c === '#ff9900' || pa.c === '#00ffff' || pa.c === '#ffff00' || pa.c === '#cc33ff' || pa.c === '#ff00aa' || pa.c === '#0099ff' || pa.c === '#00f0ff' || pa.c === '#c0c0c0' || pa.c === '#ff3300') {
        pa.vy += 0.15;
      }
      pa.l--;
    });
    pt = pt.filter(pa => pa.l > 0);

    if (gm === 6) {
      if (storyStage === 1 && s >= 3000) {
        storyStage = 2; storyBannerTimer = 150;
        if (storyMax < 2) { storyMax = 2; try { localStorage.setItem('jg_story_max', '2'); } catch (e) {} }
      } else if (storyStage === 2 && s >= 8000) {
        storyStage = 3; storyBannerTimer = 150;
        if (storyMax < 3) { storyMax = 3; try { localStorage.setItem('jg_story_max', '3'); } catch (e) {} }
      } else if (storyStage === 3 && s >= 15000) {
        storyStage = 4; storyBannerTimer = 150;
        if (storyMax < 4) { storyMax = 4; try { localStorage.setItem('jg_story_max', '4'); } catch (e) {} }
      } else if (storyStage === 4 && s >= 25000) {
        win = true;
        if (storyMax < 5) { storyMax = 5; try { localStorage.setItem('jg_story_max', '5'); } catch (e) {} }
      }
    }

    if (gm === 2 && s >= 10000) {
      s = 10000; win = true;
      let ft = tm / 60;
      if (ft < bt) { bt = ft; try { localStorage.setItem('jg_bt', bt.toFixed(2)); } catch (e) {} nr = true; }
    }
    if (gm === 3 && s >= 100000) {
      s = 100000; win = true;
      let ft = tm / 60;
      if (ft < bt100) { bt100 = ft; try { localStorage.setItem('jg_bt100', bt100.toFixed(2)); } catch (e) {} nr = true; }
    }
    if (gm === 1 && tm >= 3600) {
      tm = 3600; win = true;
      if (s > gn) { gn = s; try { localStorage.setItem('jg_gn_v2', gn); } catch (e) {} nr = true; }
    }

    if (b.y - b.r > cv.height) {
      go = true;
      if (gm === 0 && s > hi) { hi = s; try { localStorage.setItem('jg_hi_v2', hi); } catch (e) {} nr = true; }
      if (gm === 1 && s > gn) { gn = s; try { localStorage.setItem('jg_gn_v2', gn); } catch (e) {} nr = true; }
      if (gm === 4 && s > cp) { cp = s; try { localStorage.setItem('jg_cp_v2', cp); } catch (e) {} nr = true; }
      if (gm === 5 && s > tp) { tp = s; try { localStorage.setItem('jg_tp_v2', tp); } catch (e) {} nr = true; }
    }

    if (conn && conn.open) {
      conn.send({
        t: 'sync', x: b.x, y: b.y, r: b.r, s: s, go: go, win: win, tt: b.tt, tm: tm,
        col: curColorIdx, pat: curPatternIdx, tra: curTrailIdx, allStop: allStopTimer, yellowWorld: yellowWorldTimer,
        p: p.map(pl => ({ x: pl.x, y: pl.y, w: pl.w, h: pl.h, t: pl.t, vx: pl.vx }))
      });
    }
  }

  function drawBallWithPatternOn(cCtx, cx, cy, r, colIdx, patIdx) {
    cCtx.beginPath();
    cCtx.arc(cx, cy, r, 0, Math.PI * 2);
    let colStr = bColors[colIdx] ? bColors[colIdx].c : '#ff3131';
    if (colStr === 'rainbow') colStr = 'hsl(' + ((tm * 6) % 360) + ',100%,60%)';
    cCtx.fillStyle = colStr;
    cCtx.fill();

    let ptnt = bPatterns[patIdx] ? bPatterns[patIdx].t : 'none';
    if (ptnt !== 'none') {
      cCtx.save();
      cCtx.beginPath();
      cCtx.arc(cx, cy, r, 0, Math.PI * 2);
      cCtx.clip();
      cCtx.fillStyle = 'rgba(255,255,255,0.7)';
      cCtx.strokeStyle = 'rgba(255,255,255,0.8)';
      cCtx.lineWidth = 2;
      if (ptnt === 'stripe') {
        cCtx.fillRect(cx - r, cy - r * 0.3, r * 2, r * 0.6);
      } else if (ptnt === 'dots') {
        cCtx.beginPath(); cCtx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.25, 0, Math.PI * 2); cCtx.fill();
        cCtx.beginPath(); cCtx.arc(cx + r * 0.35, cy - r * 0.35, r * 0.25, 0, Math.PI * 2); cCtx.fill();
        cCtx.beginPath(); cCtx.arc(cx, cy + r * 0.3, r * 0.25, 0, Math.PI * 2); cCtx.fill();
      } else if (ptnt === 'star') {
        cCtx.font = 'bold ' + Math.round(r * 1.1) + 'px sans-serif';
        cCtx.textAlign = 'center';
        cCtx.textBaseline = 'middle';
        cCtx.fillText('★', cx, cy);
        cCtx.textBaseline = 'alphabetic';
      } else if (ptnt === 'grid') {
        cCtx.beginPath();
        cCtx.moveTo(cx - r, cy); cCtx.lineTo(cx + r, cy);
        cCtx.moveTo(cx, cy - r); cCtx.lineTo(cx, cy + r);
        cCtx.stroke();
      }
      cCtx.restore();
    }
    cCtx.strokeStyle = '#fff';
    cCtx.lineWidth = 2;
    cCtx.stroke();
    cCtx.closePath();
  }

  function drawBallWithPattern(cx, cy, r, colIdx, patIdx) {
    drawBallWithPatternOn(ctx, cx, cy, r, colIdx, patIdx);
  }

  function drawOp() {
    const opCtx = opCv.getContext('2d');
    opCtx.filter = 'none';
    opCtx.clearRect(0, 0, opCv.width, opCv.height);
    if (!op) return;

    if (op.p && Array.isArray(op.p)) {
      op.p.forEach(pl => {
        let isAS = (op.allStop > 0);
        let curW = isAS ? pl.w * 2 : pl.w;
        let curX = isAS ? pl.x - pl.w * 0.5 : pl.x;
        let drawType = (op.yellowWorld > 0) ? 1 : pl.t;
        opCtx.fillStyle = drawType === 1 ? '#ffcc00' : (drawType === 2 ? '#ff3333' : (drawType === 3 ? '#cc33ff' : (drawType === 4 ? '#ff00aa' : (drawType === 5 ? '#ff9900' : (drawType === 6 ? '#0099ff' : (drawType === 7 ? '#00f0ff' : (drawType === 8 ? '#ffffff' : (drawType === 9 ? '#000000' : (drawType === 10 ? '#8b4513' : (drawType === 11 ? '#c0c0c0' : '#00ff22'))))))))));
        opCtx.fillRect(curX, pl.y, curW, pl.h);
        opCtx.strokeStyle = (isAS || op.yellowWorld > 0) ? '#ffff00' : '#fff';
        opCtx.lineWidth = (isAS || op.yellowWorld > 0) ? 2 : 1;
        opCtx.strokeRect(curX, pl.y, curW, pl.h);
      });
    }

    if (!op.go) {
      drawBallWithPatternOn(opCtx, op.x, op.y, op.r || 10, op.col !== undefined ? op.col : 0, op.pat !== undefined ? op.pat : 0);
    }
    opCtx.fillStyle = '#00ffff';
    opCtx.font = 'bold 16px sans-serif';
    opCtx.textAlign = 'left';
    opCtx.fillText('2P SCORE: ' + fn(op.s || 0), 20, 40);

    if (op.go) {
      opCtx.fillStyle = 'rgba(0,0,0,0.85)';
      opCtx.fillRect(0, 0, opCv.width, opCv.height);
      opCtx.fillStyle = '#ff3366';
      opCtx.font = 'bold 28px sans-serif';
      opCtx.textAlign = 'center';
      opCtx.fillText('GAME OVER', 200, 280);
      opCtx.font = '18px sans-serif';
      opCtx.fillStyle = '#fff';
      opCtx.fillText('Score: ' + fn(op.s || 0), 200, 320);
    } else if (op.win) {
      opCtx.fillStyle = 'rgba(0,0,0,0.85)';
      opCtx.fillRect(0, 0, opCv.width, opCv.height);
      opCtx.fillStyle = '#ffcc00';
      opCtx.font = 'bold 28px sans-serif';
      opCtx.textAlign = 'center';
      opCtx.fillText('GAME CLEAR!', 200, 280);
      opCtx.font = '18px sans-serif';
      opCtx.fillStyle = '#fff';
      opCtx.fillText('Score: ' + fn(op.s || 0), 200, 320);
    }
  }

  function draw() {
    if (conn && conn.open) {
      opCv.style.display = 'block';
      drawOp();
    } else {
      opCv.style.display = 'none';
    }
    cb.style.display = showOption ? 'block' : 'none';
    ctx.filter = 'none';
    ctx.clearRect(0, 0, cv.width, cv.height);

    if (netStatus === 'LOADING') {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('オンライン通信ライブラリ読込中...', 200, 300);
      return;
    }

    if (netStatus === 'WAITING' || netStatus === 'CONNECTING') {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      if (netStatus === 'WAITING') {
        ctx.fillText('対戦相手の接続を待っています...', 200, 240);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('部屋コード: ' + roomCode, 200, 300);
        ctx.fillStyle = '#aaa';
        ctx.font = '14px sans-serif';
        ctx.fillText('相手にこの4桁コードを伝えてください', 200, 350);
      } else {
        ctx.fillText('部屋 ' + roomCode + ' に接続中...', 200, 280);
      }
      ctx.fillStyle = '#ff3366';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('【Mキー または 画面クリック でキャンセル】', 200, 450);
      return;
    }

    if (showOption) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚙ オプション設定', 200, 60);

      ctx.fillStyle = '#222';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.fillRect(40, 120, 320, 80);
      ctx.strokeRect(40, 120, 320, 80);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('画面の位置', 60, 152);
      ctx.fillStyle = '#aaa';
      ctx.font = '11px sans-serif';
      ctx.fillText('ゲーム画面の表示位置（中央 / 右寄せ）', 60, 175);

      ctx.fillStyle = isRightPos ? '#113344' : '#005544';
      ctx.strokeStyle = isRightPos ? '#00f0ff' : '#00ffaa';
      ctx.lineWidth = 2;
      ctx.fillRect(250, 138, 95, 40);
      ctx.strokeRect(250, 138, 95, 40);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isRightPos ? '⇄ 右' : '⇄ 中央', 297, 163);

      ctx.fillStyle = '#222';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.fillRect(140, 515, 120, 38);
      ctx.strokeRect(140, 515, 120, 38);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('戻 る', 200, 539);
      return;
    }

    if (showGacha) {
      tm++;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, cv.width, cv.height);

      if (gachaMenuState === 0) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ガチャメニュー', 200, 42);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText('↑ / ↓ キーまたはクリックで選択', 200, 57);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('BP: ' + fn(bp) + ' BP | 🎟 所持チケット: ' + fn(tickets) + ' 枚', 200, 72);

        const gList = [
          { n: 'カスタムガチャ', d: 'カラー・模様・トレイルなどの見た目をGET！', s: 'カスタム解放', c: '#00f0ff', g: 'rgba(0,240,255,0.1)' },
          { n: 'ウルトラガチャ', d: '強力な必殺スキル（ウルトラ）を獲得＆装備！', s: 'スキル解放', c: '#ff00ff', g: 'rgba(255,0,255,0.1)' },
          { n: '期間限定ガチャ', d: 'イベント限定のスペシャルアイテムが登場予定！', s: '準備中', c: '#ffaa00', g: 'rgba(255,170,0,0.1)' }
        ];

        gList.forEach((g, x) => {
          let ty = 100 + x * 75;
          let sel = (gachaSelIndex === x);
          ctx.strokeStyle = sel ? g.c : '#444';
          ctx.lineWidth = sel ? 2.5 : 1.5;
          ctx.fillStyle = sel ? g.g : '#222';
          ctx.fillRect(35, ty, 330, 60);
          ctx.strokeRect(35, ty, 330, 60);
          ctx.fillStyle = sel ? g.c : '#aaa';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText((sel ? '► ' : '') + g.n, 50, ty + 24);
          ctx.fillStyle = sel ? '#fff' : '#888';
          ctx.font = '10.5px sans-serif';
          ctx.fillText(g.d, 50, ty + 44);
          ctx.textAlign = 'right';
          ctx.fillStyle = sel ? g.c : '#666';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(g.s, 350, ty + 34);
        });

        if (gachaTopMsg) {
          ctx.fillStyle = '#ff3366';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(gachaTopMsg, 200, 350);
        }

        let selBack = (gachaSelIndex === 3);
        ctx.fillStyle = selBack ? 'rgba(0,240,255,0.2)' : '#222';
        ctx.strokeStyle = selBack ? '#ffff00' : '#00f0ff';
        ctx.lineWidth = selBack ? 2.5 : 1.5;
        ctx.fillRect(140, 515, 120, 38);
        ctx.strokeRect(140, 515, 120, 38);
        ctx.fillStyle = selBack ? '#ffff00' : '#00f0ff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((selBack ? '► ' : '') + '戻 る', 200, 539);
        return;
      }

      if (gachaMenuState === 1) {
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(15, 15, 95, 30);
        ctx.strokeRect(15, 15, 95, 30);
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('＜ ガチャTOP', 62, 34);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('カスタムガチャ', 200, 40);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('🎟 所持チケット: ' + fn(tickets) + ' 枚', 200, 65);

        ctx.save();
        const gBx = 30, gBy = 80, gBw = 340, gBh = 95;
        ctx.fillStyle = '#05080c';
        ctx.fillRect(gBx, gBy, gBw, gBh);
        ctx.fillStyle = 'rgba(0,40,20,0.35)';
        for (let gx = gBx + 2; gx < gBx + gBw; gx += 5) {
          for (let gy = gBy + 2; gy < gBy + gBh; gy += 5) {
            ctx.fillRect(gx, gy, 2.5, 2.5);
          }
        }
        ctx.strokeStyle = '#223344';
        ctx.lineWidth = 4;
        ctx.strokeRect(gBx, gBy, gBw, gBh);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gBx + 2, gBy + 2, gBw - 4, gBh - 4);
        ctx.beginPath();
        ctx.rect(gBx + 4, gBy + 4, gBw - 8, gBh - 8);
        ctx.clip();

        let gDisp = gachaMsg ? gachaMsg.replace('\n', '  ★  ') : '◆ GACHA NEWS ◆ カラー・模様・トレイルが当たる！ ガチャを引いてカスタム解放！';
        let gCol = gachaMsg ? (gachaColor === '#fff' ? '#ffcc00' : gachaColor) : '#00ffcc';
        ctx.font = 'bold 15px monospace';
        let gTw = ctx.measureText(gDisp).width, gTot = gTw + gBw, gSx = (gBx + gBw) - ((tm * 2.5) % gTot);
        ctx.shadowColor = gCol;
        ctx.shadowBlur = 8;
        ctx.fillStyle = gCol;
        ctx.textAlign = 'left';
        ctx.fillText(gDisp, gSx, gBy + 53);
        ctx.shadowBlur = 0;
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = 'rgba(255,170,0,0.85)';
        ctx.fillText('STATUS: ' + (gachaMsg ? 'GET ITEM' : 'STANDBY'), gBx + 10, gBy + 18);
        ctx.fillText('<< LED DISPLAY >>', gBx + gBw - 115, gBy + 82);
        ctx.restore();

        ctx.fillStyle = tickets > 0 ? '#ff00aa' : '#444';
        ctx.strokeStyle = tickets > 0 ? '#ff66cc' : '#666';
        ctx.lineWidth = 2;
        ctx.fillRect(90, 190, 220, 38);
        ctx.strokeRect(90, 190, 220, 38);
        ctx.fillStyle = tickets > 0 ? '#fff' : '#aaa';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('1回引く (チケット1枚)', 200, 214);

        const tabs = ['🎨 カラー', '🏁 模様', '✨ トレイル'];
        tabs.forEach((tName, i) => {
          let tx = 35 + i * 115, ty = 245;
          ctx.fillStyle = gachaTab === i ? '#00f0ff' : '#222';
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.fillRect(tx, ty, 100, 30);
          ctx.strokeRect(tx, ty, 100, 30);
          ctx.fillStyle = gachaTab === i ? '#000' : '#fff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(tName, tx + 50, ty + 19);
        });

        if (gachaTab === 0) {
          for (let i = 0; i < 10; i++) {
            let col = i % 5, row = Math.floor(i / 5), cx = 55 + col * 70, cy = 325 + row * 75;
            if (ownedColors[i]) {
              drawBallWithPattern(cx, cy, 20, i, curPatternIdx);
              if (curColorIdx === i) {
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 3.5;
                ctx.stroke();
                ctx.fillStyle = '#ffff00';
                ctx.font = 'bold 9.5px sans-serif';
                ctx.fillText('装備中', cx, cy + 33);
              } else {
                ctx.fillStyle = '#aaa';
                ctx.font = '9px sans-serif';
                ctx.fillText(bColors[i].n.substring(0, 4), cx, cy + 33);
              }
            } else {
              ctx.beginPath();
              ctx.arc(cx, cy, 20, 0, Math.PI * 2);
              ctx.fillStyle = '#222';
              ctx.fill();
              ctx.strokeStyle = '#555';
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.fillStyle = '#666';
              ctx.font = 'bold 13px sans-serif';
              ctx.fillText('🔒', cx, cy + 4);
            }
          }
        } else if (gachaTab === 1) {
          for (let i = 0; i < 5; i++) {
            let cx = 55 + i * 70, cy = 340;
            if (ownedPatterns[i]) {
              drawBallWithPattern(cx, cy, 20, curColorIdx, i);
              if (curPatternIdx === i) {
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 3.5;
                ctx.stroke();
                ctx.fillStyle = '#ffff00';
                ctx.font = 'bold 9.5px sans-serif';
                ctx.fillText('装備中', cx, cy + 33);
              } else {
                ctx.fillStyle = '#aaa';
                ctx.font = '9px sans-serif';
                ctx.fillText(bPatterns[i].n, cx, cy + 33);
              }
            } else {
              ctx.beginPath();
              ctx.arc(cx, cy, 20, 0, Math.PI * 2);
              ctx.fillStyle = '#222';
              ctx.fill();
              ctx.strokeStyle = '#555';
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.fillStyle = '#666';
              ctx.font = 'bold 9.5px sans-serif';
              ctx.fillText('🔒', cx, cy + 4);
            }
          }
        } else if (gachaTab === 2) {
          for (let i = 0; i < 5; i++) {
            let cx = 55 + i * 70, cy = 340;
            if (ownedTrails[i]) {
              ctx.beginPath();
              ctx.arc(cx, cy, 20, 0, Math.PI * 2);
              ctx.fillStyle = '#333';
              ctx.fill();
              ctx.strokeStyle = '#ff9900';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.fillStyle = '#ff9900';
              ctx.font = 'bold 11px sans-serif';
              ctx.fillText(bTrails[i].n.substring(0, 3), cx, cy + 4);
              if (curTrailIdx === i) {
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 3.5;
                ctx.stroke();
                ctx.fillStyle = '#ffff00';
                ctx.font = 'bold 9.5px sans-serif';
                ctx.fillText('装備中', cx, cy + 33);
              } else {
                ctx.fillStyle = '#aaa';
                ctx.font = '9px sans-serif';
                ctx.fillText(bTrails[i].n, cx, cy + 33);
              }
            } else {
              ctx.beginPath();
              ctx.arc(cx, cy, 20, 0, Math.PI * 2);
              ctx.fillStyle = '#222';
              ctx.fill();
              ctx.strokeStyle = '#555';
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.fillStyle = '#666';
              ctx.font = 'bold 13px sans-serif';
              ctx.fillText('🔒', cx, cy + 4);
            }
          }
        }

        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(140, 515, 120, 38);
        ctx.strokeRect(140, 515, 120, 38);
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('戻 る', 200, 539);

        let smpX = 335, smpFloorY = 525, bounce = Math.abs(Math.sin(tm * 0.08)) * 75, smpY = smpFloorY - bounce, smpR = 14;
        ctx.fillStyle = '#00ff22';
        ctx.fillRect(305, smpFloorY + smpR, 60, 4);

        let trt = bTrails[curTrailIdx].t;
        if (trt === 'sparkle') {
          for (let i = 0; i < 3; i++) {
            let a = tm * 0.15 + i * 2.1;
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(smpX + Math.cos(a) * 16, smpY + Math.sin(a) * 16, 3, 3);
          }
        } else if (trt === 'flame') {
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = (i % 2 === 0) ? '#ff3300' : '#ffcc00';
            ctx.fillRect(smpX + (Math.sin(tm * 0.2 + i) * 8), smpY + smpR - 2 + (i * 3), 4, 4);
          }
        } else if (trt === 'bubble') {
          for (let i = 0; i < 2; i++) {
            let bY = smpY + 5 - ((tm * 2 + i * 12) % 25);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(smpX + (i === 0 ? -8 : 8), bY, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (trt === 'neon') {
          ctx.save();
          ctx.globalAlpha = 0.35;
          drawBallWithPattern(smpX, smpY + bounce * 0.25, smpR * 0.85, curColorIdx, curPatternIdx);
          ctx.restore();
        }
        drawBallWithPattern(smpX, smpY, smpR, curColorIdx, curPatternIdx);
        ctx.fillStyle = '#aaa';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('SAMPLE', smpX, smpFloorY + smpR + 14);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('⚡タップでお試し', smpX, smpFloorY + smpR + 26);
        return;
      }

      if (gachaMenuState === 2) {
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(15, 15, 95, 30);
        ctx.strokeRect(15, 15, 95, 30);
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('＜ ガチャTOP', 62, 34);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('ウルトラガチャ & 装備', 200, 40);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('🎟 所持チケット: ' + fn(tickets) + ' 枚', 200, 65);

        ctx.save();
        const gBx = 30, gBy = 80, gBw = 340, gBh = 95;
        ctx.fillStyle = '#05080c';
        ctx.fillRect(gBx, gBy, gBw, gBh);
        ctx.fillStyle = 'rgba(40,0,40,0.35)';
        for (let gx = gBx + 2; gx < gBx + gBw; gx += 5) {
          for (let gy = gBy + 2; gy < gBy + gBh; gy += 5) {
            ctx.fillRect(gx, gy, 2.5, 2.5);
          }
        }
        ctx.strokeStyle = '#223344';
        ctx.lineWidth = 4;
        ctx.strokeRect(gBx, gBy, gBw, gBh);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gBx + 2, gBy + 2, gBw - 4, gBh - 4);
        ctx.beginPath();
        ctx.rect(gBx + 4, gBy + 4, gBw - 8, gBh - 8);
        ctx.clip();

        let uDisp = uGachaMsg ? uGachaMsg.replace('\n', '  ★  ') : '◆ ULTRA GACHA ◆ 新必殺技「空中ウォーク」「オールストップ」「イエローワールド」登場！ ガチャで解放して装備しよう！';
        let uCol = uGachaMsg ? (uGachaColor === '#fff' ? '#ffcc00' : uGachaColor) : '#ff00ff';
        ctx.font = 'bold 15px monospace';
        let uTw = ctx.measureText(uDisp).width, uTot = uTw + gBw, uSx = (gBx + gBw) - ((tm * 2.5) % uTot);
        ctx.shadowColor = uCol;
        ctx.shadowBlur = 8;
        ctx.fillStyle = uCol;
        ctx.textAlign = 'left';
        ctx.fillText(uDisp, uSx, gBy + 53);
        ctx.shadowBlur = 0;
        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = 'rgba(255,0,255,0.85)';
        ctx.fillText('STATUS: ' + (uGachaMsg ? 'GET SKILL' : 'STANDBY'), gBx + 10, gBy + 18);
        ctx.fillText('<< ULTRA LED >>', gBx + gBw - 110, gBy + 82);
        ctx.restore();

        ctx.fillStyle = tickets > 0 ? '#ff00aa' : '#444';
        ctx.strokeStyle = tickets > 0 ? '#ff66cc' : '#666';
        ctx.lineWidth = 2;
        ctx.fillRect(90, 190, 220, 38);
        ctx.strokeRect(90, 190, 220, 38);
        ctx.fillStyle = tickets > 0 ? '#fff' : '#aaa';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('1回引く (チケット1枚)', 200, 214);

        for (let i = 0; i < ultras.length; i++) {
          let cy = 230 + i * 68;
          let isOwned = ownedUltras[i];
          let isEquipped = (curUltraIdx === i);
          ctx.fillStyle = isEquipped ? 'rgba(0,240,255,0.15)' : '#222';
          ctx.strokeStyle = isEquipped ? '#ffff00' : (isOwned ? ultras[i].c : '#555');
          ctx.lineWidth = isEquipped ? 2.5 : 1.5;
          ctx.fillRect(35, cy, 330, 58);
          ctx.strokeRect(35, cy, 330, 58);

          ctx.fillStyle = isOwned ? ultras[i].c : '#888';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(isOwned ? ultras[i].n : '🔒 ？？？？', 50, cy + 24);

          ctx.fillStyle = isOwned ? '#aaa' : '#666';
          ctx.font = '10.5px sans-serif';
          ctx.fillText(isOwned ? ultras[i].d : 'ガチャで解放可能', 50, cy + 44);

          ctx.textAlign = 'right';
          if (isEquipped) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('【装備中】', 350, cy + 34);
          } else if (isOwned) {
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('タップで装備', 350, cy + 34);
          } else {
            ctx.fillStyle = '#666';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('未解放', 350, cy + 34);
          }
        }

        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(140, 515, 120, 38);
        ctx.strokeRect(140, 515, 120, 38);
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('戻 る', 200, 539);
        return;
      }
    }

    if (ve) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('足場記録 (' + (vePage + 1) + '/2)', 200, 45);

      let ids = vePage === 0 ? [0, 1, 2, 3, 4, 5, 6, 8] : [7, 9, 10, 11];
      for (let idx = 0; idx < ids.length; idx++) {
        let i = ids[idx];
        let col = idx % 2, row = Math.floor(idx / 2), x = col === 0 ? 25 : 215, y = 75 + row * 86;
        ctx.strokeStyle = enc[i] ? '#00ff22' : '#444';
        ctx.fillStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 160, 80);
        ctx.fillRect(x, y, 160, 80);

        if (enc[i]) {
          ctx.fillStyle = pi[i].c;
          ctx.fillRect(x + 10, y + 12, 40, 10);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(x + 10, y + 12, 40, 10);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(pi[i].n, x + 10, y + 38);
          ctx.fillStyle = '#aaa';
          ctx.font = '10px sans-serif';
          ctx.fillText(pi[i].d, x + 10, y + 60);
        } else {
          ctx.fillStyle = '#555';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('？？？？', x + 80, y + 45);
          ctx.fillStyle = '#333';
          ctx.fillRect(x + 10, y + 12, 40, 10);
        }
      }

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      if (vePage === 0) ctx.fillText('次へ ＞', 300, 505);
      if (vePage === 1) ctx.fillText('＜ 前へ', 100, 505);

      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('【画面クリック / Spaceで戻る (A/Dでページ切替)】', 200, 550);
      return;
    }

    if (ms) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ultra Up', 200, 42);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#888';
      ctx.fillText('↑ / ↓ キーでモード選択', 200, 57);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('BP: ' + fn(bp) + ' BP | 🎟 チケット: ' + fn(tickets) + ' 枚', 200, 72);

      const md = [
        { i: 0, n: 'スコアアタック', d: '無限に上を目指してスコアを伸ばす', b: fn(hi) + ' pts', c: '#00ff22', g: 'rgba(0,255,34,0.1)' },
        { i: 6, n: 'ストーリーモード', d: '全4ステージを攻略し電脳タワーを制覇せよ！', b: (storyMax >= 5 ? 'CLEAR!' : 'STAGE ' + (storyMax > 4 ? 4 : storyMax)), c: '#00ffaa', g: 'rgba(0,255,170,0.1)' },
        { i: 1, n: 'ギガジャンプネオ', d: '1分間でスコアを稼ぐ！空中2回＆溜め半分', b: fn(gn) + ' pts', c: '#ff00ff', g: 'rgba(255,0,255,0.1)' },
        { i: 2, n: '10サウザンアタック', d: '10,000スコア到達までのタイムを競う', b: (bt === 999999 ? '--.--s' : bt.toFixed(2) + 's'), c: '#00f0ff', g: 'rgba(0,240,255,0.1)' },
        { i: 3, n: '100サウザンアタック', d: '100,000スコア到達までのタイムを競う', b: (bt100 === 999999 ? '--.--s' : bt100.toFixed(2) + 's'), c: '#0066ff', g: 'rgba(0,102,255,0.1)' },
        { i: 4, n: 'カオススピード', d: 'すべてが2倍速の世界！制御不能 of 高速化', b: fn(cp) + ' pts', c: '#ffaa00', g: 'rgba(255,170,0,0.1)' },
        { i: 5, n: 'トリプルスピード', d: 'すべてが3倍速の超限界世界！光速の領域へ', b: fn(tp) + ' pts', c: '#ff0055', g: 'rgba(255,0,85,0.1)' }
      ];

      md.forEach((m, x) => {
        let ty = 82 + x * 42;
        let sel = (gm === m.i);
        ctx.strokeStyle = sel ? m.c : '#444';
        ctx.fillStyle = sel ? m.g : '#222';
        ctx.strokeRect(40, ty, 320, 38);
        ctx.fillRect(40, ty, 320, 38);
        ctx.fillStyle = sel ? m.c : '#aaa';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(m.n, 200, ty + 12);
        ctx.font = '9px sans-serif';
        ctx.fillStyle = sel ? m.c : '#555';
        ctx.fillText('進行度: ' + m.b, 200, ty + 23);
        ctx.font = '8.5px sans-serif';
        ctx.fillStyle = sel ? '#fff' : '#666';
        ctx.fillText(m.d, 200, ty + 33);
      });

      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('【Space / Enter で開始】', 200, 398);

      ctx.lineWidth = 1.5;
      ctx.fillStyle = '#222'; ctx.strokeStyle = '#00f0ff';
      ctx.strokeRect(25, 420, 105, 35); ctx.fillRect(25, 420, 105, 35);
      ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('足場記録', 77, 442);

      ctx.fillStyle = '#222'; ctx.strokeStyle = '#ff00aa';
      ctx.strokeRect(145, 420, 105, 35); ctx.fillRect(145, 420, 105, 35);
      ctx.fillStyle = '#ff00aa';
      ctx.fillText('ガチャ 🎰', 197, 442);

      ctx.fillStyle = '#222'; ctx.strokeStyle = '#ffcc00';
      ctx.strokeRect(265, 420, 105, 35); ctx.fillRect(265, 420, 105, 35);
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('⚙ オプション', 317, 442);

      ctx.fillStyle = '#222'; ctx.strokeStyle = '#00ffaa';
      ctx.strokeRect(25, 465, 165, 35); ctx.fillRect(25, 465, 165, 35);
      ctx.fillStyle = '#00ffaa';
      ctx.fillText('部屋を作る (HOST)', 107, 487);

      ctx.fillStyle = '#222'; ctx.strokeStyle = '#ff33aa';
      ctx.strokeRect(205, 465, 165, 35); ctx.fillRect(205, 465, 165, 35);
      ctx.fillStyle = '#ff33aa';
      ctx.fillText('部屋に入る (JOIN)', 287, 487);
      return;
    }

    if (monoTm > 0) {
      ctx.filter = 'grayscale(100%)';
    } else {
      ctx.filter = 'none';
    }

    p.forEach(pl => {
      let isAS = (allStopTimer > 0);
      let curW = isAS ? pl.w * 2 : pl.w;
      let curX = isAS ? pl.x - pl.w * 0.5 : pl.x;
      let drawType = (yellowWorldTimer > 0) ? 1 : pl.t;
      ctx.fillStyle = drawType === 1 ? '#ffcc00' : (drawType === 2 ? '#ff3333' : (drawType === 3 ? '#cc33ff' : (drawType === 4 ? '#ff00aa' : (drawType === 5 ? '#ff9900' : (drawType === 6 ? '#0099ff' : (drawType === 7 ? '#00f0ff' : (drawType === 8 ? '#ffffff' : (drawType === 9 ? '#000000' : (drawType === 10 ? '#8b4513' : (drawType === 11 ? '#c0c0c0' : '#00ff22'))))))))));
      ctx.fillRect(curX, pl.y, curW, pl.h);
      ctx.strokeStyle = (isAS || yellowWorldTimer > 0) ? '#ffff00' : '#fff';
      ctx.lineWidth = (isAS || yellowWorldTimer > 0) ? 2 : 1;
      ctx.strokeRect(curX, pl.y, curW, pl.h);
    });

    pt.forEach(pa => {
      ctx.fillStyle = pa.c;
      ctx.globalAlpha = pa.l / pa.ml;
      ctx.beginPath();
      ctx.arc(pa.x, pa.y, pa.sz, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (b.tt <= 0) {
      let ct = gm === 1 ? 24 : 48;
      if (jc > 0 && chg >= ct) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (jc > 0 && chg > 0) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff33cc';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      drawBallWithPattern(b.x, b.y, b.r, curColorIdx, curPatternIdx);
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    let txt = '';
    if (gm === 0) txt = 'SCORE: ' + fn(s) + '  TIME: ' + (tm / 60).toFixed(2) + 's';
    if (gm === 1) txt = 'SCORE: ' + fn(s) + '  TIME: ' + Math.max(0, 60 - (tm / 60)).toFixed(2) + 's';
    if (gm === 2) txt = 'SCORE: ' + fn(s) + '  TIME: ' + (tm / 60).toFixed(2) + 's / 10,000';
    if (gm === 3) txt = 'SCORE: ' + fn(s) + '  TIME: ' + (tm / 60).toFixed(2) + 's / 100,000';
    if (gm === 4) txt = 'SCORE: ' + fn(s) + '  [CHAOS SPEED x2]';
    if (gm === 5) txt = 'SCORE: ' + fn(s) + '  [TRIPLE SPEED x3]';
    if (gm === 6) txt = 'ST: ' + storyStage + '/4  SCORE: ' + fn(s) + ' / ' + fn([3000, 8000, 15000, 25000][storyStage - 1]);
    if (conn && conn.open && op) txt += ' | P2: ' + fn(op.s || 0);
    ctx.fillText(txt, 20, 40);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(250, 12, 130, 18);
    ctx.strokeStyle = airWalkTimer > 0 ? '#ff00ff' : (allStopTimer > 0 ? '#ffff00' : (yellowWorldTimer > 0 ? '#ffcc00' : (uc >= 30 ? '#00f0ff' : '#555')));
    ctx.lineWidth = 1.5;
    ctx.strokeRect(250, 12, 130, 18);

    let fillW = (uc / 30) * 126;
    ctx.fillStyle = uc >= 30 ? (Math.floor(tm / 8) % 2 === 0 ? '#ff00ff' : '#ffff00') : '#00f0ff';
    ctx.fillRect(252, 14, fillW, 14);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    if (airWalkTimer > 0) {
      ctx.fillStyle = '#ff00ff';
      ctx.fillText('空中ウォーク! ' + (airWalkTimer / 60).toFixed(1) + 's', 315, 25);
    } else if (allStopTimer > 0) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText('全停止＆倍幅! ' + (allStopTimer / 60).toFixed(1) + 's', 315, 25);
    } else if (yellowWorldTimer > 0) {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('イエローワールド! ' + (yellowWorldTimer / 60).toFixed(1) + 's', 315, 25);
    } else if (uc >= 30) {
      ctx.fillText('ULTRA READY [Enter]', 315, 25);
    } else {
      ctx.fillText('ULTRA: ' + uc + '/30 (' + ultras[curUltraIdx].n.substring(0, 4) + ')', 315, 25);
    }

    if (gm === 6 && storyBannerTimer > 0) {
      storyBannerTimer--;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(20, 60, 360, 45);
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 60, 360, 45);
      ctx.fillStyle = '#00ffaa';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';

      const stTitles = ['STAGE 1: 起動 - Dawn of Tower', 'STAGE 2: 浸食 - Moving Matrix', 'STAGE 3: 加速 - Hyper Core', 'STAGE 4: 決戦 - Apex Zone'];
      const stSub = ['目標: 3,000pt 到達！', '目標: 8,000pt 到達！', '目標: 15,000pt 到達！', '目標: 25,000pt 脱出成功！'];
      ctx.fillText(stTitles[storyStage - 1], 200, 78);
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.fillText(stSub[storyStage - 1], 200, 95);
    }

    if (gm === 6 && platBannerTimer > 0) {
      platBannerTimer--;
      let topY = (storyBannerTimer > 0) ? 112 : 60;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(20, topY, 360, 45);

      let bc = platBannerInfo.c === '#000000' ? '#ffffff' : platBannerInfo.c;
      ctx.strokeStyle = bc;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, topY, 360, 45);
      ctx.fillStyle = bc;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('【新足場ガイド】' + platBannerInfo.n, 200, topY + 18);
      ctx.fillStyle = '#fff';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(platBannerInfo.d, 200, topY + 35);
    }

    // 途切れていた描画処理の補完 (Game Over / Clear 画面)
    if (go) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, cv.width, cv.height);

      if (nr && Math.floor(Date.now() / 250) % 2 === 0) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEW RECORD!', 200, 180);
      }
      ctx.fillStyle = '#ff3366';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 200, 240);

      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.fillText('SCORE: ' + fn(s), 200, 290);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Rキー : リトライ', 200, 350);
      ctx.fillText('Mキー : メニューへ戻る', 200, 380);

    } else if (win) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, cv.width, cv.height);

      if (nr && Math.floor(Date.now() / 250) % 2 === 0) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEW RECORD!', 200, 180);
      }
      ctx.fillStyle = '#00ffaa';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME CLEAR!', 200, 240);

      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.fillText('SCORE: ' + fn(s), 200, 290);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Rキー : リトライ', 200, 350);
      ctx.fillText('Mキー : メニューへ戻る', 200, 380);
    }
  }

  // メインゲームループの定義と開始
  function gameLoop() {
    update();
    draw();
    aid = requestAnimationFrame(gameLoop);
  }

  gameLoop();
}