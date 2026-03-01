/* ============================================
   Visual Animations for Key Concepts
   Canvas-based and CSS animations with play/pause/step
   ============================================ */

const Animations = (() => {

  /* ---- For-Loop Iterator Animation ---- */
  function createLoopAnimation(container) {
    const items = JSON.parse(container.dataset.items || '["apple","banana","cherry","date","elderberry"]');
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column';
    canvas.style.gap = '20px';

    // Create array display
    const arrayRow = document.createElement('div');
    arrayRow.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;';

    const boxes = items.map((item, i) => {
      const box = document.createElement('div');
      box.style.cssText = `
        padding: 12px 18px; border-radius: 6px; border: 2px solid var(--border);
        background: var(--bg-primary); color: var(--text-secondary); font-family: var(--font-mono);
        font-size: 0.9rem; transition: all 0.4s ease; min-width: 60px; text-align: center;
      `;
      box.textContent = item;
      box.dataset.index = i;
      arrayRow.appendChild(box);
      return box;
    });

    const pointer = document.createElement('div');
    pointer.style.cssText = 'font-size:1rem; color: var(--accent); font-weight:700; text-align:center; font-family: var(--font-mono);';
    pointer.textContent = 'Press Play to start';

    const codeDisplay = document.createElement('div');
    codeDisplay.style.cssText = `
      font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-secondary);
      background: var(--bg-code); padding: 12px 16px; border-radius: 6px; text-align: left; max-width: 400px;
    `;
    codeDisplay.textContent = 'for item in fruits:\n    print(item)';

    canvas.appendChild(arrayRow);
    canvas.appendChild(pointer);
    canvas.appendChild(codeDisplay);

    let currentIndex = -1;
    let intervalId = null;

    function step() {
      currentIndex++;
      if (currentIndex >= items.length) {
        pointer.textContent = 'Loop complete!';
        pointer.style.color = 'var(--success)';
        stop();
        return;
      }
      boxes.forEach((b, i) => {
        if (i === currentIndex) {
          b.style.borderColor = 'var(--accent)';
          b.style.background = 'rgba(56,189,248,0.15)';
          b.style.color = 'var(--accent)';
          b.style.transform = 'scale(1.1)';
        } else if (i < currentIndex) {
          b.style.borderColor = 'var(--success)';
          b.style.background = 'rgba(74,222,128,0.1)';
          b.style.color = 'var(--success)';
          b.style.transform = 'scale(1)';
        } else {
          b.style.borderColor = 'var(--border)';
          b.style.background = 'var(--bg-primary)';
          b.style.color = 'var(--text-secondary)';
          b.style.transform = 'scale(1)';
        }
      });
      pointer.style.color = 'var(--accent)';
      pointer.textContent = `i = ${currentIndex} → item = "${items[currentIndex]}"`;
    }

    function play() { if (!intervalId) intervalId = setInterval(step, 1200); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() {
      stop();
      currentIndex = -1;
      pointer.textContent = 'Press Play to start';
      pointer.style.color = 'var(--accent)';
      boxes.forEach(b => {
        b.style.borderColor = 'var(--border)';
        b.style.background = 'var(--bg-primary)';
        b.style.color = 'var(--text-secondary)';
        b.style.transform = 'scale(1)';
      });
    }

    return { play, pause: stop, step, reset };
  }

  /* ---- Gradient Descent Animation ---- */
  function createGradientDescentAnimation(container) {
    const cvs = document.createElement('canvas');
    cvs.width = 500;
    cvs.height = 250;
    cvs.style.cssText = 'max-width:100%;border-radius:6px;';
    const canvas = container.querySelector('.animation-canvas');
    canvas.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    let ballX = 50;
    let intervalId = null;
    const lr = 0.03;

    function f(x) { return 0.0004 * Math.pow(x - 250, 2) + 30; }
    function df(x) { return 0.0008 * (x - 250); }

    function draw() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, 500, 250);

      // Draw curve
      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 2;
      for (let x = 0; x < 500; x++) {
        const y = f(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw ball
      const y = f(ballX);
      ctx.beginPath();
      ctx.arc(ballX, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      // Label
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText(`Loss: ${(f(ballX) - 30).toFixed(1)}`, ballX + 14, y - 4);
      ctx.fillText('Gradient Descent', 10, 20);
    }

    function step() {
      const grad = df(ballX);
      ballX -= grad / lr;
      ballX = Math.max(10, Math.min(490, ballX));
      draw();
      if (Math.abs(df(ballX)) < 0.5) {
        stop();
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('Converged!', ballX - 30, f(ballX) - 20);
      }
    }

    function play() { draw(); if (!intervalId) intervalId = setInterval(step, 80); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); ballX = 50; draw(); }

    draw();
    return { play, pause: stop, step, reset };
  }

  /* ---- Token Generation Animation ---- */
  function createTokenAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column';
    canvas.style.gap = '16px';

    const prompt = container.dataset.prompt || 'The cat sat on the';
    const tokens = (container.dataset.tokens || 'mat, and, purred, softly').split(',').map(t => t.trim());

    const promptRow = document.createElement('div');
    promptRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;align-items:center;';

    prompt.split(' ').forEach(word => {
      const span = document.createElement('span');
      span.style.cssText = `
        padding: 6px 12px; background: var(--bg-tertiary); border-radius: 4px;
        font-family: var(--font-mono); font-size: 0.88rem; color: var(--text-primary);
      `;
      span.textContent = word;
      promptRow.appendChild(span);
    });

    const generatedRow = document.createElement('div');
    generatedRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:36px;';

    const probDisplay = document.createElement('div');
    probDisplay.style.cssText = `
      font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);
      text-align: center; min-height: 24px;
    `;

    canvas.appendChild(promptRow);
    canvas.appendChild(generatedRow);
    canvas.appendChild(probDisplay);

    let currentToken = -1;
    let intervalId = null;

    function step() {
      currentToken++;
      if (currentToken >= tokens.length) {
        probDisplay.textContent = 'Generation complete!';
        probDisplay.style.color = 'var(--success)';
        stop();
        return;
      }
      const span = document.createElement('span');
      span.style.cssText = `
        padding: 6px 12px; background: rgba(56,189,248,0.2); border: 1px solid var(--accent);
        border-radius: 4px; font-family: var(--font-mono); font-size: 0.88rem; color: var(--accent);
        opacity: 0; transition: opacity 0.3s;
      `;
      span.textContent = tokens[currentToken];
      generatedRow.appendChild(span);
      requestAnimationFrame(() => span.style.opacity = '1');
      probDisplay.style.color = 'var(--text-muted)';
      probDisplay.textContent = `P("${tokens[currentToken]}") = ${(Math.random() * 0.4 + 0.5).toFixed(2)}`;
    }

    function play() { if (!intervalId) intervalId = setInterval(step, 1000); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() {
      stop();
      currentToken = -1;
      generatedRow.textContent = '';
      probDisplay.textContent = 'Press Play to generate tokens';
      probDisplay.style.color = 'var(--text-muted)';
    }

    reset();
    return { play, pause: stop, step, reset };
  }

  /* ---- Decision Tree Splitting Animation ---- */
  function createDecisionTreeAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column';
    canvas.style.gap = '12px';
    canvas.style.alignItems = 'center';

    const data = [
      { label: 'Play', temp: 'Hot', wind: 'Weak' },
      { label: 'No', temp: 'Hot', wind: 'Strong' },
      { label: 'Play', temp: 'Mild', wind: 'Weak' },
      { label: 'Play', temp: 'Cool', wind: 'Weak' },
      { label: 'No', temp: 'Cool', wind: 'Strong' },
      { label: 'Play', temp: 'Mild', wind: 'Weak' },
    ];

    const status = document.createElement('div');
    status.style.cssText = 'font-family: var(--font-mono); font-size: 0.85rem; text-align:center; color: var(--accent);';
    status.textContent = 'Press Play to see the tree split data';

    const tableEl = document.createElement('div');
    tableEl.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;';

    data.forEach(d => {
      const card = document.createElement('div');
      card.style.cssText = `
        padding: 8px 14px; border-radius: 6px; border: 2px solid var(--border);
        font-family: var(--font-mono); font-size: 0.8rem; text-align: center;
        transition: all 0.5s; background: var(--bg-primary); color: var(--text-secondary);
      `;
      card.textContent = `${d.temp}/${d.wind}`;
      card.dataset.label = d.label;
      card.dataset.wind = d.wind;
      tableEl.appendChild(card);
    });

    canvas.appendChild(status);
    canvas.appendChild(tableEl);

    let stepNum = 0;
    let intervalId = null;

    function doStep() {
      stepNum++;
      const cards = tableEl.querySelectorAll('div');
      if (stepNum === 1) {
        status.textContent = 'Step 1: Split on Wind (highest info gain)';
        cards.forEach(c => {
          if (c.dataset.wind === 'Weak') {
            c.style.borderColor = 'var(--success)';
            c.style.background = 'rgba(74,222,128,0.1)';
          } else {
            c.style.borderColor = 'var(--error)';
            c.style.background = 'rgba(248,113,113,0.1)';
          }
        });
      } else if (stepNum === 2) {
        status.textContent = 'Step 2: Wind=Weak → All Play! (Pure node)';
        cards.forEach(c => {
          if (c.dataset.wind === 'Weak') {
            c.style.color = 'var(--success)';
          }
        });
      } else if (stepNum === 3) {
        status.textContent = 'Step 3: Wind=Strong → All No! (Pure node) ✓ Done';
        status.style.color = 'var(--success)';
        cards.forEach(c => {
          if (c.dataset.wind === 'Strong') {
            c.style.color = 'var(--error)';
          }
        });
        stop();
      }
    }

    function play() { if (!intervalId) intervalId = setInterval(doStep, 1500); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() {
      stop();
      stepNum = 0;
      status.textContent = 'Press Play to see the tree split data';
      status.style.color = 'var(--accent)';
      tableEl.querySelectorAll('div').forEach(c => {
        c.style.borderColor = 'var(--border)';
        c.style.background = 'var(--bg-primary)';
        c.style.color = 'var(--text-secondary)';
      });
    }

    return { play, pause: stop, step: doStep, reset };
  }

  /* ---- RAG Retrieval Flow Animation ---- */
  function createRAGAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column';
    canvas.style.gap = '12px';

    const stages = [
      { text: '1. User Query: "What is gradient descent?"', color: 'var(--accent)' },
      { text: '2. Embedding: query → [0.23, -0.45, 0.67, ...]', color: '#a78bfa' },
      { text: '3. Vector Search: Finding top-3 similar chunks...', color: 'var(--warning)' },
      { text: '4. Retrieved: "Gradient descent is an optimization..."', color: 'var(--success)' },
      { text: '5. LLM generates answer using retrieved context', color: 'var(--accent)' },
    ];

    const stageEls = stages.map(s => {
      const el = document.createElement('div');
      el.style.cssText = `
        padding: 10px 16px; border-radius: 6px; border: 1px solid var(--border);
        font-family: var(--font-mono); font-size: 0.82rem;
        opacity: 0.2; transition: all 0.5s; background: var(--bg-primary);
        color: var(--text-muted); max-width: 500px; text-align: left;
      `;
      el.textContent = s.text;
      canvas.appendChild(el);
      return { el, color: s.color };
    });

    let current = -1;
    let intervalId = null;

    function step() {
      current++;
      if (current >= stages.length) { stop(); return; }
      stageEls[current].el.style.opacity = '1';
      stageEls[current].el.style.borderColor = stageEls[current].color;
      stageEls[current].el.style.color = stageEls[current].color;
    }

    function play() { if (!intervalId) intervalId = setInterval(step, 1200); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() {
      stop();
      current = -1;
      stageEls.forEach(s => {
        s.el.style.opacity = '0.2';
        s.el.style.borderColor = 'var(--border)';
        s.el.style.color = 'var(--text-muted)';
      });
    }

    return { play, pause: stop, step, reset };
  }

  /* ---- Agent Loop Animation ---- */
  function createAgentLoopAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column';
    canvas.style.gap = '10px';

    const steps = [
      'Observe: Read user query + context',
      'Think: Decide what tool/action to use',
      'Act: Call search_web("gradient descent")',
      'Observe: Got 5 results from web search',
      'Think: Have enough info, compose answer',
      'Act: Return final response to user',
    ];

    const stepEls = steps.map(s => {
      const el = document.createElement('div');
      el.style.cssText = `
        padding: 8px 14px; border-radius: 6px; border: 1px solid var(--border);
        font-family: var(--font-mono); font-size: 0.82rem;
        opacity: 0.2; transition: all 0.4s; max-width: 450px;
        color: var(--text-muted);
      `;
      el.textContent = s;
      canvas.appendChild(el);
      return el;
    });

    let current = -1;
    let intervalId = null;

    function step() {
      current++;
      if (current >= steps.length) { stop(); return; }
      const colors = ['var(--accent)', '#a78bfa', 'var(--warning)', 'var(--accent)', '#a78bfa', 'var(--success)'];
      stepEls[current].style.opacity = '1';
      stepEls[current].style.borderColor = colors[current];
      stepEls[current].style.color = colors[current];
    }

    function play() { if (!intervalId) intervalId = setInterval(step, 1000); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() {
      stop();
      current = -1;
      stepEls.forEach(el => {
        el.style.opacity = '0.2';
        el.style.borderColor = 'var(--border)';
        el.style.color = 'var(--text-muted)';
      });
    }

    return { play, pause: stop, step, reset };
  }

  /* ---- Git Branching Animation ---- */
  function createGitBranchingAnimation(container) {
    const cvs = document.createElement('canvas');
    cvs.width = 520; cvs.height = 200;
    cvs.style.cssText = 'max-width:100%;border-radius:6px;';
    const canvas = container.querySelector('.animation-canvas');
    canvas.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    const commits = [];
    const branches = { main: { y: 100, color: '#4ade80', commits: [] }, feature: { y: 50, color: '#38bdf8', commits: [] } };
    let stepNum = 0, intervalId = null;

    const steps = [
      () => { commits.push({ x: 60, y: 100, branch: 'main', msg: 'init' }); branches.main.commits.push(0); },
      () => { commits.push({ x: 140, y: 100, branch: 'main', msg: 'feat A' }); branches.main.commits.push(1); },
      () => { commits.push({ x: 220, y: 50, branch: 'feature', msg: 'feat B' }); branches.feature.commits.push(2); },
      () => { commits.push({ x: 300, y: 50, branch: 'feature', msg: 'feat C' }); branches.feature.commits.push(3); },
      () => { commits.push({ x: 380, y: 100, branch: 'main', msg: 'merge', merge: true }); branches.main.commits.push(4); },
      () => { commits.push({ x: 460, y: 100, branch: 'main', msg: 'v1.0' }); branches.main.commits.push(5); },
    ];

    function draw() {
      const dk = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, 520, 200);
      ctx.font = '11px "JetBrains Mono", monospace';

      // Branch labels
      ctx.fillStyle = branches.main.color; ctx.fillText('main', 5, 104);
      if (stepNum >= 3) { ctx.fillStyle = branches.feature.color; ctx.fillText('feature', 5, 54); }

      // Lines
      commits.forEach((c, i) => {
        if (i === 0) return;
        const prev = (c.branch === 'feature' && i === 2) ? commits[1] : commits[i - 1];
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = branches[c.branch].color; ctx.lineWidth = 2; ctx.stroke();
        if (c.merge) {
          ctx.beginPath(); ctx.moveTo(commits[3].x, commits[3].y); ctx.lineTo(c.x, c.y);
          ctx.strokeStyle = branches.feature.color; ctx.stroke();
        }
      });

      // Dots
      commits.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = branches[c.branch].color; ctx.fill();
        ctx.fillStyle = dk ? '#e2e8f0' : '#1e293b';
        ctx.fillText(c.msg, c.x - 14, c.y + 24);
      });
    }

    function step() {
      if (stepNum >= steps.length) { stop(); return; }
      steps[stepNum](); stepNum++; draw();
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 900); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); stepNum = 0; commits.length = 0; branches.main.commits = []; branches.feature.commits = []; ctx.clearRect(0, 0, 520, 200); }

    return { play, pause: stop, step, reset };
  }

  /* ---- Stack & Queue Animation ---- */
  function createStackQueueAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.cssText += 'display:flex;gap:40px;justify-content:center;align-items:flex-start;flex-wrap:wrap;';

    function makeStructure(label, type) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;min-width:140px;';
      const title = document.createElement('div');
      title.style.cssText = 'font-weight:700;font-size:0.9rem;color:var(--accent);font-family:var(--font-mono);';
      title.textContent = label;
      const box = document.createElement('div');
      box.style.cssText = 'display:flex;flex-direction:column;gap:4px;min-height:160px;justify-content:flex-end;border:2px solid var(--border);border-radius:6px;padding:8px;min-width:100px;';
      const info = document.createElement('div');
      info.style.cssText = 'font-size:0.78rem;color:var(--text-muted);font-family:var(--font-mono);text-align:center;min-height:20px;';
      wrap.appendChild(title); wrap.appendChild(box); wrap.appendChild(info);
      return { wrap, box, info, items: [], type };
    }

    const stack = makeStructure('Stack (LIFO)', 'stack');
    const queue = makeStructure('Queue (FIFO)', 'queue');
    canvas.appendChild(stack.wrap); canvas.appendChild(queue.wrap);

    let stepNum = 0, intervalId = null;
    const colors = ['#38bdf8', '#a78bfa', '#4ade80', '#f59e0b', '#f87171'];
    const actions = [
      { action: 'push', val: 'A' }, { action: 'push', val: 'B' }, { action: 'push', val: 'C' },
      { action: 'pop' }, { action: 'push', val: 'D' }, { action: 'pop' },
    ];

    function makeItem(val, color) {
      const el = document.createElement('div');
      el.style.cssText = `padding:6px 16px;border-radius:4px;font-family:var(--font-mono);font-size:0.85rem;text-align:center;color:#fff;background:${color};transition:all 0.3s;`;
      el.textContent = val;
      return el;
    }

    function step() {
      if (stepNum >= actions.length) { stop(); stack.info.textContent = 'Done!'; queue.info.textContent = 'Done!'; return; }
      const a = actions[stepNum];
      if (a.action === 'push') {
        const color = colors[stepNum % colors.length];
        const sEl = makeItem(a.val, color); const qEl = makeItem(a.val, color);
        stack.box.insertBefore(sEl, stack.box.firstChild); stack.items.push({ el: sEl, val: a.val });
        queue.box.appendChild(qEl); queue.items.push({ el: qEl, val: a.val });
        stack.info.textContent = `push(${a.val})`; queue.info.textContent = `enqueue(${a.val})`;
      } else {
        if (stack.items.length) { const top = stack.items.pop(); top.el.remove(); stack.info.textContent = `pop() → ${top.val}`; }
        if (queue.items.length) { const front = queue.items.shift(); front.el.remove(); queue.info.textContent = `dequeue() → ${front.val}`; }
      }
      stepNum++;
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1200); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); stepNum = 0; stack.box.textContent = ''; queue.box.textContent = ''; stack.items = []; queue.items = []; stack.info.textContent = ''; queue.info.textContent = ''; }

    return { play, pause: stop, step, reset };
  }

  /* ---- API Request/Response Cycle Animation ---- */
  function createAPICycleAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '12px'; canvas.style.alignItems = 'center';

    const stages = [
      { text: '1. Client prepares GET /api/weather?city=Tokyo', icon: '💻', color: 'var(--accent)' },
      { text: '2. DNS resolves api.example.com → 93.184.216.34', icon: '🌐', color: '#a78bfa' },
      { text: '3. TCP handshake + TLS negotiation', icon: '🔒', color: 'var(--warning)' },
      { text: '4. Server receives request, queries database', icon: '🖥️', color: '#f59e0b' },
      { text: '5. Server returns 200 OK + JSON body', icon: '📦', color: 'var(--success)' },
      { text: '6. Client parses JSON: {"temp": 22, "status": "sunny"}', icon: '✅', color: 'var(--success)' },
    ];

    const stageEls = stages.map(s => {
      const el = document.createElement('div');
      el.style.cssText = `padding:8px 16px;border-radius:6px;border:1px solid var(--border);font-family:var(--font-mono);font-size:0.82rem;opacity:0.2;transition:all 0.5s;max-width:500px;color:var(--text-muted);text-align:left;width:100%;`;
      el.textContent = `${s.icon} ${s.text}`;
      canvas.appendChild(el);
      return { el, color: s.color };
    });

    let current = -1, intervalId = null;
    function step() { current++; if (current >= stages.length) { stop(); return; } stageEls[current].el.style.opacity = '1'; stageEls[current].el.style.borderColor = stageEls[current].color; stageEls[current].el.style.color = stageEls[current].color; }
    function play() { if (!intervalId) intervalId = setInterval(step, 1000); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); current = -1; stageEls.forEach(s => { s.el.style.opacity = '0.2'; s.el.style.borderColor = 'var(--border)'; s.el.style.color = 'var(--text-muted)'; }); }

    return { play, pause: stop, step, reset };
  }

  /* ---- K-Means Clustering Animation ---- */
  function createKMeansAnimation(container) {
    const cvs = document.createElement('canvas');
    cvs.width = 400; cvs.height = 300;
    cvs.style.cssText = 'max-width:100%;border-radius:6px;';
    const canvas = container.querySelector('.animation-canvas');
    canvas.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    const clusterColors = ['#38bdf8', '#4ade80', '#f87171'];
    const K = 3;
    let points = [], centroids = [], assignments = [], stepNum = 0, intervalId = null;

    function seed() {
      points = []; assignments = [];
      const centers = [[100, 80], [300, 100], [200, 230]];
      centers.forEach(([cx, cy]) => {
        for (let i = 0; i < 12; i++) points.push([cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 80]);
      });
      assignments = points.map(() => -1);
      centroids = [[50, 50], [350, 50], [200, 280]];
    }

    function draw() {
      const dk = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, 400, 300);
      points.forEach((p, i) => {
        ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
        ctx.fillStyle = assignments[i] >= 0 ? clusterColors[assignments[i]] : (dk ? '#475569' : '#94a3b8');
        ctx.fill();
      });
      centroids.forEach((c, i) => {
        ctx.beginPath(); ctx.arc(c[0], c[1], 10, 0, Math.PI * 2);
        ctx.strokeStyle = clusterColors[i]; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = clusterColors[i]; ctx.font = 'bold 12px Inter'; ctx.fillText('C' + (i + 1), c[0] + 12, c[1] + 4);
      });
      ctx.fillStyle = dk ? '#e2e8f0' : '#1e293b'; ctx.font = '12px Inter';
      ctx.fillText(`Iteration: ${stepNum}`, 10, 18);
    }

    function step() {
      if (stepNum > 10) { stop(); return; }
      // Assign
      points.forEach((p, i) => {
        let minD = Infinity, best = 0;
        centroids.forEach((c, j) => { const d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < minD) { minD = d; best = j; } });
        assignments[i] = best;
      });
      // Update centroids
      for (let j = 0; j < K; j++) {
        const pts = points.filter((_, i) => assignments[i] === j);
        if (pts.length) { centroids[j] = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]; }
      }
      stepNum++; draw();
    }

    function play() { if (!intervalId) intervalId = setInterval(step, 800); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); stepNum = 0; seed(); draw(); }

    seed(); draw();
    return { play, pause: stop, step, reset };
  }

  /* ---- Cross-Validation Fold Rotation Animation ---- */
  function createCrossValidationAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '12px'; canvas.style.alignItems = 'center';

    const K = 5;
    const status = document.createElement('div');
    status.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:var(--accent);text-align:center;';
    status.textContent = `${K}-Fold Cross-Validation — Press Play`;

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;';

    const folds = [];
    for (let i = 0; i < K; i++) {
      const el = document.createElement('div');
      el.style.cssText = 'width:70px;height:50px;border-radius:6px;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:0.8rem;transition:all 0.4s;color:var(--text-secondary);';
      el.textContent = `Fold ${i + 1}`;
      grid.appendChild(el);
      folds.push(el);
    }

    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = 'font-family:var(--font-mono);font-size:0.82rem;color:var(--text-muted);text-align:center;min-height:20px;';

    canvas.appendChild(status); canvas.appendChild(grid); canvas.appendChild(scoreEl);

    let current = -1, intervalId = null;
    const scores = [0.92, 0.88, 0.91, 0.94, 0.89];

    function step() {
      current++;
      if (current >= K) { status.textContent = `Done! Mean accuracy = ${(scores.reduce((a, b) => a + b) / K).toFixed(3)}`; status.style.color = 'var(--success)'; stop(); return; }
      folds.forEach((f, i) => {
        if (i === current) { f.style.borderColor = 'var(--warning)'; f.style.background = 'rgba(245,158,11,0.15)'; f.textContent = 'Test'; f.style.color = 'var(--warning)'; }
        else { f.style.borderColor = 'var(--success)'; f.style.background = 'rgba(74,222,128,0.1)'; f.textContent = 'Train'; f.style.color = 'var(--success)'; }
      });
      status.textContent = `Round ${current + 1}/${K}: Fold ${current + 1} is the test set`;
      status.style.color = 'var(--accent)';
      scoreEl.textContent = `Accuracy: ${scores[current]}`;
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1500); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); current = -1; status.textContent = `${K}-Fold Cross-Validation — Press Play`; status.style.color = 'var(--accent)'; scoreEl.textContent = ''; folds.forEach((f, i) => { f.style.borderColor = 'var(--border)'; f.style.background = 'transparent'; f.textContent = `Fold ${i + 1}`; f.style.color = 'var(--text-secondary)'; }); }

    return { play, pause: stop, step, reset };
  }

  /* ---- Confusion Matrix Animation ---- */
  function createConfusionMatrixAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '12px'; canvas.style.alignItems = 'center';

    const status = document.createElement('div');
    status.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:var(--accent);text-align:center;';
    status.textContent = 'Classifying samples...';

    const gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'display:grid;grid-template-columns:auto 1fr 1fr;gap:4px;font-family:var(--font-mono);font-size:0.8rem;';

    const labels = ['', 'Pred: +', 'Pred: -', 'Actual: +', 'TP: 0', 'FN: 0', 'Actual: -', 'FP: 0', 'TN: 0'];
    const cellEls = {};
    labels.forEach((l, i) => {
      const el = document.createElement('div');
      el.style.cssText = 'padding:10px 14px;text-align:center;border-radius:4px;transition:all 0.3s;';
      if (i === 0 || i === 1 || i === 2 || i === 3 || i === 6) el.style.fontWeight = '700';
      if (i === 4) { el.style.background = 'rgba(74,222,128,0.15)'; cellEls.tp = el; }
      if (i === 5) { el.style.background = 'rgba(248,113,113,0.15)'; cellEls.fn = el; }
      if (i === 7) { el.style.background = 'rgba(248,113,113,0.15)'; cellEls.fp = el; }
      if (i === 8) { el.style.background = 'rgba(74,222,128,0.15)'; cellEls.tn = el; }
      el.textContent = l;
      gridWrap.appendChild(el);
    });

    canvas.appendChild(status); canvas.appendChild(gridWrap);

    const predictions = [
      { actual: '+', pred: '+', cell: 'tp', label: 'True Positive' },
      { actual: '+', pred: '+', cell: 'tp', label: 'True Positive' },
      { actual: '+', pred: '-', cell: 'fn', label: 'False Negative' },
      { actual: '-', pred: '+', cell: 'fp', label: 'False Positive' },
      { actual: '-', pred: '-', cell: 'tn', label: 'True Negative' },
      { actual: '-', pred: '-', cell: 'tn', label: 'True Negative' },
      { actual: '+', pred: '+', cell: 'tp', label: 'True Positive' },
      { actual: '-', pred: '-', cell: 'tn', label: 'True Negative' },
    ];

    let counts = { tp: 0, fn: 0, fp: 0, tn: 0 }, stepNum = 0, intervalId = null;

    function step() {
      if (stepNum >= predictions.length) {
        const acc = ((counts.tp + counts.tn) / predictions.length).toFixed(2);
        status.textContent = `Done! Accuracy = ${acc}`;
        status.style.color = 'var(--success)'; stop(); return;
      }
      const p = predictions[stepNum];
      counts[p.cell]++;
      cellEls.tp.textContent = `TP: ${counts.tp}`;
      cellEls.fn.textContent = `FN: ${counts.fn}`;
      cellEls.fp.textContent = `FP: ${counts.fp}`;
      cellEls.tn.textContent = `TN: ${counts.tn}`;
      status.textContent = `Sample ${stepNum + 1}: actual=${p.actual}, pred=${p.pred} → ${p.label}`;
      status.style.color = (p.cell === 'tp' || p.cell === 'tn') ? 'var(--success)' : 'var(--error)';
      cellEls[p.cell].style.transform = 'scale(1.1)';
      setTimeout(() => cellEls[p.cell].style.transform = 'scale(1)', 400);
      stepNum++;
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1200); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); stepNum = 0; counts = { tp: 0, fn: 0, fp: 0, tn: 0 }; cellEls.tp.textContent = 'TP: 0'; cellEls.fn.textContent = 'FN: 0'; cellEls.fp.textContent = 'FP: 0'; cellEls.tn.textContent = 'TN: 0'; status.textContent = 'Classifying samples...'; status.style.color = 'var(--accent)'; }

    return { play, pause: stop, step, reset };
  }

  /* ---- PCA Projection Animation ---- */
  function createPCAAnimation(container) {
    const cvs = document.createElement('canvas');
    cvs.width = 400; cvs.height = 300;
    cvs.style.cssText = 'max-width:100%;border-radius:6px;';
    const canvas = container.querySelector('.animation-canvas');
    canvas.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    const angle = Math.PI / 4;
    let points2D = [], projected = [], t = 0, intervalId = null, projecting = false;

    function seed() {
      points2D = [];
      for (let i = 0; i < 30; i++) {
        const along = (Math.random() - 0.5) * 200;
        const perp = (Math.random() - 0.5) * 60;
        points2D.push([200 + along * Math.cos(angle) + perp * Math.cos(angle + Math.PI / 2),
                        150 + along * Math.sin(angle) + perp * Math.sin(angle + Math.PI / 2)]);
      }
      projected = points2D.map(p => {
        const dx = p[0] - 200, dy = p[1] - 150;
        const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
        return [200 + proj * Math.cos(angle), 150 + proj * Math.sin(angle)];
      });
    }

    function draw() {
      const dk = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, 400, 300);

      // PC1 line
      ctx.beginPath(); ctx.moveTo(200 - 180 * Math.cos(angle), 150 - 180 * Math.sin(angle));
      ctx.lineTo(200 + 180 * Math.cos(angle), 150 + 180 * Math.sin(angle));
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);

      ctx.fillStyle = dk ? '#e2e8f0' : '#1e293b'; ctx.font = '12px Inter';
      ctx.fillText('PC1 (max variance)', 250, 100);

      points2D.forEach((p, i) => {
        const cx = projecting ? p[0] + (projected[i][0] - p[0]) * t : p[0];
        const cy = projecting ? p[1] + (projected[i][1] - p[1]) * t : p[1];
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8'; ctx.fill();
      });

      if (projecting) { ctx.fillStyle = dk ? '#e2e8f0' : '#1e293b'; ctx.font = '12px Inter'; ctx.fillText(`Projecting: ${Math.round(t * 100)}%`, 10, 20); }
      if (t >= 1) { ctx.fillStyle = '#4ade80'; ctx.font = 'bold 13px Inter'; ctx.fillText('2D → 1D projection complete', 10, 20); }
    }

    function step() {
      if (!projecting) { projecting = true; t = 0; }
      t = Math.min(1, t + 0.08);
      draw();
      if (t >= 1) stop();
    }
    function play() { if (!intervalId) { projecting = true; intervalId = setInterval(step, 60); } }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); t = 0; projecting = false; seed(); draw(); }

    seed(); draw();
    return { play, pause: stop, step, reset };
  }

  /* ---- Bias-Variance Tradeoff Animation ---- */
  function createBiasVarianceAnimation(container) {
    const cvs = document.createElement('canvas');
    cvs.width = 480; cvs.height = 250;
    cvs.style.cssText = 'max-width:100%;border-radius:6px;';
    const canvas = container.querySelector('.animation-canvas');
    canvas.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    let phase = 0, intervalId = null;
    const dataPoints = [[40, 180], [80, 150], [120, 130], [170, 90], [210, 100], [260, 60], [310, 50], [360, 70], [410, 30], [450, 45]];

    function drawPhase() {
      const dk = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, 480, 250);

      // Draw data
      dataPoints.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8'; ctx.fill();
      });

      ctx.lineWidth = 2;
      if (phase >= 1) {
        ctx.beginPath(); ctx.strokeStyle = '#f87171';
        ctx.moveTo(30, 110); ctx.lineTo(460, 110); ctx.stroke();
        ctx.fillStyle = '#f87171'; ctx.font = '12px Inter'; ctx.fillText('Underfit (high bias)', 10, 20);
      }
      if (phase >= 2) {
        ctx.beginPath(); ctx.strokeStyle = '#4ade80';
        for (let x = 30; x <= 460; x++) { const y = 200 - 0.35 * x + 0.00005 * x * x; if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke(); ctx.fillStyle = '#4ade80'; ctx.font = '12px Inter'; ctx.fillText('Good fit (balanced)', 170, 20);
      }
      if (phase >= 3) {
        ctx.beginPath(); ctx.strokeStyle = '#f59e0b';
        for (let i = 0; i < dataPoints.length - 1; i++) {
          const [x1, y1] = dataPoints[i], [x2, y2] = dataPoints[i + 1];
          ctx.moveTo(x1, y1);
          const cpx = (x1 + x2) / 2, cpy = y1 + (Math.random() - 0.5) * 40;
          ctx.quadraticCurveTo(cpx, cpy, x2, y2);
        }
        ctx.stroke(); ctx.fillStyle = '#f59e0b'; ctx.font = '12px Inter'; ctx.fillText('Overfit (high variance)', 310, 20);
      }
    }

    function step() { if (phase >= 3) { stop(); return; } phase++; drawPhase(); }
    function play() { if (!intervalId) intervalId = setInterval(step, 1500); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); phase = 0; drawPhase(); }

    drawPhase();
    return { play, pause: stop, step, reset };
  }

  /* ---- Self-Attention Heatmap Animation ---- */
  function createSelfAttentionAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '12px'; canvas.style.alignItems = 'center';

    const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    const attentionMatrix = [
      [0.1, 0.3, 0.1, 0.1, 0.2, 0.2],
      [0.1, 0.2, 0.3, 0.1, 0.1, 0.2],
      [0.1, 0.4, 0.1, 0.2, 0.1, 0.1],
      [0.1, 0.1, 0.2, 0.1, 0.1, 0.4],
      [0.3, 0.1, 0.1, 0.1, 0.2, 0.2],
      [0.1, 0.1, 0.1, 0.3, 0.2, 0.2],
    ];

    const status = document.createElement('div');
    status.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:var(--accent);text-align:center;';
    status.textContent = 'Self-Attention: Which tokens attend to which?';

    const gridWrap = document.createElement('div');
    gridWrap.style.cssText = `display:grid;grid-template-columns:repeat(${tokens.length + 1}, 46px);gap:3px;font-family:var(--font-mono);font-size:0.72rem;`;

    const cells = [];
    gridWrap.appendChild(Object.assign(document.createElement('div'), { textContent: '' }));
    tokens.forEach(t => {
      const h = document.createElement('div');
      h.style.cssText = 'text-align:center;font-weight:700;color:var(--accent);padding:4px;';
      h.textContent = t; gridWrap.appendChild(h);
    });
    tokens.forEach((t, row) => {
      const rh = document.createElement('div');
      rh.style.cssText = 'font-weight:700;color:var(--accent);display:flex;align-items:center;justify-content:flex-end;padding-right:4px;';
      rh.textContent = t; gridWrap.appendChild(rh);
      const rowCells = [];
      tokens.forEach((_, col) => {
        const c = document.createElement('div');
        c.style.cssText = 'width:42px;height:32px;border-radius:3px;display:flex;align-items:center;justify-content:center;transition:all 0.4s;border:1px solid var(--border);';
        gridWrap.appendChild(c);
        rowCells.push(c);
      });
      cells.push(rowCells);
    });

    canvas.appendChild(status); canvas.appendChild(gridWrap);

    let currentRow = -1, intervalId = null;

    function step() {
      currentRow++;
      if (currentRow >= tokens.length) { status.textContent = 'Full attention matrix revealed!'; status.style.color = 'var(--success)'; stop(); return; }
      status.textContent = `"${tokens[currentRow]}" attends to → ...`;
      cells[currentRow].forEach((c, col) => {
        const w = attentionMatrix[currentRow][col];
        const alpha = Math.round(w * 255);
        c.style.background = `rgba(56,189,248,${w})`;
        c.textContent = w.toFixed(1);
        c.style.color = w > 0.25 ? '#fff' : 'var(--text-muted)';
      });
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1200); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); currentRow = -1; status.textContent = 'Self-Attention: Which tokens attend to which?'; status.style.color = 'var(--accent)'; cells.forEach(row => row.forEach(c => { c.style.background = 'transparent'; c.textContent = ''; c.style.color = 'var(--text-muted)'; })); }

    return { play, pause: stop, step, reset };
  }

  /* ---- Embedding Space Animation ---- */
  function createEmbeddingSpaceAnimation(container) {
    const cvs = document.createElement('canvas');
    cvs.width = 420; cvs.height = 300;
    cvs.style.cssText = 'max-width:100%;border-radius:6px;';
    const canvas = container.querySelector('.animation-canvas');
    canvas.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    const clusters = [
      { label: 'Animals', words: ['cat', 'dog', 'fish', 'bird'], cx: 100, cy: 80, color: '#38bdf8' },
      { label: 'Food', words: ['pizza', 'pasta', 'salad', 'cake'], cx: 320, cy: 90, color: '#4ade80' },
      { label: 'Tech', words: ['code', 'data', 'cloud', 'AI'], cx: 200, cy: 230, color: '#a78bfa' },
    ];
    let positions = [], revealed = 0, intervalId = null;

    function seed() {
      positions = [];
      clusters.forEach(cl => {
        cl.words.forEach(w => {
          positions.push({ word: w, x: cl.cx + (Math.random() - 0.5) * 80, y: cl.cy + (Math.random() - 0.5) * 60, color: cl.color, cluster: cl.label });
        });
      });
    }

    function draw() {
      const dk = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, 420, 300);

      // Draw cluster regions
      clusters.forEach(cl => {
        if (revealed >= clusters.indexOf(cl) * 4 + 1) {
          ctx.beginPath(); ctx.arc(cl.cx, cl.cy, 60, 0, Math.PI * 2);
          ctx.strokeStyle = cl.color; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = cl.color; ctx.font = 'bold 11px Inter'; ctx.fillText(cl.label, cl.cx - 20, cl.cy - 50);
        }
      });

      for (let i = 0; i < Math.min(revealed, positions.length); i++) {
        const p = positions[i];
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.fillStyle = dk ? '#e2e8f0' : '#1e293b'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(p.word, p.x + 8, p.y + 4);
      }

      ctx.fillStyle = dk ? '#e2e8f0' : '#1e293b'; ctx.font = '12px Inter';
      ctx.fillText('2D Embedding Space', 10, 18);
    }

    function step() {
      if (revealed >= positions.length) { stop(); return; }
      revealed++; draw();
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 500); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); revealed = 0; seed(); draw(); }

    seed(); draw();
    return { play, pause: stop, step, reset };
  }

  /* ---- Document Chunking & Overlap Animation ---- */
  function createChunkingAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '10px';

    const doc = 'The quick brown fox jumps over the lazy dog. It was a bright sunny day. The fox ran through the fields of gold. Birds sang in the tall trees.';
    const words = doc.split(' ');
    const chunkSize = 8, overlap = 2;

    const status = document.createElement('div');
    status.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:var(--accent);text-align:center;';
    status.textContent = 'Document Chunking with Overlap — Press Play';

    const wordRow = document.createElement('div');
    wordRow.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;justify-content:center;';
    const wordEls = words.map(w => {
      const el = document.createElement('span');
      el.style.cssText = 'padding:3px 6px;font-family:var(--font-mono);font-size:0.78rem;border-radius:3px;transition:all 0.3s;color:var(--text-secondary);';
      el.textContent = w;
      wordRow.appendChild(el);
      return el;
    });

    const chunkInfo = document.createElement('div');
    chunkInfo.style.cssText = 'font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);text-align:center;min-height:20px;';

    canvas.appendChild(status); canvas.appendChild(wordRow); canvas.appendChild(chunkInfo);

    const chunkColors = ['#38bdf8', '#4ade80', '#a78bfa', '#f59e0b', '#f87171'];
    let chunkNum = 0, intervalId = null;

    function step() {
      const start = chunkNum * (chunkSize - overlap);
      if (start >= words.length) { status.textContent = `Done! ${chunkNum} chunks created`; status.style.color = 'var(--success)'; stop(); return; }
      const end = Math.min(start + chunkSize, words.length);
      const color = chunkColors[chunkNum % chunkColors.length];
      for (let i = start; i < end; i++) {
        wordEls[i].style.background = color;
        wordEls[i].style.color = '#fff';
        if (i >= start && i < start + overlap && chunkNum > 0) {
          wordEls[i].style.outline = '2px solid var(--warning)';
          wordEls[i].title = 'Overlap region';
        }
      }
      status.textContent = `Chunk ${chunkNum + 1}: words [${start}..${end - 1}]`;
      chunkInfo.textContent = overlap > 0 && chunkNum > 0 ? `${overlap}-word overlap with previous chunk` : '';
      chunkNum++;
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1400); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); chunkNum = 0; status.textContent = 'Document Chunking with Overlap — Press Play'; status.style.color = 'var(--accent)'; chunkInfo.textContent = ''; wordEls.forEach(el => { el.style.background = 'transparent'; el.style.color = 'var(--text-secondary)'; el.style.outline = 'none'; }); }

    return { play, pause: stop, step, reset };
  }

  /* ---- Circuit Breaker State Machine Animation ---- */
  function createCircuitBreakerAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '12px'; canvas.style.alignItems = 'center';

    const states = ['CLOSED', 'CLOSED', 'CLOSED', 'OPEN', 'OPEN', 'HALF-OPEN', 'CLOSED'];
    const stateColors = { 'CLOSED': '#4ade80', 'OPEN': '#f87171', 'HALF-OPEN': '#f59e0b' };
    const events = ['req OK ✓', 'req OK ✓', 'req FAIL ✗ (threshold hit)', 'blocked ✗', 'timeout elapsed...', 'probe req OK ✓', 'circuit restored ✓'];

    const stateEl = document.createElement('div');
    stateEl.style.cssText = 'font-size:1.6rem;font-weight:800;font-family:var(--font-mono);padding:14px 30px;border-radius:10px;border:3px solid var(--border);transition:all 0.5s;';
    stateEl.textContent = 'CLOSED';

    const eventEl = document.createElement('div');
    eventEl.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:var(--text-muted);text-align:center;min-height:24px;';

    const counterEl = document.createElement('div');
    counterEl.style.cssText = 'font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);';
    counterEl.textContent = 'failures: 0 / 3';

    canvas.appendChild(stateEl); canvas.appendChild(eventEl); canvas.appendChild(counterEl);

    let stepNum = 0, failures = 0, intervalId = null;

    function step() {
      if (stepNum >= states.length) { stop(); eventEl.textContent = 'Demo complete!'; return; }
      const state = states[stepNum];
      const color = stateColors[state];
      stateEl.textContent = state;
      stateEl.style.borderColor = color; stateEl.style.color = color;
      eventEl.textContent = events[stepNum];
      if (stepNum === 2) failures = 3;
      if (stepNum === 6) failures = 0;
      counterEl.textContent = `failures: ${failures} / 3`;
      stepNum++;
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1500); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); stepNum = 0; failures = 0; stateEl.textContent = 'CLOSED'; stateEl.style.borderColor = 'var(--border)'; stateEl.style.color = 'var(--text-primary)'; eventEl.textContent = ''; counterEl.textContent = 'failures: 0 / 3'; }

    return { play, pause: stop, step, reset };
  }

  /* ---- Multi-Agent Communication Animation ---- */
  function createMultiAgentAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '10px';

    const agents = [
      { name: 'Orchestrator', color: '#38bdf8', emoji: '🧠' },
      { name: 'Researcher', color: '#4ade80', emoji: '🔍' },
      { name: 'Writer', color: '#a78bfa', emoji: '✍️' },
      { name: 'Reviewer', color: '#f59e0b', emoji: '📋' },
    ];

    const agentRow = document.createElement('div');
    agentRow.style.cssText = 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;';
    const agentEls = agents.map(a => {
      const el = document.createElement('div');
      el.style.cssText = `padding:8px 14px;border-radius:8px;border:2px solid ${a.color};font-family:var(--font-mono);font-size:0.8rem;text-align:center;transition:all 0.4s;min-width:80px;`;
      el.textContent = `${a.emoji} ${a.name}`;
      agentRow.appendChild(el);
      return el;
    });

    const msgEl = document.createElement('div');
    msgEl.style.cssText = 'font-family:var(--font-mono);font-size:0.82rem;color:var(--text-muted);text-align:center;padding:8px;border:1px dashed var(--border);border-radius:6px;min-height:24px;transition:all 0.3s;';

    canvas.appendChild(agentRow); canvas.appendChild(msgEl);

    const messages = [
      { from: 0, to: 1, msg: 'Research "latest AI agent frameworks"' },
      { from: 1, to: 0, msg: 'Found: LangGraph, CrewAI, AutoGen...' },
      { from: 0, to: 2, msg: 'Write comparison article using research' },
      { from: 2, to: 0, msg: 'Draft ready (800 words)' },
      { from: 0, to: 3, msg: 'Review draft for accuracy & tone' },
      { from: 3, to: 0, msg: 'Approved with minor edits ✓' },
    ];

    let stepNum = 0, intervalId = null;

    function step() {
      if (stepNum >= messages.length) { msgEl.textContent = 'Task complete!'; msgEl.style.color = 'var(--success)'; stop(); return; }
      agentEls.forEach(el => el.style.background = 'transparent');
      const m = messages[stepNum];
      agentEls[m.from].style.background = `${agents[m.from].color}22`;
      agentEls[m.to].style.background = `${agents[m.to].color}22`;
      msgEl.textContent = `${agents[m.from].emoji} → ${agents[m.to].emoji}: "${m.msg}"`;
      msgEl.style.color = agents[m.from].color;
      stepNum++;
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1800); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); stepNum = 0; msgEl.textContent = ''; msgEl.style.color = 'var(--text-muted)'; agentEls.forEach(el => el.style.background = 'transparent'); }

    return { play, pause: stop, step, reset };
  }

  /* ---- Token Budget Draining Animation ---- */
  function createTokenBudgetAnimation(container) {
    const canvas = container.querySelector('.animation-canvas');
    canvas.style.flexDirection = 'column'; canvas.style.gap = '12px'; canvas.style.alignItems = 'center';

    const totalBudget = 4096;
    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'width:100%;max-width:400px;height:30px;border-radius:6px;border:2px solid var(--border);overflow:hidden;position:relative;';
    const barFill = document.createElement('div');
    barFill.style.cssText = 'height:100%;width:100%;background:var(--success);transition:width 0.5s,background 0.5s;border-radius:4px;';
    barWrap.appendChild(barFill);

    const info = document.createElement('div');
    info.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:var(--accent);text-align:center;';
    info.textContent = `Token budget: ${totalBudget} / ${totalBudget}`;

    const log = document.createElement('div');
    log.style.cssText = 'font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);text-align:left;max-width:400px;width:100%;max-height:120px;overflow-y:auto;';

    canvas.appendChild(info); canvas.appendChild(barWrap); canvas.appendChild(log);

    const events = [
      { label: 'System prompt', cost: 350 },
      { label: 'User message', cost: 120 },
      { label: 'Tool call: search()', cost: 80 },
      { label: 'Tool result (web)', cost: 1200 },
      { label: 'LLM reasoning', cost: 600 },
      { label: 'Tool call: calculator()', cost: 40 },
      { label: 'Tool result', cost: 150 },
      { label: 'Final response', cost: 450 },
    ];

    let used = 0, stepNum = 0, intervalId = null;

    function step() {
      if (stepNum >= events.length) { const e = document.createElement('div'); e.textContent = '✓ Generation complete'; e.style.color = 'var(--success)'; log.appendChild(e); stop(); return; }
      const ev = events[stepNum];
      used += ev.cost;
      const remaining = Math.max(0, totalBudget - used);
      const pct = remaining / totalBudget * 100;
      barFill.style.width = `${pct}%`;
      if (pct < 20) barFill.style.background = 'var(--error)';
      else if (pct < 50) barFill.style.background = 'var(--warning)';
      else barFill.style.background = 'var(--success)';
      info.textContent = `Token budget: ${remaining} / ${totalBudget}`;
      const entry = document.createElement('div');
      entry.textContent = `  -${ev.cost} tokens: ${ev.label}`;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;
      stepNum++;
    }
    function play() { if (!intervalId) intervalId = setInterval(step, 1200); }
    function stop() { clearInterval(intervalId); intervalId = null; }
    function reset() { stop(); stepNum = 0; used = 0; barFill.style.width = '100%'; barFill.style.background = 'var(--success)'; info.textContent = `Token budget: ${totalBudget} / ${totalBudget}`; log.textContent = ''; }

    return { play, pause: stop, step, reset };
  }

  /* ---- Factory ---- */
  const TYPES = {
    'loop': createLoopAnimation,
    'gradient-descent': createGradientDescentAnimation,
    'token-generation': createTokenAnimation,
    'decision-tree': createDecisionTreeAnimation,
    'rag-flow': createRAGAnimation,
    'agent-loop': createAgentLoopAnimation,
    'git-branching': createGitBranchingAnimation,
    'stack-queue': createStackQueueAnimation,
    'api-cycle': createAPICycleAnimation,
    'kmeans': createKMeansAnimation,
    'cross-validation': createCrossValidationAnimation,
    'confusion-matrix': createConfusionMatrixAnimation,
    'pca-projection': createPCAAnimation,
    'bias-variance': createBiasVarianceAnimation,
    'self-attention': createSelfAttentionAnimation,
    'embedding-space': createEmbeddingSpaceAnimation,
    'chunking-overlap': createChunkingAnimation,
    'circuit-breaker': createCircuitBreakerAnimation,
    'multi-agent': createMultiAgentAnimation,
    'token-budget': createTokenBudgetAnimation,
  };

  function init() {
    document.querySelectorAll('.animation-wrapper').forEach(wrapper => {
      const type = wrapper.dataset.animation;
      const factory = TYPES[type];
      if (!factory) return;

      const controls = factory(wrapper);
      const playBtn = wrapper.querySelector('.play-btn');
      const pauseBtn = wrapper.querySelector('.pause-btn');
      const stepBtn = wrapper.querySelector('.step-btn');
      const resetBtn = wrapper.querySelector('.anim-reset-btn');

      if (playBtn) playBtn.addEventListener('click', controls.play);
      if (pauseBtn) pauseBtn.addEventListener('click', controls.pause);
      if (stepBtn) stepBtn.addEventListener('click', controls.step);
      if (resetBtn) resetBtn.addEventListener('click', controls.reset);
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Animations.init());
