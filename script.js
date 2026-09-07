(function(){
  var STORAGE_KEY = 'dm_ledger_demo_v1';
  var DEFAULT_ROWS = [
    { date: 'Mar 12', unit: 'Unit D', method: 'Bank',  amount: 9800  },
    { date: 'Mar 09', unit: 'Unit B', method: 'Maya',  amount: 9200  },
    { date: 'Mar 05', unit: 'Unit C', method: 'GCash', amount: 11000 },
    { date: 'Mar 02', unit: 'Unit A', method: 'Cash',  amount: 8500  }
  ];

  var root = document.getElementById('ledgerDemo');
  if (!root) return;

  var rows;
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    rows = saved ? JSON.parse(saved) : DEFAULT_ROWS.slice();
  } catch (e) { rows = DEFAULT_ROWS.slice(); }

  var activeMethod = null;
  var searchTerm = '';

  var elRows   = document.getElementById('ldRows');
  var elTotal  = document.getElementById('ldStatTotal');
  var elCount  = document.getElementById('ldStatCount');
  var elSearch = document.getElementById('ldSearch');
  var elChips  = root.querySelectorAll('#ldChips .lm-chip');
  var elForm   = document.getElementById('ldForm');
  var elUnit   = document.getElementById('ldUnit');
  var elAmount = document.getElementById('ldAmount');
  var elMethod = document.getElementById('ldMethod');
  var elReset  = document.getElementById('ldReset');

  function peso(n){ return '₱' + Number(n || 0).toLocaleString('en-PH'); }

  function methodClass(m){
    var k = String(m).toLowerCase();
    if (k === 'gcash') return 'gcash';
    if (k === 'bank')  return 'bank';
    if (k === 'maya')  return 'maya';
    return 'cash';
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch (e) {}
  }

  function pulse(el){
    if (!el) return;
    el.classList.remove('stat-pulse');
    void el.offsetWidth;
    el.classList.add('stat-pulse');
  }

  var lastTotalStr = null;
  var lastCountStr = null;

  function render(highlightNew){
    var term = searchTerm.toLowerCase();
    var filtered = rows.filter(function(r){
      var matchesMethod = !activeMethod || r.method === activeMethod;
      var haystack = (r.date + ' ' + r.unit + ' ' + r.method).toLowerCase();
      var matchesSearch = !term || haystack.indexOf(term) !== -1;
      return matchesMethod && matchesSearch;
    });

    if (elRows){
      if (filtered.length === 0){
        elRows.innerHTML = '<tr><td colspan="4" class="lm-empty">No payments match those filters.</td></tr>';
      } else {
        elRows.innerHTML = filtered.map(function(r){
          return '<tr><td>' + escapeHtml(r.date) + '</td><td>' + escapeHtml(r.unit) + '</td>' +
            '<td><span class="lm-pill ' + methodClass(r.method) + '">' + escapeHtml(r.method) + '</span></td>' +
            '<td style="text-align:right">' + peso(r.amount) + '</td></tr>';
        }).join('');
        if (highlightNew && elRows.firstElementChild){
          elRows.firstElementChild.classList.add('row-added');
        }
      }
    }

    var total = rows.reduce(function(sum, r){ return sum + Number(r.amount || 0); }, 0);
    var totalStr = peso(total);
    var countStr = String(rows.length);

    if (elTotal){
      if (totalStr !== lastTotalStr && lastTotalStr !== null) pulse(elTotal.closest('.lm-stat'));
      elTotal.textContent = totalStr;
    }
    if (elCount){
      if (countStr !== lastCountStr && lastCountStr !== null) pulse(elCount.closest('.lm-stat'));
      elCount.textContent = countStr;
    }
    lastTotalStr = totalStr;
    lastCountStr = countStr;
  }

  if (elSearch){
    elSearch.addEventListener('input', function(){
      searchTerm = elSearch.value.trim();
      render();
    });
  }

  elChips.forEach(function(chip){
    chip.addEventListener('click', function(){
      var m = chip.getAttribute('data-method');
      if (activeMethod === m){
        activeMethod = null;
        chip.classList.remove('active');
      } else {
        elChips.forEach(function(c){ c.classList.remove('active'); });
        activeMethod = m;
        chip.classList.add('active');
      }
      render();
    });
  });

  if (elForm){
    elForm.addEventListener('submit', function(e){
      e.preventDefault();
      var amount = parseFloat(elAmount.value);
      if (!amount || amount <= 0) return;
      var label = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      rows.unshift({ date: label, unit: elUnit.value, method: elMethod.value, amount: amount });
      persist();
      elAmount.value = '';
      render(true);
    });
  }

  if (elReset){
    elReset.addEventListener('click', function(){
      rows = DEFAULT_ROWS.slice();
      activeMethod = null;
      searchTerm = '';
      if (elSearch) elSearch.value = '';
      elChips.forEach(function(c){ c.classList.remove('active'); });
      persist();
      render();
    });
  }

  render();
})();

