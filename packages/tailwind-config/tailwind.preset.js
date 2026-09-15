/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        secondary: 'var(--secondary)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        background: 'var(--background)',
        'background-alt': 'var(--background-alt)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
};
