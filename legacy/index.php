<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A.N.A || ARTS NA APPRECIATION</title>
  <link rel="stylesheet" href="style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">
  <!-- GSAP & ScrollTrigger -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <!-- Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <!--
  THESIS: A highly editorial, non-generic, scrolling 3D journey for the A.N.A group.
  OWN-WORLD: Abstract, monolithic typography (Space Grotesk) clashing with delicate, academic serif (Cormorant Garamond). Fixed WebGL canvas injecting kinetic energy behind structured, asymmetrical data blocks.
  STORY: A gallery-like descent. Each member is an installation.
  FIRST VIEWPORT: Massive group typography, abstract 3D forms drifting, and a stark invitation to scroll.
  FORM: Single-page scroll narrative.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
  -->
  
  <canvas id="webgl-canvas"></canvas>

  <main class="scroll-container">
    <header class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">A.N.A</h1>
        <p class="hero-subtitle">Arts Na Appreciation</p>
        <div class="scroll-indicator">
          <span>Scroll to Explore</span>
          <div class="line"></div>
        </div>
      </div>
    </header>

    <section class="manifesto-section">
      <div class="manifesto-block">
        <h2 class="manifesto-heading">The<br>Visionaries</h2>
        <p class="manifesto-text">We are a passionate collective of Computer Science students from Western Mindanao State University, blending the rigorous logic of algorithms with the boundless, unquantifiable creativity of the arts. This space represents our shared effort to bring digital masterpieces to life.</p>
      </div>
    </section>

    <!-- Profiles -->
    <div class="profiles-wrapper">
      
      <!-- 1. JJD -->
      <section class="profile-section align-left">
        <div class="profile-grid">
          <div class="profile-main">
            <span class="acronym-title">JUDICIOUS</span>
            <h2 class="real-name">Janus Dominic</h2>
          </div>
          <div class="profile-advocacy">
            <blockquote>"Finish what you started"</blockquote>
          </div>
          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">Keyword</span>
              <span class="meta-value">Technology</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Sympathy</span>
              <span class="meta-value">Poverty</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Empathy</span>
              <span class="meta-value">A parent loss</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. MDMC -->
      <section class="profile-section align-right">
        <div class="profile-grid">
          <div class="profile-main">
            <span class="acronym-title">DEMURE MERRY</span>
            <h2 class="real-name">Diana Mae Castillon</h2>
          </div>
          <div class="profile-advocacy">
            <blockquote>"Never give up"</blockquote>
          </div>
          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">Keyword</span>
              <span class="meta-value">Arts</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Sympathy</span>
              <span class="meta-value">Pet dogs</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Empathy</span>
              <span class="meta-value">Understanding how it feels to lose a loving pet</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. AJN -->
      <section class="profile-section align-left">
        <div class="profile-grid">
          <div class="profile-main">
            <span class="acronym-title">ADORED JUICY</span>
            <h2 class="real-name">Ace John Nieva</h2>
          </div>
          <div class="profile-advocacy">
            <blockquote>"Share kindness"</blockquote>
          </div>
          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">Keyword</span>
              <span class="meta-value">Improvement</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Sympathy</span>
              <span class="meta-value">Grieving</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Empathy</span>
              <span class="meta-value">The disappearance of something precious</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. PLL -->
      <section class="profile-section align-right">
        <div class="profile-grid">
          <div class="profile-main">
            <span class="acronym-title">PLEASING LOVING</span>
            <h2 class="real-name">Paolo Lorenzo Longcob</h2>
          </div>
          <div class="profile-advocacy">
            <blockquote>"Digital literacy and online safety advocacy"</blockquote>
          </div>
          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">Keyword</span>
              <span class="meta-value">Knowledge</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Sympathy</span>
              <span class="meta-value">Beggars</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Empathy</span>
              <span class="meta-value">Emotional support</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. WP -->
      <section class="profile-section align-left">
        <div class="profile-grid">
          <div class="profile-main">
            <span class="acronym-title">WANTED</span>
            <h2 class="real-name">Wynry Perian</h2>
          </div>
          <div class="profile-advocacy">
            <blockquote>"Let your voice be heard"</blockquote>
          </div>
          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">Keyword</span>
              <span class="meta-value">Justice</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Sympathy</span>
              <span class="meta-value">Addiction</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Empathy</span>
              <span class="meta-value">Struggle</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. CAM -->
      <section class="profile-section align-right">
        <div class="profile-grid">
          <div class="profile-main">
            <span class="acronym-title">CARING ANGELIC</span>
            <h2 class="real-name">Carlos Angelou Machutes</h2>
          </div>
          <div class="profile-advocacy">
            <blockquote>"Accepting makes things easier"</blockquote>
          </div>
          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">Keyword</span>
              <span class="meta-value">Growth</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Sympathy</span>
              <span class="meta-value">Mental health struggles</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Empathy</span>
              <span class="meta-value">Losing someone dear</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  </main>
  
  <script src="script.js"></script>
</body>
</html>
