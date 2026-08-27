'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Scene from '@/components/Scene'

gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin)

const SplitText = ({ text, className, style, role, ariaLevel }: { text: string; className?: string; style?: React.CSSProperties; role?: string; ariaLevel?: number }) => {
  return (
    <span aria-label={text} className={className} style={style} role={role} aria-level={ariaLevel}>
      {text.split(' ').map((word, wordIndex, array) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split('').map((char, charIndex) => (
            <span key={charIndex} aria-hidden="true" className="split-char inline-block">
              {char}
            </span>
          ))}
          {/* Add a space after the word unless it's the last word */}
          {wordIndex < array.length - 1 && <span className="inline-block w-[0.3em]">&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}

const Magnetic = ({ children }: { children: React.ReactElement }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)
    
    gsap.to(ref.current, { x: x * 0.5, y: y * 0.5, duration: 1, ease: 'power3.out' })
  }
  
  const handleMouseLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.3)' })
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="inline-block p-4 -m-4">
      {children}
    </div>
  )
}

const profiles = [
  {
    acronym: 'JUDICIOUS',
    name: 'Janus Dominic',
    advocacy: 'Finish what you started',
    keyword: 'Technology',
    sympathy: 'Poverty',
    empathy: 'A parent loss',
    colorHex: '#4a6b63', // Darker Sage Green
  },
  {
    acronym: 'DEMURE MERRY',
    name: 'Diana Mae Castillon',
    advocacy: 'Never give up',
    keyword: 'Arts',
    sympathy: 'Pet dogs',
    empathy: 'Understanding how it feels to lose a loving pet',
    colorHex: '#c15c5a', // Richer Coral
  },
  {
    acronym: 'ADORED JUICY',
    name: 'Ace John Nieva',
    advocacy: 'Share kindness',
    keyword: 'Improvement',
    sympathy: 'Grieving',
    empathy: 'The disappearance of something precious',
    colorHex: '#bc4b2e', // Deeper Terracotta
  },
  {
    acronym: 'PLEASING LOVING',
    name: 'Paolo Lorenzo Longcob',
    advocacy: 'Digital literacy and online safety advocacy',
    keyword: 'Knowledge',
    sympathy: 'Beggars',
    empathy: 'Emotional support',
    colorHex: '#1d3557', // Darker Slate Blue
  },
  {
    acronym: 'WANTED',
    name: 'Wynry Perian',
    advocacy: 'Let your voice be heard',
    keyword: 'Justice',
    sympathy: 'Addiction',
    empathy: 'Struggle',
    colorHex: '#b87d10', // Rich Amber Gold
  },
  {
    acronym: 'CARING ANGELIC',
    name: 'Carlos Angelou Machutes',
    advocacy: 'Accepting makes things easier',
    keyword: 'Growth',
    sympathy: 'Mental health struggles',
    empathy: 'Losing someone dear',
    colorHex: '#357a5b', // Deeper Mint/Forest Green
  },
]

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mainRef.current) return
    
    // Disabled OS reduced-motion check to preserve the cinematic scroll experience
    const prefersReducedMotion = false; // window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Setup full-page slide snapping via GSAP Observer
    const sectionIds = ['#hero', '#manifesto', ...profiles.map((_, i) => `#profile-${i}`)]
    let currentIndex = 0
    let isAnimating = false
    let fallbackTimer: NodeJS.Timeout

    const goToSection = (index: number) => {
      if (isAnimating || index < 0 || index >= sectionIds.length) return
      isAnimating = true
      currentIndex = index
      
      // Highlight Active Navigation Dot
      gsap.to('.nav-dot span', { opacity: 0.2, scale: 1, duration: 0.5 })
      
      // If we are not on the hero section, keep the hero dot slightly visible as a "home" anchor
      if (index !== 0) {
        gsap.to('.nav-dot-0 span', { opacity: 0.6, scale: 1, duration: 0.5 })
      }
      
      // Fully highlight the current section
      gsap.to(`.nav-dot-${index} span`, { opacity: 1, scale: 1.5, duration: 0.5, ease: 'back.out(2)' })

      const targetEl = document.querySelector(sectionIds[currentIndex]) as HTMLElement
      if (targetEl) {
        gsap.to(window, {
          scrollTo: { y: targetEl, autoKill: false },
          duration: 2.5, // Visual slow panning effect
          ease: 'power3.inOut', // Smooth acceleration and deceleration
        })
      }
      
      // Separate scroll lock (1 sec) allows user to scroll again before the pan finishes
      setTimeout(() => { 
        isAnimating = false 
      }, 1500)
    }

    let observer: globalThis.Observer | null = null;
    if (!prefersReducedMotion) {
      observer = Observer.create({
        type: 'wheel,touch,pointer',
        onUp: () => goToSection(currentIndex - 1),
        onDown: () => goToSection(currentIndex + 1),
        tolerance: 10,
        preventDefault: true,
      })
    }

    // Handle Keyboard Navigation (Arrow Keys / Page Up & Down)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        goToSection(currentIndex + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goToSection(currentIndex - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // Handle anchor links for navigation
    const handleNavClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (target && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault()
        const id = target.getAttribute('href') as string
        const targetIndex = sectionIds.indexOf(id)
        if (targetIndex !== -1) {
          goToSection(targetIndex)
        }
      }
    }
    document.addEventListener('click', handleNavClick)

    const sections = gsap.utils.toArray('.profile-section') as HTMLElement[]

    sections.forEach((section) => {
      const elements = section.querySelectorAll('.animate-up')

      gsap.fromTo(
        elements,
        { y: prefersReducedMotion ? 0 : 100, opacity: prefersReducedMotion ? 1 : 0 },
        {
          y: 0,
          opacity: 1,
          duration: prefersReducedMotion ? 0 : 1.2,
          stagger: prefersReducedMotion ? 0 : 0.2,
          ease: 'power3.out',
          scrollTrigger: prefersReducedMotion ? undefined : {
            trigger: section,
            start: 'top 80%',
          },
        }
      )

      const chars = section.querySelectorAll('.split-char')
      if (chars.length > 0) {
        gsap.fromTo(
          chars,
          { y: prefersReducedMotion ? 0 : 100, opacity: prefersReducedMotion ? 1 : 0, rotateZ: prefersReducedMotion ? 0 : 10 },
          {
            y: 0,
            opacity: 1,
            rotateZ: 0,
            duration: prefersReducedMotion ? 0 : 1.2,
            stagger: prefersReducedMotion ? 0 : 0.05,
            ease: 'back.out(1.5)',
            scrollTrigger: prefersReducedMotion ? undefined : {
              trigger: section,
              start: 'top 75%',
            },
          }
        )
      }
    })

    // Hero Entrance Animation
    gsap.fromTo(
      '.hero-title .split-char',
      { y: prefersReducedMotion ? 0 : 150, opacity: prefersReducedMotion ? 1 : 0, rotateZ: prefersReducedMotion ? 0 : 15 },
      {
        y: 0,
        opacity: 1,
        rotateZ: 0,
        duration: prefersReducedMotion ? 0 : 1.5,
        stagger: prefersReducedMotion ? 0 : 0.1,
        ease: 'power4.out',
        delay: prefersReducedMotion ? 0 : 0.2,
      }
    )

    if (!prefersReducedMotion) {
      gsap.to('.hero-content', {
        y: '-20vh',
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    return () => {
      document.removeEventListener('click', handleNavClick)
      window.removeEventListener('keydown', handleKeyDown)
      if (observer) observer.kill()
    }
  }, [])

  return (
    <>
      <Scene />
      
      <main ref={mainRef} className="relative z-10 w-full">
        <nav suppressHydrationWarning className="fixed right-[3vw] top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 mix-blend-multiply pointer-events-auto">
          <Magnetic>
            <a href="#hero" className="nav-dot nav-dot-0 flex items-center justify-center min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark rounded-full group" aria-label="Go to Top">
              <span className="block w-2 h-2 rounded-full bg-brand-dark opacity-100 scale-150 transition-colors group-hover:scale-150" />
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#manifesto" className="nav-dot nav-dot-1 flex items-center justify-center min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark rounded-full group" aria-label="Go to Manifesto">
              <span className="block w-2 h-2 rounded-full bg-brand-dark opacity-20 transition-colors group-hover:opacity-100" />
            </a>
          </Magnetic>
          {profiles.map((profile, idx) => (
            <Magnetic key={profile.name}>
              <a 
                href={`#profile-${idx}`} 
                className={`nav-dot nav-dot-${idx + 2} flex items-center justify-center min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark rounded-full group`}
                aria-label={`Go to ${profile.name}`}
              >
                <span className="block w-2 h-2 rounded-full bg-brand-dark opacity-20 transition-colors group-hover:opacity-100" />
              </a>
            </Magnetic>
          ))}
        </nav>

        {/* HERO SECTION */}
        <header id="hero" data-color="#b56576" className="hero-section min-h-screen w-full flex items-center px-[5vw] md:px-[5vw]">
          <div className="hero-content grid grid-cols-12 gap-6 w-full">
            <div className="col-span-12 md:col-start-2 md:col-span-10">
              <SplitText 
                text="A.N.A"
                className="hero-title font-sans font-bold leading-[0.8] tracking-tighter text-[clamp(6rem,15vw,15rem)] uppercase block opacity-90 text-balance"
                style={{ WebkitTextStroke: '2px #b56576', color: 'transparent' }}
                role="heading"
                ariaLevel={1}
              />
              <p className="font-serif italic font-light text-[clamp(1.5rem,3vw,4rem)] mt-6 md:ml-[10%] text-balance">
                Arts Na Appreciation
              </p>
            </div>
          </div>
        </header>

        {/* MANIFESTO */}
        <section id="manifesto" data-color="#f7d6d0" className="min-h-screen w-full px-[5vw] grid grid-cols-12 gap-6 items-center relative z-10">
          <div className="col-span-12 md:col-start-7 md:col-span-5 border-l border-brand-dark pl-6 md:pl-12 py-4">
            <h2 className="font-serif italic font-light text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] mb-6 md:mb-8 text-balance">
              The<br />
              Visionaries
            </h2>
            <p className="text-[clamp(0.95rem,1.5vw,1.5rem)] font-light leading-relaxed text-pretty">
              We are a passionate collective of Computer Science students from Western Mindanao State University, blending the rigorous logic of algorithms with the boundless, unquantifiable creativity of the arts. This space represents our shared effort to bring digital masterpieces to life.
            </p>
          </div>
        </section>

        {/* PROFILES */}
        <div className="profiles-wrapper">
          {profiles.map((profile, idx) => {
            const isLeft = idx % 2 === 0
            return (
              <section
                key={profile.name}
                id={`profile-${idx}`}
                data-color={profile.colorHex}
                data-profile-idx={idx}
                className={`profile-section min-h-screen w-full px-[5vw] grid grid-cols-12 gap-4 md:gap-6 items-center relative z-10`}
              >
                <div
                  className={`col-span-12 ${
                    isLeft ? 'md:col-span-7' : 'md:col-start-6 md:col-span-7'
                  } flex flex-col gap-8`}
                >
                  <div className={`relative w-full animate-up ${isLeft ? 'text-left' : 'text-left md:text-right'}`}>
                    <SplitText 
                      text={profile.acronym}
                      className={`font-sans font-bold text-[clamp(3.5rem,8vw,10rem)] leading-[0.8] tracking-tighter block opacity-20`}
                      style={{ WebkitTextStroke: `2px ${profile.colorHex}`, color: 'transparent' }}
                    />
                    <h2 
                      className="font-serif italic font-semibold text-[clamp(2rem,4vw,5rem)] -mt-[2vw] relative z-10 text-balance"
                      style={{ color: profile.colorHex, textShadow: '0 0 15px #fff5f5, 0 0 30px #fff5f5' }}
                    >
                      {profile.name}
                    </h2>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 w-full animate-up border-t border-brand-dark/20 pt-6 md:pt-8 mt-2 ${isLeft ? 'text-left' : 'text-left md:text-right'}`}>
                    <div className={`col-span-1 md:col-span-7`}>
                      <blockquote className="font-sans font-medium text-[clamp(1.2rem,1.5vw,2rem)] leading-tight relative m-0 text-balance">
                        <span 
                          className="block text-[0.65rem] uppercase tracking-[0.2em] font-semibold mb-4"
                          style={{ color: profile.colorHex }}
                        >
                          Advocacy
                        </span>
                        &ldquo;{profile.advocacy}&rdquo;
                      </blockquote>
                    </div>

                    <div className={`col-span-1 md:col-span-5 flex flex-col gap-6`}>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold opacity-80">Keyword</span>
                        <span className="font-serif italic text-xl">{profile.keyword}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold opacity-80">Sympathy</span>
                        <span className="font-serif italic text-xl">{profile.sympathy}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold opacity-80">Empathy</span>
                        <span className="font-serif italic text-xl">{profile.empathy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </>
  )
}
