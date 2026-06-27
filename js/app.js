  (function () {
    'use strict';

    /* ---------- 1. Navigation active au scroll ---------- */
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    function updateActiveNav() {
      let current = '';
      const y = window.scrollY + 200;
      for (const section of sections) {
        if (y >= section.offsetTop) current = section.id;
      }
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === '#' + current;
        link.classList.toggle('text-text', active);
        link.classList.toggle('text-muted', !active);
      });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    /* ---------- 2. Sélecteur de thèmes ---------- */
    const THEMES = ['cyber', 'nord', 'solar', 'minuit'];
    const themeBtns = Array.from(document.querySelectorAll('[data-theme-btn]'));
    function applyTheme(theme) {
      if (!THEMES.includes(theme)) theme = 'cyber';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      themeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeBtn === theme)));
    }
    themeBtns.forEach((btn) => btn.addEventListener('click', () => applyTheme(btn.dataset.themeBtn)));
    applyTheme(localStorage.getItem('theme') || 'cyber');

    /* ---------- 3. Filtre projets (type ET techno) ---------- */
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const typeBtns = Array.from(document.querySelectorAll('[data-filter-type]'));
    const techContainer = document.getElementById('filter-tech');
    const noResults = document.getElementById('no-results');
    let activeType = 'all';
    let activeTech = 'all';

    // Génère la liste de technos à partir des cartes
    const techs = new Set();
    cards.forEach((c) => c.dataset.techs.split(',').forEach((t) => techs.add(t.trim())));
    const allTechBtn = document.createElement('button');
    allTechBtn.className = 'filter-btn active';
    allTechBtn.textContent = 'Toutes';
    allTechBtn.dataset.filterTech = 'all';
    techContainer.appendChild(allTechBtn);
    Array.from(techs).sort().forEach((t) => {
      const b = document.createElement('button');
      b.className = 'filter-btn';
      b.textContent = t;
      b.dataset.filterTech = t;
      techContainer.appendChild(b);
    });
    const techBtns = Array.from(techContainer.querySelectorAll('[data-filter-tech]'));

    function applyFilters() {
      let visible = 0;
      cards.forEach((card) => {
        const matchType = activeType === 'all' || card.dataset.type.split(' ').includes(activeType);
        const cardTechs = card.dataset.techs.split(',').map((t) => t.trim());
        const matchTech = activeTech === 'all' || cardTechs.includes(activeTech);
        const show = matchType && matchTech;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      noResults.classList.toggle('hidden', visible !== 0);
    }
    typeBtns.forEach((btn) => btn.addEventListener('click', () => {
      activeType = btn.dataset.filterType;
      typeBtns.forEach((b) => b.classList.toggle('active', b === btn));
      applyFilters();
    }));
    techBtns.forEach((btn) => btn.addEventListener('click', () => {
      activeTech = btn.dataset.filterTech;
      techBtns.forEach((b) => b.classList.toggle('active', b === btn));
      applyFilters();
    }));

    /* ---------- 4. Animations au scroll ---------- */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const faders = Array.from(document.querySelectorAll('.fade-in'));
    if (reduceMotion || !('IntersectionObserver' in window)) {
      faders.forEach((el) => el.classList.add('visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      faders.forEach((el) => io.observe(el));
    }

    /* ---------- 5. Easter egg : terminal ---------- */
    const term = document.getElementById('terminal');
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('terminal-input');
    const closeBtn = document.getElementById('terminal-close');
    const history = [];
    let histIndex = -1;

    const COMMANDS = {
      help: () =>
        'Commandes disponibles :\n' +
        '  whoami       qui suis-je\n' +
        '  skills       technos maîtrisées\n' +
        '  projects     mes projets\n' +
        '  contact      mes coordonnées\n' +
        '  theme [nom]  change le thème (cyber, nord, solar, minuit)\n' +
        '  clear        efface l\'écran\n' +
        '  exit         ferme le terminal\n' +
        '  sudo hire-me ???',
      whoami: () => 'Hervé Béziat — étudiant en Master Développement Web à La Plateforme (Marseille).',
      skills: () => readSkills(),
      projects: () => readProjects(),
      contact: () =>
        'email    : herve.beziat@laplateforme.io\n' +
        'github   : https://github.com/herve-beziat\n' +
        'linkedin : https://www.linkedin.com/in/herv%C3%A9-beziat/',
      clear: () => { output.innerHTML = ''; return ''; },
      exit: () => { closeTerminal(); return ''; },
      easter: () => { confetti(); return '🎉 woohoo !'; },
    };

    // Lit les compétences directement depuis la section #skills (source unique de vérité)
    function readSkills() {
      const cards = Array.from(document.querySelectorAll('#skills .card'));
      if (!cards.length) return 'Aucune compétence renseignée.';
      const rows = cards.map((card) => ({
        label: (card.querySelector('.section-label') || {}).textContent.trim(),
        tags: Array.from(card.querySelectorAll('.tag')).map((t) => t.textContent.trim()),
      }));
      const pad = Math.max(...rows.map((r) => r.label.length));
      return rows.map((r) => r.label.padEnd(pad) + ' : ' + r.tags.join(', ')).join('\n');
    }

    // Lit les projets directement depuis la section #projects (source unique de vérité)
    function readProjects() {
      const cards = Array.from(document.querySelectorAll('#projects .project-card'));
      if (!cards.length) return 'Aucun projet pour le moment.';
      return cards.map((card) => {
        const h3 = card.querySelector('h3');
        const emoji = h3.querySelector('span') ? h3.querySelector('span').textContent.trim() : '';
        const name = h3.textContent.replace(emoji, '').trim();
        const type = (card.dataset.type || '').split(/\s+/)[0] || '—';
        const links = Array.from(card.querySelectorAll('.project-links a'));
        let target;
        if (links.length) target = links.map((a) => a.href).join('   ');
        else if (card.querySelector('.badge-private')) target = '🔒 Code privé · sur demande';
        else target = '—';
        const head = (emoji ? emoji + ' ' : '') + name + ' (' + type + ')';
        return head + '\n   ' + target;
      }).join('\n');
    }

    function print(text, cls) {
      const div = document.createElement('div');
      if (cls) div.className = cls;
      // liens cliquables
      div.innerHTML = String(text).replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
      );
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    }

    function runCommand(raw) {
      const line = raw.trim();
      print('> ' + line, '');
      if (!line) return;
      history.unshift(line);
      histIndex = -1;
      const [cmd, ...args] = line.split(/\s+/);
      const key = cmd.toLowerCase();

      if (line.toLowerCase() === 'sudo hire-me') {
        print('Accès refusé... ou pas 😏  → herve.beziat@laplateforme.io');
        return;
      }
      if (key === 'theme') {
        const t = (args[0] || '').toLowerCase();
        if (THEMES.includes(t)) { applyTheme(t); print('Thème appliqué : ' + t); }
        else print('Thème inconnu. Essaie : ' + THEMES.join(', '));
        return;
      }
      if (COMMANDS[key]) {
        const res = COMMANDS[key]();
        if (res) print(res);
        return;
      }
      print('Commande introuvable : ' + cmd + '. Tape "help".');
    }

    function openTerminal() {
      const hint = document.getElementById('terminal-hint');
      if (hint) hint.classList.remove('show');
      term.classList.add('open');
      term.setAttribute('aria-hidden', 'false');
      if (!output.childElementCount) {
        print('╔══════════════════════════════════════╗');
        print('║  portfolio-terminal v1.0.0           ║');
        print('║  Tape "help" pour voir les commandes ║');
        print('╚══════════════════════════════════════╝');
      }
      setTimeout(() => input.focus(), 50);
    }
    function closeTerminal() {
      term.classList.remove('open');
      term.setAttribute('aria-hidden', 'true');
    }

    closeBtn.addEventListener('click', closeTerminal);

    document.addEventListener('keydown', (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      // Ouverture via backtick (hors champ de saisie) ou Ctrl+~
      if ((e.key === '`' && !typing) || (e.ctrlKey && e.key === '~')) {
        e.preventDefault();
        term.classList.contains('open') ? closeTerminal() : openTerminal();
        return;
      }
      if (e.key === 'Escape' && term.classList.contains('open')) closeTerminal();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommand(input.value);
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIndex < history.length - 1) { histIndex++; input.value = history[histIndex]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIndex > 0) { histIndex--; input.value = history[histIndex]; }
        else { histIndex = -1; input.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const all = Object.keys(COMMANDS).concat('theme');
        const match = all.find((c) => c.startsWith(input.value.toLowerCase()));
        if (match) input.value = match;
      } else if (e.key === '`') {
        // évite d'insérer le backtick qui sert à ouvrir/fermer
        e.preventDefault();
      }
    });

    // Petit effet confettis (commande "easter")
    function confetti() {
      const colors = ['#58a6ff', '#3fb950', '#a78bfa', '#f472b6', '#cb4b16'];
      for (let i = 0; i < 40; i++) {
        const c = document.createElement('div');
        c.style.cssText =
          'position:fixed;z-index:2000;width:8px;height:8px;pointer-events:none;top:-10px;border-radius:2px;' +
          'left:' + Math.random() * 100 + 'vw;background:' + colors[i % colors.length] + ';';
        document.body.appendChild(c);
        const fall = c.animate(
          [
            { transform: 'translateY(0) rotate(0)', opacity: 1 },
            { transform: 'translateY(100vh) rotate(' + (Math.random() * 720) + 'deg)', opacity: 0 },
          ],
          { duration: 1500 + Math.random() * 1500, easing: 'ease-in' }
        );
        fall.onfinish = () => c.remove();
      }
    }
    /* ---------- 7. Lightbox des captures projets ---------- */
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      const lightboxImg = document.getElementById('lightbox-img');
      const lightboxClose = document.getElementById('lightbox-close');
      const openLightbox = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
      };
      const closeLightbox = () => {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.removeAttribute('src');
      };
      document.querySelectorAll('.project-thumb img').forEach((img) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(img.currentSrc || img.src, img.alt));
      });
      lightbox.addEventListener('click', closeLightbox);
      lightboxClose.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
      });
    }

    /* ---------- 8. Découverte du terminal (A : console / B : bulle) ---------- */
    // A — clin d'œil pour les devs qui ouvrent la console
    console.log(
      '%c👋 Curieux ?%c Appuie sur %c`%c (ou Ctrl+~) n\'importe où sur la page pour ouvrir un terminal caché.',
      'font-weight:bold;font-size:13px;color:#58a6ff',
      'color:inherit',
      'font-family:monospace;background:#1f2937;color:#79c0ff;padding:1px 5px;border-radius:3px',
      'color:inherit'
    );

    // B — bulle flottante, 1×/session, auto-disparition + fermable
    const hint = document.getElementById('terminal-hint');
    if (hint && !sessionStorage.getItem('hintSeen')) {
      const hintClose = document.getElementById('terminal-hint-close');
      let hideTimer;
      const dismiss = () => {
        hint.classList.remove('show');
        clearTimeout(hideTimer);
        sessionStorage.setItem('hintSeen', '1');
        setTimeout(() => { hint.hidden = true; }, 400);
      };
      const showTimer = setTimeout(() => {
        hint.hidden = false;
        // force le reflow pour que la transition d'entrée joue
        void hint.offsetWidth;
        hint.classList.add('show');
        hideTimer = setTimeout(dismiss, 13000);
      }, 4000);
      hintClose.addEventListener('click', dismiss);
      // si le visiteur ouvre le terminal avant l'apparition, on annule la bulle
      document.addEventListener('keydown', (e) => {
        if ((e.key === '`') || (e.ctrlKey && e.key === '~')) {
          clearTimeout(showTimer);
          sessionStorage.setItem('hintSeen', '1');
        }
      });
    }

  })();
