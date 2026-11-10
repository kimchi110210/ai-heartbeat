/* 게임 엔진: 배경 / 대사 / 선택지 출력. 보통은 고칠 필요가 없고, 내용은 scenes.js 에서 작성하세요. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), textEl = $('text'), nameEl = $('name'), nextEl = $('next'),
      choicesEl = $('choices'), spriteEl = $('sprite'), endEl = $('ending'),
      bgEls = [$('bg0'), $('bg1')];

  var state, mode = 'idle';           // mode: text(출력 중) / wait(클릭 대기) / choice / end / error
  var typer = null, fullText = '', curBg = -1, curKey = null, spriteKey = null, curChoices = [];

  function newState() { return { scene: null, step: 0, flags: {}, playerName: '', done: {} }; }

  /* {name} -> 주인공 이름. {name:은} {name:이} {name:을} {name:과} {name:아} 는 받침에 맞게 조사까지 붙여줌 */
  var JOSA = { '은': ['은', '는'], '이': ['이', '가'], '을': ['을', '를'], '과': ['과', '와'], '아': ['아', '야'] };
  function hasBatchim(s) { var c = s.charCodeAt(s.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; }
  function fmt(s) {
    var n = state.playerName || '주인공';
    return String(s).replace(/\{name(?::(.))?\}/g, function (_, j) {
      return (j && JOSA[j]) ? n + JOSA[j][hasBatchim(n) ? 0 : 1] : n;
    });
  }

  /* ---------- 배경 / 캐릭터 ---------- */
  function setBackground(key) {
    if (!key || key === curKey) return;
    var url = BACKGROUNDS[key];
    if (!url) { console.warn('[배경 없음] BACKGROUNDS 에 "' + key + '" 가 없어요'); return; }
    curKey = key;
    var nxt = curBg === 0 ? 1 : 0;                       // 두 장을 번갈아 써서 부드럽게 전환
    bgEls[nxt].style.backgroundImage = 'url("' + url + '")';
    bgEls[nxt].classList.add('on');
    if (curBg >= 0) bgEls[curBg].classList.remove('on');
    curBg = nxt;
  }

  function setSprite(key, face) {
    if (!key) { spriteEl.classList.remove('on'); spriteKey = null; return; }
    var c = CHARACTERS[key];
    if (!c) { console.warn('[캐릭터 없음] CHARACTERS 에 "' + key + '" 가 없어요'); return; }
    spriteEl.src = (face && c.faces && c.faces[face]) || c.image;
    spriteEl.alt = c.name || '';
    spriteEl.classList.add('on');
    spriteKey = key;
  }

  /* ---------- 대사 ---------- */
  function typeText(s) {
    clearInterval(typer);
    fullText = s; mode = 'text'; nextEl.classList.remove('on'); textEl.textContent = '';
    if (!s) { doneTyping(); return; }
    var i = 0;
    typer = setInterval(function () {
      i++; textEl.textContent = fullText.slice(0, i);
      if (i >= fullText.length) doneTyping();
    }, 28);
  }
  function doneTyping() {
    clearInterval(typer); textEl.textContent = fullText;
    mode = 'wait'; nextEl.classList.add('on');
  }

  function renderStep() {
    var sc = SCENES[state.scene], steps = sc.steps || [];
    if (state.step >= steps.length) { afterSteps(sc); return; }
    var st = steps[state.step];
    if (st.input) { askName(st.text, st.max, function () { state.step++; renderStep(); }); return; }   // (선택) 장면 중간에 이름을 다시 묻고 싶을 때
    if (st.bg) setBackground(st.bg);                     // 장면 도중 배경 변경도 가능
    if (spriteKey) setSprite(spriteKey, st.face);        // 표정 변경
    var who = st.who === 'player' ? (state.playerName || '주인공')
            : (st.who && CHARACTERS[st.who] ? CHARACTERS[st.who].name : (st.name || ''));
    nameEl.textContent = who; nameEl.hidden = !who;
    typeText(fmt(st.text || ''));
  }

  /* ---------- 이름 입력 ---------- */
  var nameDone = null;
  function askName(prompt, max, done) {
    mode = 'input'; nameDone = done; clearInterval(typer); nextEl.classList.remove('on');
    textEl.textContent = ''; nameEl.hidden = true; $('dialog').hidden = true;
    $('namePrompt').textContent = prompt || '이름을 입력하세요';
    var inp = $('nameInput'); inp.value = state.playerName || ''; inp.maxLength = max || 8;
    $('nameBox').hidden = false;
    setTimeout(function () { inp.focus(); }, 50);
  }
  function submitName() {
    if (mode !== 'input') return;
    state.playerName = $('nameInput').value.trim() || '주인공';
    $('nameBox').hidden = true; $('dialog').hidden = false;
    var d = nameDone; nameDone = null;
    if (d) d();
  }

  function advance() {
    if (mode === 'text') doneTyping();
    else if (mode === 'wait') { state.step++; renderStep(); }
  }

  /* ---------- 장면 흐름 ---------- */
  function goScene(id) {
    var sc = SCENES[id];
    if (!sc) {
      mode = 'error'; nameEl.hidden = false; nameEl.textContent = '오류';
      textEl.textContent = '장면 "' + id + '" 을(를) 찾을 수 없어요. scenes.js 의 이름을 확인하세요.';
      return;
    }
    state.scene = id; state.step = 0;
    setBackground(sc.bg);
    if ('show' in sc) setSprite(sc.show);                // show 를 안 적으면 이전 캐릭터 유지, null 이면 숨김
    renderStep();
  }

  function resolve(next) { return typeof next === 'function' ? next(state) : next; }

  function afterSteps(sc) {
    var list = (sc.choices || []).filter(function (c) { return (!c.if || c.if(state)) && !state.done[doneKey(c)]; });
    if (list.length) { showChoices(list); return; }
    if (sc.battle) { startBattle(sc.battle); return; }    // 장면이 끝나면 전투로
    if (sc.ending) { showEnding(sc.ending); return; }
    if (sc.next) { goScene(resolve(sc.next)); return; }
    console.warn('[다음 장면 없음] "' + state.scene + '" 에 choices / next / ending 중 하나가 필요해요');
    showEnding('END');
  }

  /* ---------- 선택지 ---------- */
  function showChoices(list) {
    mode = 'choice'; curChoices = list; nextEl.classList.remove('on'); choicesEl.innerHTML = '';
    list.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'choice'; b.textContent = (i + 1) + '. ' + fmt(c.text);
      b.addEventListener('click', function (e) { e.stopPropagation(); pick(c); });
      choicesEl.appendChild(b);
    });
    choicesEl.hidden = false;
  }
  function pick(c) {
    if (mode !== 'choice') return;
    choicesEl.hidden = true; choicesEl.innerHTML = '';
    if (c.flags) for (var k in c.flags) state.flags[k] = c.flags[k];
    if (c.battle) { startBattle(c.battle, { key: doneKey(c), repeat: c.repeat }); return; }   // 선택지에 battle 이 있으면 전투로
    goScene(resolve(c.next));
  }

  /* ---------- 전투 ----------
     battle: { enemy: '캐릭터이름' }
       - 이기면: 직전 선택지로 돌아감 (이긴 선택지는 사라짐. 다시 고르게 하려면 선택지에 repeat: true)
                 win: '장면이름' 을 적으면 돌아가는 대신 그 장면으로 이동
       - 지면:   게임 오버 ("(상대 이름)에게 죽었다.")
                 lose: '장면이름' 을 적으면 게임 오버 대신 그 장면으로 이동
       - 그 외:  duration(버틸 시간 초), deathText(게임 오버 문구 직접 지정) */
  function doneKey(c) { return state.scene + '|' + c.text; }

  function startBattle(b, from) {
    var en = CHARACTERS[b.enemy];
    if (!en) {
      mode = 'error'; nameEl.hidden = false; nameEl.textContent = '오류';
      textEl.textContent = '전투 상대 "' + b.enemy + '" 이(가) CHARACTERS 에 없어요.';
      return;
    }
    mode = 'battle'; nextEl.classList.remove('on');
    Battle.start({
      image: en.battleImage || en.image,
      duration: b.duration,
      onEnd: function (r) {
        state.flags.lastBattleEnemy = b.enemy;               // 필요하면 if / next 함수에서 s.flags 로 확인 가능
        state.flags.lastBattleWon = r.won;
        if (r.won) {
          if (from && !from.repeat) state.done[from.key] = true;
          if (b.win) goScene(resolve(b.win));
          else if (from) afterSteps(SCENES[state.scene]);    // 직전 선택지 다시 보여주기
          else goScene(resolve(b.win));
        } else if (b.lose) {
          goScene(resolve(b.lose));
        } else {
          showGameOver(fmt(b.deathText || ((en.name || '상대') + '에게 죽었다.')));
        }
      }
    });
  }

  /* ---------- 엔딩 / 시작 ---------- */
  function showEnding(title) {
    mode = 'end';
    $('endTitle').textContent = fmt(title); $('endTitle').style.color = '';
    $('endInfo').textContent = '';
    endEl.hidden = false;
  }
  function showGameOver(msg) {
    mode = 'end';
    $('endTitle').textContent = 'GAME OVER'; $('endTitle').style.color = '#ff3030';
    $('endInfo').textContent = msg;
    endEl.hidden = false;
  }
  function start() {
    var prev = state ? state.playerName : '';            // '처음부터'로 다시 시작하면 이전 이름이 입력창에 미리 채워짐
    state = newState(); state.playerName = prev;
    endEl.hidden = true; choicesEl.hidden = true; $('nameBox').hidden = true;
    askName('당신의 이름을 알려주세요.', 8, function () { goScene(START_SCENE); });   // 새 게임을 누르면 가장 먼저 이름 입력
  }

  /* ---------- 입력 ---------- */
  stage.addEventListener('click', advance);
  document.addEventListener('keydown', function (e) {
    if (e.repeat) return;
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'KeyZ') {
      if (mode === 'text' || mode === 'wait') { e.preventDefault(); advance(); }
    } else if (mode === 'choice' && /^[1-9]$/.test(e.key)) {
      var c = curChoices[+e.key - 1]; if (c) pick(c);
    }
  });
  $('menuBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    if (confirm('메인 화면으로 돌아갈까요? 진행 상황은 저장되지 않아요.')) location.href = 'index.html';
  });
  $('restartBtn').addEventListener('click', function (e) { e.stopPropagation(); start(); });
  $('homeBtn').addEventListener('click', function (e) { e.stopPropagation(); location.href = 'index.html'; });

  $('nameOk').addEventListener('click', function (e) { e.stopPropagation(); submitName(); });
  $('nameBox').addEventListener('click', function (e) { e.stopPropagation(); });
  $('nameInput').addEventListener('keydown', function (e) {
    e.stopPropagation();                                   // 게임 진행 키와 겹치지 않게
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submitName(); }   // 한글 조합 중 Enter 는 무시
  });

  /* 이미지 미리 불러오기 */
  Object.keys(BACKGROUNDS).forEach(function (k) { new Image().src = BACKGROUNDS[k]; });
  Object.keys(CHARACTERS).forEach(function (k) {
    var c = CHARACTERS[k]; new Image().src = c.image;
    if (c.faces) Object.keys(c.faces).forEach(function (f) { new Image().src = c.faces[f]; });
  });

  start();
})();
