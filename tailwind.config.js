/** @type {import('tailwindcss').Config} */
module.exports = {
  // Fichiers scannés pour ne générer que les classes réellement utilisées
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      // Reprend la config inline du CDN : couleurs mappées sur les CSS custom properties (thèmes)
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        neon: 'var(--neon)',
        text: 'var(--text)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      maxWidth: {
        content: '900px',
        shell: '1280px',
      },
    },
  },
  plugins: [],
};
