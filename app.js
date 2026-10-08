(() => {
  'use strict';

  // День запуска — замер №1. Набор заданий зависит только от локальной даты,
  // поэтому у всех игроков в один день он одинаковый.
  const LAUNCH = new Date(2026, 9, 8);
  const STORE = 'glazomer:v1';
  const S = 320; // сторона viewBox игрового поля

  const ROUND_IDS = ['time', 'line', 'angle', 'center', 'count'];
  const ICONS = { time: '⏱', line: '📏', angle: '📐', center: '🎯', count: '🔢' };
  const EMOJI = { g: '🟩', y: '🟨', n: '⬛' };

  const I18N = {
    ru: {
      name: 'Глазомер',
      docTitle: 'Глазомер — насколько точен твой глаз?',
      eyebrow: 'Ежедневный замер',
      hero: 'Насколько точен твой <em>глазомер</em>?',
      lede: 'Пять заданий на глаз. Одна попытка в день. Задания у всех одинаковые — есть с кем сравнить.',
      go: 'Начать замер',
      resume: 'Продолжить замер',
      fine: 'Меньше минуты. Линейку убери.',
      kinds: { time: 'Время', line: 'Отрезок', angle: 'Угол', center: 'Центр', count: 'Счёт' },
      prompt: {
        time: 'Останови таймер ровно на <b>{v} с</b>',
        line: 'Отметь <b>{v}%</b> отрезка',
        angle: 'Выставь угол <b>{v}°</b>',
        center: 'Найди центр круга',
        count: 'Сколько здесь точек?',
      },
      hint: {
        time: 'Цифры исчезнут через полторы секунды. Дальше — по ощущениям.',
        line: 'Коснись линии и подвинь метку.',
        angle: 'Потяни за луч.',
        center: 'Коснись там, где, по-твоему, центр.',
        count: 'Точки появятся на секунду. Сосчитать не успеешь — прикидывай.',
      },
      start: 'Старт',
      stop: 'Стоп',
      done: 'Готово',
      show: 'Показать точки',
      next: 'Дальше',
      finish: 'Итог',
      sec: 'секунды',
      s: 'с',
      you: 'Ты',
      target: 'цель',
      actual: 'на самом деле',
      miss: 'Промах',
      ofRadius: 'радиуса',
      guess: 'Твоя оценка',
      verdicts: ['Мимо', 'На троечку', 'Неплохо', 'Очень точно', 'Идеально'],
      tiers: [
        [96, 'Человек-штангенциркуль'],
        [88, 'Глаз-алмаз'],
        [75, 'Плотник от бога'],
        [60, 'Плюс-минус лапоть'],
        [40, 'Мерил в попугаях'],
        [0, 'Срочно к окулисту'],
      ],
      quote: ['«', '»'],
      practice: 'Тренировка',
      share: 'Поделиться в X',
      copy: 'Скопировать результат',
      copied: 'Скопировано',
      streak: 'Серия',
      best: 'Рекорд',
      nextIn: 'Новый замер',
      again: 'Ещё раз',
      home: 'К замеру дня',
      practiceNote: 'Тренировка не идёт в зачёт.',
      foot: 'Новые задания каждый день в полночь.',
    },
    en: {
      name: 'Eyeball',
      docTitle: 'Eyeball — how good is your eye?',
      eyebrow: 'Daily measure',
      hero: 'How good is your <em>eye</em>, really?',
      lede: 'Five tasks, no ruler. One attempt a day. Everyone gets the same set — so you can compare.',
      go: 'Start',
      resume: 'Continue',
      fine: 'Under a minute. Put the ruler away.',
      kinds: { time: 'Time', line: 'Line', angle: 'Angle', center: 'Center', count: 'Count' },
      prompt: {
        time: 'Stop the timer at exactly <b>{v} s</b>',
        line: 'Mark <b>{v}%</b> of the line',
        angle: 'Set the angle to <b>{v}°</b>',
        center: 'Find the center of the circle',
        count: 'How many dots?',
      },
      hint: {
        time: 'The digits vanish after a second and a half. Then it’s all feel.',
        line: 'Tap the line and slide the marker.',
        angle: 'Drag the ray.',
        center: 'Tap where you think the center is.',
        count: 'The dots flash for about a second. No time to count — estimate.',
      },
      start: 'Start',
      stop: 'Stop',
      done: 'Done',
      show: 'Show the dots',
      next: 'Next',
      finish: 'Result',
      sec: 'seconds',
      s: 's',
      you: 'You',
      target: 'target',
      actual: 'actually',
      miss: 'Off by',
      ofRadius: 'of the radius',
      guess: 'Your estimate',
      verdicts: ['Way off', 'Meh', 'Not bad', 'Very close', 'Perfect'],
      tiers: [
        [96, 'Human caliper'],
        [88, 'Laser eyes'],
        [75, 'Solid carpenter'],
        [60, 'Close enough'],
        [40, 'Measured in vibes'],
        [0, 'Book an eye exam'],
      ],
      quote: ['“', '”'],
      practice: 'Practice',
      share: 'Share on X',
      copy: 'Copy result',
      copied: 'Copied',
      streak: 'Streak',
      best: 'Best',
      nextIn: 'Next one in',
      again: 'Again',
      home: 'Back to daily',
      practiceNote: 'Practice doesn’t count.',
      foot: 'New tasks every day at midnight.',
    },
  };

  // ---------- утилиты ----------

  const $ = (sel, root = document) => root.querySelector(sel);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mulberry32(a) {
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || {};
    } catch {
      return {};
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(store));
    } catch {
      // приватный режим или переполненное хранилище — играем без сохранения
    }
  }

  function today() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const dayKey = d => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const dayNo = d => Math.max(1, Math.round((d - LAUNCH) / 864e5) + 1);

  // ---------- состояние ----------

  const store = load();
  const app = $('#app');
  let lang = store.lang || ((navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en');
  let screen = 'home';
  let game = null;
  let cleanups = [];

  const T = () => I18N[lang];
  const num = (v, d = 0) =>
    v.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  // события для Google Analytics; сам счётчик подключён в index.html и на localhost выключен
  const track = (name, params) => {
    if (typeof gtag === 'function') gtag('event', name, params);
  };

  // ---------- задания и очки ----------

  function challenge(seed) {
    const rnd = mulberry32(Math.imul(seed, 2654435761));
    const range = (a, b) => a + rnd() * (b - a);
    const int = (a, b) => Math.floor(range(a, b + 1));

    const time = int(35, 85) / 10;

    // круглые значения слишком легко прикинуть, поэтому кратные пяти пропускаем
    let pct;
    do pct = int(12, 88); while (pct % 5 === 0);
    let ang;
    do ang = int(14, 166); while (ang % 5 === 0 || Math.abs(ang - 90) < 8); // почти прямой угол — тоже подсказка
    let init;
    do init = int(20, 160); while (Math.abs(init - ang) < 30);

    const R = int(62, 108);
    const cx = range(R + 16, S - R - 16);
    const cy = range(R + 16, S - R - 16);

    const want = int(21, 74);
    const dots = [];
    for (let guard = 0; dots.length < want && guard < 20000; guard++) {
      const x = range(22, S - 22);
      const y = range(22, S - 22);
      if (dots.every(d => (d.x - x) ** 2 + (d.y - y) ** 2 > 15 * 15)) dots.push({ x, y });
    }

    return {
      time: { target: time },
      line: { target: pct, x1: int(22, 56), x2: int(264, 298) },
      angle: { target: ang, init },
      center: { cx, cy, R },
      count: { n: dots.length, dots },
    };
  }

  // err — ошибка, zero — ошибка, при которой очки обнуляются
  const score = (err, zero) => Math.round(100 * clamp(1 - err / zero, 0, 1));
  const totalOf = scores => Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const tone = s => (s >= 80 ? 'g' : s >= 50 ? 'y' : 'n');
  const verdictIdx = s => (s >= 95 ? 4 : s >= 80 ? 3 : s >= 60 ? 2 : s >= 35 ? 1 : 0);
  const tier = total => T().tiers.find(([min]) => total >= min)[1];

  function squares(s) {
    const g = Math.floor(s / 20);
    const y = s - g * 20 >= 10 ? 1 : 0;
    return [...'g'.repeat(g), ...'y'.repeat(y), ...'n'.repeat(5 - g - y)];
  }

  // ---------- помощники для поля ----------

  const svg = (inner, interactive = true) =>
    `<svg class="stage__svg${interactive ? '' : ' is-locked'}" viewBox="0 0 ${S} ${S}"${interactive ? ' tabindex="0"' : ''}>${inner}</svg>`;

  function point(el, e) {
    const b = el.getBoundingClientRect();
    return { x: ((e.clientX - b.left) * S) / b.width, y: ((e.clientY - b.top) * S) / b.height };
  }

  function drag(el, fn) {
    let on = false;
    el.addEventListener('pointerdown', e => {
      on = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // указатель уже отпущен — обойдёмся без захвата
      }
      fn(point(el, e));
      e.preventDefault();
    });
    el.addEventListener('pointermove', e => {
      if (on) fn(point(el, e));
    });
    const end = () => {
      on = false;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  function arrows(el, fn) {
    const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    el.addEventListener('keydown', e => {
      const d = dirs[e.key];
      if (!d) return;
      e.preventDefault();
      fn(d[0], d[1], e.shiftKey ? 5 : 1);
    });
  }

  const you = v => `<span class="nb"><i class="dot dot--you"></i>${T().you}: ${v}</span>`;
  const truth = (v, label = T().target) => `<span class="nb"><i class="dot dot--true"></i>${label}: ${v}</span>`;
  const show = el => el.setAttribute('visibility', 'visible');

  // ---------- раунды ----------

  const ROUNDS = {
    time: {
      value: p => num(p.target, 1),
      mount({ stage, action, p, finish, onCleanup }) {
        const L = T();
        stage.innerHTML = `<div class="timer"><div class="timer__num">${num(0, 2)}</div><div class="timer__unit">${L.sec}</div></div>`;
        action.innerHTML = `<button class="btn btn--primary" type="button">${L.start}</button>`;
        const out = $('.timer__num', stage);
        const btn = $('.btn', action);
        const HIDE = 1500;
        const target = p.target * 1000;
        let state = 'idle';
        let t0 = 0;
        let raf = 0;

        const stop = (now = performance.now()) => {
          if (state !== 'run') return;
          state = 'done';
          cancelAnimationFrame(raf);
          const el = now - t0;
          out.classList.remove('is-hidden');
          out.textContent = num(el / 1000, 2);
          finish(
            score(Math.abs(el - target) / target, 0.3),
            `${you(`${num(el / 1000, 2)} ${L.s}`)}${truth(`${num(p.target, 2)} ${L.s}`)}`,
          );
        };

        const tick = now => {
          const el = Math.max(0, now - t0);
          if (el >= target * 3) return stop(t0 + target * 3);
          if (el < HIDE) {
            out.textContent = num(el / 1000, 2);
          } else if (!out.classList.contains('is-hidden')) {
            out.textContent = num(0, 2).replace(/0/g, '?');
            out.classList.add('is-hidden');
          }
          raf = requestAnimationFrame(tick);
        };

        const start = () => {
          state = 'run';
          t0 = performance.now();
          btn.textContent = L.stop;
          btn.classList.replace('btn--primary', 'btn--stop');
          raf = requestAnimationFrame(tick);
        };

        // стоп ловим по нажатию, а не по отпусканию: иначе к ошибке прибавится длина клика
        btn.addEventListener('pointerdown', () => stop());
        btn.addEventListener('click', () => (state === 'idle' ? start() : stop()));
        onCleanup(() => cancelAnimationFrame(raf));
      },
    },

    line: {
      value: p => p.target,
      mount({ stage, action, p, finish }) {
        const y = 172;
        const { x1, x2 } = p;
        stage.innerHTML = svg(`
          <line class="s-ink" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>
          <line class="s-ink" x1="${x1}" y1="${y - 12}" x2="${x1}" y2="${y + 12}"/>
          <line class="s-ink" x1="${x2}" y1="${y - 12}" x2="${x2}" y2="${y + 12}"/>
          <text class="s-lbl" x="${x1}" y="${y + 34}" text-anchor="middle">0</text>
          <text class="s-lbl" x="${x2}" y="${y + 34}" text-anchor="middle">100</text>
          <g class="j-true" visibility="hidden">
            <line class="s-good" x1="0" y1="${y - 8}" x2="0" y2="${y + 40}"/>
            <circle class="s-good-fill" cx="0" cy="${y + 46}" r="6"/>
          </g>
          <g class="j-mark" visibility="hidden">
            <line class="s-acc" x1="0" y1="${y - 40}" x2="0" y2="${y + 8}"/>
            <circle class="s-acc-fill" cx="0" cy="${y - 46}" r="7"/>
          </g>`);
        action.innerHTML = `<button class="btn btn--primary" type="button" disabled>${T().done}</button>`;
        const el = $('svg', stage);
        const mark = $('.j-mark', el);
        const ok = $('.btn', action);
        let x = null;
        let locked = false;

        const set = nx => {
          if (locked) return;
          x = clamp(nx, x1, x2);
          mark.setAttribute('transform', `translate(${x} 0)`);
          show(mark);
          ok.disabled = false;
        };

        drag(el, pt => set(pt.x));
        arrows(el, (dx, dy, k) => set((x ?? (x1 + x2) / 2) + ((dx * (x2 - x1)) / 200) * k));

        ok.addEventListener('click', () => {
          locked = true;
          el.classList.add('is-locked');
          const pct = ((x - x1) / (x2 - x1)) * 100;
          const tr = $('.j-true', el);
          tr.setAttribute('transform', `translate(${x1 + ((x2 - x1) * p.target) / 100} 0)`);
          show(tr);
          finish(score(Math.abs(pct - p.target), 15), `${you(`${num(pct, 1)}%`)}${truth(`${p.target}%`)}`);
        });
      },
    },

    angle: {
      value: p => p.target,
      mount({ stage, action, p, finish }) {
        const vx = 160;
        const vy = 222;
        const len = 128;
        const arcR = 30;
        const at = (a, r) => [vx + r * Math.cos((a * Math.PI) / 180), vy - r * Math.sin((a * Math.PI) / 180)];
        stage.innerHTML = svg(`
          <path class="s-thin j-arc" d=""/>
          <line class="s-ink" x1="${vx}" y1="${vy}" x2="${vx + len}" y2="${vy}"/>
          <line class="s-good j-true" x1="${vx}" y1="${vy}" x2="${vx}" y2="${vy}" visibility="hidden"/>
          <line class="s-acc j-ray" x1="${vx}" y1="${vy}" x2="${vx}" y2="${vy}"/>
          <circle class="s-acc-fill j-knob" r="9"/>
          <circle class="s-dot" cx="${vx}" cy="${vy}" r="4"/>`);
        action.innerHTML = `<button class="btn btn--primary" type="button">${T().done}</button>`;
        const el = $('svg', stage);
        const ray = $('.j-ray', el);
        const knob = $('.j-knob', el);
        const arc = $('.j-arc', el);
        let a = p.init;
        let locked = false;

        const set = na => {
          if (locked) return;
          a = clamp(na, 1, 179);
          const [x, y] = at(a, len);
          ray.setAttribute('x2', x);
          ray.setAttribute('y2', y);
          knob.setAttribute('cx', x);
          knob.setAttribute('cy', y);
          const [ax, ay] = at(a, arcR);
          arc.setAttribute('d', `M ${vx + arcR} ${vy} A ${arcR} ${arcR} 0 0 0 ${ax} ${ay}`);
        };

        set(a);
        drag(el, pt => {
          const v = (Math.atan2(vy - pt.y, pt.x - vx) * 180) / Math.PI;
          // ниже базовой линии угла нет — прижимаем луч к ближайшей стороне
          set(v < 0 ? (pt.x >= vx ? 0 : 180) : v);
        });
        arrows(el, (dx, dy, k) => set(a - (dx + dy) * k));

        $('.btn', action).addEventListener('click', () => {
          locked = true;
          el.classList.add('is-locked');
          const tr = $('.j-true', el);
          const [x, y] = at(p.target, len);
          tr.setAttribute('x2', x);
          tr.setAttribute('y2', y);
          show(tr);
          finish(score(Math.abs(a - p.target), 30), `${you(`${num(a, 1)}°`)}${truth(`${p.target}°`)}`);
        });
      },
    },

    center: {
      mount({ stage, action, p, finish }) {
        const L = T();
        stage.innerHTML = svg(`
          <circle class="s-ink" cx="${p.cx}" cy="${p.cy}" r="${p.R}"/>
          <line class="s-link j-link" visibility="hidden"/>
          <circle class="s-good-fill j-true" cx="${p.cx}" cy="${p.cy}" r="5" visibility="hidden"/>
          <g class="j-mark" visibility="hidden"><path class="s-acc" d="M -10 0 H 10 M 0 -10 V 10"/></g>`);
        action.innerHTML = `<button class="btn btn--primary" type="button" disabled>${L.done}</button>`;
        const el = $('svg', stage);
        const mark = $('.j-mark', el);
        const ok = $('.btn', action);
        let pos = null;
        let locked = false;

        const set = (x, y) => {
          if (locked) return;
          pos = { x: clamp(x, 4, S - 4), y: clamp(y, 4, S - 4) };
          mark.setAttribute('transform', `translate(${pos.x} ${pos.y})`);
          show(mark);
          ok.disabled = false;
        };

        drag(el, pt => set(pt.x, pt.y));
        arrows(el, (dx, dy, k) => {
          const c = pos || { x: S / 2, y: S / 2 };
          set(c.x + dx * k, c.y + dy * k);
        });

        ok.addEventListener('click', () => {
          locked = true;
          el.classList.add('is-locked');
          const err = Math.hypot(pos.x - p.cx, pos.y - p.cy) / p.R;
          const link = $('.j-link', el);
          link.setAttribute('x1', pos.x);
          link.setAttribute('y1', pos.y);
          link.setAttribute('x2', p.cx);
          link.setAttribute('y2', p.cy);
          show(link);
          show($('.j-true', el));
          finish(score(err, 0.35), `<i class="dot dot--true"></i>${L.miss}: ${num(err * 100, 1)}% ${L.ofRadius}`);
        });
      },
    },

    count: {
      mount({ stage, action, p, finish, onCleanup }) {
        const L = T();
        const dots = svg(
          p.dots.map(d => `<circle class="s-dot" cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="5"/>`).join(''),
          false,
        );
        const blank = '<div class="stage__q">?</div>';
        let timer = 0;

        const ask = () => {
          stage.innerHTML = blank;
          action.innerHTML = `
            <div class="guess">
              <button class="step" type="button" data-d="-1" aria-label="−1">−</button>
              <output class="guess__num">—</output>
              <button class="step" type="button" data-d="1" aria-label="+1">+</button>
            </div>
            <input class="slider" type="range" min="1" max="120" value="1" aria-label="${L.guess}">
            <button class="btn btn--primary" type="button" disabled>${L.done}</button>`;
          const out = $('.guess__num', action);
          const slider = $('.slider', action);
          const ok = $('.btn', action);
          let g = 0;

          const set = v => {
            g = clamp(v, 1, 120);
            out.textContent = g;
            slider.value = g;
            ok.disabled = false;
          };

          slider.addEventListener('input', () => set(+slider.value));
          action.querySelectorAll('.step').forEach(b => b.addEventListener('click', () => set(g + +b.dataset.d)));
          ok.addEventListener('click', () => {
            stage.innerHTML = dots;
            finish(score(Math.abs(g - p.n) / p.n, 0.5), `${you(g)}${truth(p.n, L.actual)}`);
          });
        };

        stage.innerHTML = blank;
        action.innerHTML = `<button class="btn btn--primary" type="button">${L.show}</button>`;
        $('.btn', action).addEventListener('click', e => {
          e.currentTarget.disabled = true;
          stage.innerHTML = dots;
          timer = setTimeout(ask, 1200);
        });
        onCleanup(() => clearTimeout(timer));
      },
    },
  };

  // ---------- экраны ----------

  function mountScreen(html) {
    cleanups.forEach(fn => fn());
    cleanups = [];
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function countUp(el, to, ms) {
    if (reduced || to === 0) {
      el.textContent = to;
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = now => {
      const k = clamp((now - t0) / ms, 0, 1);
      el.textContent = Math.round(to * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    cleanups.push(() => cancelAnimationFrame(raf));
  }

  const dailyGame = (date, scores) => ({
    mode: 'daily',
    date,
    key: dayKey(date),
    no: dayNo(date),
    params: challenge(dayKey(date)),
    scores,
  });

  const practiceGame = () => ({
    mode: 'practice',
    date: today(),
    params: challenge((Math.random() * 2 ** 31) | 0),
    scores: [],
  });

  function renderHome() {
    const date = today();
    const key = dayKey(date);
    if (store.last && store.last.key === key) return renderResult(dailyGame(date, store.last.scores));

    const saved = store.cur && store.cur.key === key ? store.cur.scores : [];
    if (saved.length >= ROUND_IDS.length) {
      // все раунды сыграны, но вкладку закрыли до экрана с итогом
      game = dailyGame(date, saved);
      return complete();
    }

    const L = T();
    screen = 'home';
    game = null;
    mountScreen(`
      <section class="home">
        <div class="ruler" aria-hidden="true"></div>
        <p class="eyebrow">${L.eyebrow} · №${dayNo(date)}</p>
        <h1 class="hero">${L.hero}</h1>
        <p class="lede">${L.lede}</p>
        <ul class="kinds">
          ${ROUND_IDS.map(id => `<li><span aria-hidden="true">${ICONS[id]}</span>${L.kinds[id]}</li>`).join('')}
        </ul>
        <button class="btn btn--primary" id="go" type="button">${saved.length ? L.resume : L.go}</button>
        <p class="fine">${L.fine}</p>
      </section>`);
    $('#go').addEventListener('click', () => {
      game = dailyGame(date, saved.slice());
      track('game_start', { mode: 'daily', day: game.no, resumed: saved.length > 0 });
      renderRound();
    });
  }

  function renderRound() {
    const L = T();
    const i = game.scores.length;
    const id = ROUND_IDS[i];
    const def = ROUNDS[id];
    const p = game.params[id];
    screen = 'round';
    mountScreen(`
      <section class="round">
        <ol class="steps" aria-hidden="true">
          ${ROUND_IDS.map((_, k) => `<li class="${k < i ? tone(game.scores[k]) : k === i ? 'is-cur' : ''}"></li>`).join('')}
        </ol>
        <p class="eyebrow">${pad(i + 1)} / ${pad(ROUND_IDS.length)} · ${L.kinds[id]}</p>
        <h2 class="prompt">${L.prompt[id].replace('{v}', def.value ? def.value(p) : '')}</h2>
        <p class="hint">${L.hint[id]}</p>
        <div class="stage"></div>
        <div class="action"></div>
      </section>`);
    const stage = $('.stage', app);
    const action = $('.action', app);
    let finished = false;

    def.mount({
      stage,
      action,
      p,
      onCleanup: fn => cleanups.push(fn),
      finish(pts, detail) {
        if (finished) return;
        finished = true;
        game.scores.push(pts);
        track('round_done', { mode: game.mode, round: id, score: pts });
        if (game.mode === 'daily') {
          store.cur = { key: game.key, scores: game.scores };
          save();
        }
        action.querySelectorAll('button, input').forEach(el => {
          el.disabled = true;
        });
        $('.steps', app).children[i].className = tone(pts);
        // пауза нужна, чтобы «хвост» нажатия на «Стоп» не попал в кнопку «Дальше»
        const t = setTimeout(() => showVerdict(action, pts, detail), 450);
        cleanups.push(() => clearTimeout(t));
      },
    });
  }

  function showVerdict(action, pts, detail) {
    const L = T();
    const last = game.scores.length === ROUND_IDS.length;
    action.innerHTML = `
      <div class="verdict" role="status">
        <div class="verdict__pts"><b>0</b><span>/100</span></div>
        <div class="verdict__txt"><strong>${L.verdicts[verdictIdx(pts)]}</strong><span>${detail}</span></div>
      </div>
      <button class="btn btn--primary" type="button">${last ? L.finish : L.next} →</button>`;
    countUp($('.verdict__pts b', action), pts, 500);
    const btn = $('.btn', action);
    btn.addEventListener('click', () => (last ? complete() : renderRound()));
    btn.focus({ preventScroll: true });
    btn.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }

  function complete() {
    const total = totalOf(game.scores);
    track('game_finish', { mode: game.mode, day: game.no, score: total });
    if (game.mode === 'daily') {
      const prev = new Date(game.date);
      prev.setDate(prev.getDate() - 1);
      store.streak = store.last && store.last.key === dayKey(prev) ? (store.streak || 0) + 1 : 1;
      store.best = Math.max(store.best || 0, total);
      store.last = { key: game.key, scores: game.scores };
      delete store.cur;
      save();
    }
    renderResult(game);
  }

  function shareText(g) {
    const L = T();
    const total = totalOf(g.scores);
    const daily = g.mode === 'daily';
    const head = daily
      ? `${L.name} №${g.no} — ${total}/100${store.streak >= 2 ? ` 🔥${store.streak}` : ''}`
      : `${L.name} · ${L.practice.toLowerCase()} — ${total}/100`;
    const rows = ROUND_IDS.map((id, i) => `${ICONS[id]} ${squares(g.scores[i]).map(c => EMOJI[c]).join('')}`);
    return [head, ...rows, `${L.quote[0]}${tier(total)}${L.quote[1]}`, '', location.origin + location.pathname].join('\n');
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }

  function renderResult(g) {
    const L = T();
    const daily = g.mode === 'daily';
    const total = totalOf(g.scores);
    const d = g.date;
    const text = shareText(g);
    screen = 'result';
    game = g;
    mountScreen(`
      <section class="result">
        <div class="sheet">
          <div class="sheet__head">
            <span>${daily ? `${L.name} №${g.no}` : L.practice}</span>
            <span>${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}</span>
          </div>
          <div class="total"><span class="total__num">0</span><span class="total__of">/100</span></div>
          <div class="stamp">${tier(total)}</div>
          <ul class="rows">
            ${ROUND_IDS.map((id, r) => `
              <li>
                <span class="rows__ico" aria-hidden="true">${ICONS[id]}</span>
                <span>${L.kinds[id]}</span>
                <span class="sq" aria-hidden="true">${squares(g.scores[r]).map((c, k) => `<i class="${c}" style="--i:${r * 5 + k}"></i>`).join('')}</span>
                <span class="rows__pts">${g.scores[r]}</span>
              </li>`).join('')}
          </ul>
        </div>
        <div class="share">
          <a class="btn btn--primary" id="tweet" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}">${L.share}</a>
          <button class="btn" id="copy" type="button">${L.copy}</button>
        </div>
        ${daily
          ? `<div class="meta">
              <div>${L.streak}<b>${store.streak || 1}</b></div>
              <div>${L.best}<b>${store.best ?? total}</b></div>
              <div>${L.nextIn}<b id="cd">—</b></div>
            </div>`
          : `<p class="note">${L.practiceNote}</p>`}
        <div class="stack">
          <button class="btn btn--ghost" id="practice" type="button">${daily ? L.practice : L.again}</button>
          ${daily ? '' : `<button class="btn btn--ghost" id="home" type="button">${L.home}</button>`}
        </div>
      </section>`);

    countUp($('.total__num', app), total, 900);

    const shared = method => track('share', { method, mode: g.mode, score: total });
    $('#tweet').addEventListener('click', () => shared('x'));

    const copyBtn = $('#copy');
    copyBtn.addEventListener('click', async () => {
      if (!(await copyText(text))) return;
      shared('copy');
      copyBtn.textContent = L.copied;
      const t = setTimeout(() => {
        copyBtn.textContent = L.copy;
      }, 1600);
      cleanups.push(() => clearTimeout(t));
    });

    $('#practice').addEventListener('click', () => {
      game = practiceGame();
      track('game_start', { mode: 'practice' });
      renderRound();
    });
    $('#home')?.addEventListener('click', renderHome);

    const cd = $('#cd');
    if (cd) {
      const tick = () => {
        const now = new Date();
        if (dayKey(now) !== g.key) return renderHome(); // наступила полночь — открываем новый замер
        const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const s = Math.max(0, Math.floor((next - now) / 1000));
        cd.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
      };
      const iv = setInterval(tick, 1000);
      cleanups.push(() => clearInterval(iv));
      tick();
    }
  }

  // ---------- шапка и запуск ----------

  function chrome() {
    const L = T();
    document.documentElement.lang = lang;
    document.title = L.docTitle;
    $('#brandName').textContent = L.name;
    $('#dayNo').textContent = `№${dayNo(today())}`;
    $('#lang').textContent = lang === 'ru' ? 'EN' : 'RU';
    $('#foot').textContent = L.foot;
  }

  $('#brand').addEventListener('click', renderHome);
  $('#lang').addEventListener('click', () => {
    lang = lang === 'ru' ? 'en' : 'ru';
    store.lang = lang;
    save();
    if (typeof gtag === 'function') gtag('set', 'user_properties', { ui_lang: lang });
    track('lang_switch', { ui_lang: lang });
    chrome();
    if (screen === 'round') renderRound();
    else if (screen === 'result') renderResult(game);
    else renderHome();
  });

  chrome();
  renderHome();
})();