(function(){
  var el = document.getElementById('ledgerDemo');
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = el.getBoundingClientRect();
    var visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
    if (visible && !wasInView){
      el.classList.remove('playing');
      void el.getBoundingClientRect();
      el.classList.add('playing');
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var sheets = Array.prototype.slice.call(document.querySelectorAll('.gsheet'));
  if (!sheets.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = sheets.map(function(){ return false; });

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    sheets.forEach(function(sheet, i){
      var rect = sheet.getBoundingClientRect();
      var visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
      if (visible && !wasInView[i]){
        sheet.classList.remove('playing');
        void sheet.getBoundingClientRect();
        sheet.classList.add('playing');
      }
      wasInView[i] = visible;
    });
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var trigger = document.getElementById('pipelineRunBtn');
  var pipeline = document.getElementById('fileDeliveryPipeline');
  if (!trigger || !pipeline) return;

  var icons = pipeline.querySelectorAll('.pipe-icon');
  var arrows = pipeline.querySelectorAll('.pipe-arrow');
  var sequence = [];
  for (var i = 0; i < icons.length; i++){
    sequence.push(icons[i]);
    if (arrows[i]) sequence.push(arrows[i]);
  }

  var STEP_MS = 220;
  var DUR_MS = 600;
  var running = false;

  function runSequence(){
    if (running) return;
    running = true;
    sequence.forEach(function(el, idx){
      setTimeout(function(){
        el.classList.add('pulsing');
        setTimeout(function(){ el.classList.remove('pulsing'); }, DUR_MS);
      }, idx * STEP_MS);
    });
    setTimeout(function(){ running = false; }, sequence.length * STEP_MS + DUR_MS);
  }

  trigger.addEventListener('click', runSequence);
  trigger.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      runSequence();
    }
  });
})();

(function(){
  var pipeline = document.getElementById('fileDeliveryPipeline');
  if (!pipeline) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var icons = Array.prototype.slice.call(pipeline.querySelectorAll('.pipe-icon'));
  var wasInView = icons.map(function(){ return false; });

  function checkIcons(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    icons.forEach(function(icon, i){
      var rect = icon.getBoundingClientRect();
      var visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
      if (visible && !wasInView[i]){
        icon.classList.remove('jump-spin');
        void icon.offsetWidth;
        icon.classList.add('jump-spin');
      }
      wasInView[i] = visible;
    });
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      checkIcons();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  checkIcons();
})();

(function(){
  var svg = document.getElementById('invoiceFlowSvg');
  if (!svg) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var nodes = Array.prototype.slice.call(svg.querySelectorAll('.flow-node'));
  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = svg.getBoundingClientRect();
    var visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
    if (visible && !wasInView){
      nodes.forEach(function(n){ n.classList.remove('playing'); });
      void svg.getBoundingClientRect();
      nodes.forEach(function(n){ n.classList.add('playing'); });
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var el = document.getElementById('statementSection');
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = el.getBoundingClientRect();
    var visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
    if (visible && !wasInView){
      el.classList.remove('playing');
      void el.getBoundingClientRect();
      el.classList.add('playing');
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var el = document.getElementById('aboutText');
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = el.getBoundingClientRect();
    var visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
    if (visible && !wasInView){
      el.classList.remove('playing');
      void el.getBoundingClientRect();
      el.classList.add('playing');
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var el = document.getElementById('heroName');
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = el.getBoundingClientRect();
    var visible = rect.top < vh * 0.9 && rect.bottom > vh * 0.05;
    if (visible && !wasInView){
      el.classList.remove('playing');
      void el.getBoundingClientRect();
      el.classList.add('playing');
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var el = document.getElementById('heroPhoto');
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = el.getBoundingClientRect();
    var visible = rect.top < vh * 0.9 && rect.bottom > vh * 0.05;
    if (visible && !wasInView){
      el.classList.remove('playing');
      void el.getBoundingClientRect();
      el.classList.add('playing');
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var block = document.getElementById('statBlock');
  if (!block) return;

  var nums = Array.prototype.slice.call(block.querySelectorAll('.stat .num'));
  nums.forEach(function(el){ el.dataset.final = el.textContent; });

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var DIGITS = '0123456789';
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function scramble(el, duration){
    var final = el.dataset.final;
    var len = final.length;
    var frame = 0;
    var totalFrames = Math.max(6, Math.round(duration / 40));
    if (el._scrambleTimer) clearInterval(el._scrambleTimer);
    el._scrambleTimer = setInterval(function(){
      frame++;
      var revealCount = Math.floor((frame / totalFrames) * len);
      var out = '';
      for (var i = 0; i < len; i++){
        var ch = final[i];
        if (i < revealCount || !/[A-Za-z0-9]/.test(ch)){
          out += ch;
        } else {
          var pool = /[0-9]/.test(ch) ? DIGITS : LETTERS;
          out += pool[Math.floor(Math.random() * pool.length)];
        }
      }
      el.textContent = out;
      if (frame >= totalFrames){
        clearInterval(el._scrambleTimer);
        el._scrambleTimer = null;
        el.textContent = final;
      }
    }, 40);
  }

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = block.getBoundingClientRect();
    var visible = rect.top < vh * 0.9 && rect.bottom > vh * 0.05;
    if (visible && !wasInView){
      nums.forEach(function(el, i){
        setTimeout(function(){ scramble(el, 550); }, i * 150);
      });
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var el = document.getElementById('skillGroups');
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = el.getBoundingClientRect();
    var visible = rect.top < vh * 0.9 && rect.bottom > vh * 0.05;
    if (visible && !wasInView){
      el.classList.remove('playing');
      void el.getBoundingClientRect();
      el.classList.add('playing');
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();

(function(){
  var el = document.getElementById('processSteps');
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var wasInView = false;

  function check(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = el.getBoundingClientRect();
    var visible = rect.top < vh * 0.9 && rect.bottom > vh * 0.05;
    if (visible && !wasInView){
      el.classList.remove('playing');
      void el.getBoundingClientRect();
      el.classList.add('playing');
    }
    wasInView = visible;
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      check();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
})();