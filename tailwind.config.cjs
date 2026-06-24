module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './client/src/**/*.{js,ts,jsx,tsx,css}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: 'var(--card)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        input: 'var(--input)',
        ring: 'var(--ring)'
      }
    }
  },
  safelist: [
    'lg:grid-cols-8',
    'lg:grid-cols-9'
  ],
  plugins: []
};
