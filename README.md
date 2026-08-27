# A.N.A (Arts Na Appreciation)

A premium, cinematic portfolio built with Next.js, Three.js (React Three Fiber), and GSAP. 
Designed to look and feel like a high-end interactive vinyl toy showcase.

## Tech Stack
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS v4 (Design Tokens via CSS variables)
- **3D Graphics**: Three.js, React Three Fiber, React Three Postprocessing
- **Animation**: GSAP (ScrollTrigger & Observer)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features
- **Cinematic Scroll Hijacking**: Smoothly snaps between full-screen sections.
- **Liquid Shader Background**: A performant, procedural noise shader running on the GPU.
- **Interactive 3D Elements**: The Artist Palette and Paintbrush track the user's scroll state.
- **Accessible & Responsive**: Fully supports WCAG contrast, touch targets, keyboard focus, and `prefers-reduced-motion` settings.
