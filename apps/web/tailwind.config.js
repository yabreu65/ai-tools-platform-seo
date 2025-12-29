/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./apps/web/**/*.{js,ts,jsx,tsx}",
	  "./packages/core/**/*.{js,ts,jsx,tsx}",
	  "./components/**/*.{js,ts,jsx,tsx}",
	],
	safelist: [
		{
		  pattern: /from-(sky|cyan|fuchsia|pink|violet|indigo|purple|amber|gray|stone|neutral|emerald|lime|teal)-(50|100|500|600)/,
		},
		{
		  pattern: /to-(blue|sky|pink|purple|indigo|slate|rose|yellow|stone|neutral|lime|emerald|green)-(100|500|600)/,
		},
	  ],
	  
	theme: {
	  extend: {
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)'
		},
		colors: {
		  // Base system colors
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))'
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))'
		  },
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))'
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))'
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))'
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))'
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))'
		  },
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  
		  // New AI Tools Platform Color System
		  'tech-blue': {
			50: 'hsl(214 100% 97%)',   // #f0f9ff
			100: 'hsl(214 95% 93%)',   // #e0f2fe
			500: 'hsl(217 91% 60%)',   // #3b82f6
			600: 'hsl(221 83% 53%)',   // #2563eb
			900: 'hsl(224 76% 48%)',   // #1e40af
		  },
		  'ai-purple': {
			50: 'hsl(270 100% 98%)',   // #faf5ff
			100: 'hsl(269 100% 95%)',  // #f3e8ff
			500: 'hsl(262 83% 58%)',   // #8b5cf6
			600: 'hsl(258 90% 66%)',   // #7c3aed
			900: 'hsl(253 91% 50%)',   // #581c87
		  },
		  'seo-teal': {
			50: 'hsl(166 76% 97%)',    // #f0fdfa
			100: 'hsl(167 85% 89%)',   // #ccfbf1
			500: 'hsl(172 66% 50%)',   // #14b8a6
			600: 'hsl(175 84% 32%)',   // #0d9488
			900: 'hsl(180 84% 17%)',   // #134e4a
		  },
		  'success-green': {
			50: 'hsl(138 76% 97%)',    // #f0fdf4
			100: 'hsl(141 84% 93%)',   // #dcfce7
			500: 'hsl(142 76% 36%)',   // #16a34a
			600: 'hsl(142 72% 29%)',   // #15803d
			900: 'hsl(145 63% 20%)',   // #14532d
		  },
		  'warning-amber': {
			50: 'hsl(55 92% 95%)',     // #fffbeb
			100: 'hsl(55 91% 88%)',    // #fef3c7
			500: 'hsl(43 96% 56%)',    // #f59e0b
			600: 'hsl(37 92% 50%)',    // #d97706
			900: 'hsl(28 73% 26%)',    // #78350f
		  },
		  'error-red': {
			50: 'hsl(0 86% 97%)',      // #fef2f2
			100: 'hsl(0 93% 94%)',     // #fee2e2
			500: 'hsl(0 84% 60%)',     // #ef4444
			600: 'hsl(0 72% 51%)',     // #dc2626
			900: 'hsl(0 63% 31%)',     // #7f1d1d
		  },
		  'neutral-slate': {
			50: 'hsl(210 20% 98%)',    // #f8fafc
			100: 'hsl(214 32% 91%)',   // #e2e8f0
			500: 'hsl(215 16% 47%)',   // #64748b
			600: 'hsl(215 19% 35%)',   // #475569
			900: 'hsl(215 28% 17%)',   // #0f172a
		  },
		  'neutral-zinc': {
			50: 'hsl(0 0% 98%)',       // #fafafa
			100: 'hsl(0 0% 96%)',      // #f4f4f5
			500: 'hsl(0 0% 45%)',      // #71717a
			600: 'hsl(0 0% 32%)',      // #52525b
			900: 'hsl(0 0% 9%)',       // #18181b
		  },
		  
		  chart: {
			'1': 'hsl(var(--chart-1))',
			'2': 'hsl(var(--chart-2))',
			'3': 'hsl(var(--chart-3))',
			'4': 'hsl(var(--chart-4))',
			'5': 'hsl(var(--chart-5))'
		  }
		}
	  }
	},
	plugins: [require("tailwindcss-animate")],
  }
  