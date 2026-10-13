import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Satoshi', 'system-ui', 'sans-serif'],
				display: ['Satoshi', 'system-ui', 'sans-serif'],
				mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
			},
			colors: {
				// Site-wide neutral greys. Overrides Tailwind's blue-tinted slate so
				// every text-slate-* / bg-slate-* is a true neutral on the near-black
				// canvas; 400–500 are lifted for comfortable contrast (≥5.5:1).
				slate: {
					50: '#fafafa',
					100: '#f4f4f5',
					200: '#e4e4e7',
					300: '#d4d4d8',
					400: '#a1a1aa',
					500: '#8b8b94',
					600: '#5c5c66',
					700: '#3f3f46',
					800: '#27272a',
					900: '#18181b',
					950: '#09090b',
				},
				// Accent that complements the violet: used sparingly for labels,
				// checkmarks, stat markers and active states — never for body text
				// or primary buttons (those stay violet / white).
				gold: {
					100: '#f7edcc',
					200: '#f0dc9f',
					300: '#e8c873',
					400: '#dcb252',
					500: '#c99a32',
					600: '#a77c24',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				none: '0px',
				sm: '0px',
				DEFAULT: '0px',
				md: '0px',
				lg: '0px',
				xl: '0px',
				'2xl': '0px',
				'3xl': '0px',
				full: '0px'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Slow-drifting ambient glow — replaces the external hero video.
				'aurora': {
					'0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
					'33%': { transform: 'translate3d(6%, 4%, 0) scale(1.12)' },
					'66%': { transform: 'translate3d(-5%, -3%, 0) scale(0.94)' }
				},
				'aurora-alt': {
					'0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1.05)' },
					'50%': { transform: 'translate3d(-7%, 5%, 0) scale(0.9)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'aurora': 'aurora 18s ease-in-out infinite',
				'aurora-alt': 'aurora-alt 24s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate, typography],
} satisfies Config;
