import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true,
});

// Stop scrolling completely while loading
lenis.stop();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Force browser to ALWAYS start at the very top on reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
document.body.style.overflow = "hidden"; // physically disable the scrollbar

// Preloader Logic
window.addEventListener('load', () => {
  let perc = { val: 0 };
  const percText = document.getElementById("loader-perc");
  const statusEl = document.getElementById("loader-status");
  
  // Rapid fire technical statuses
  const statuses = [
    "INITIALIZING SYSTEMS...",
    "LOADING ASSETS...",
    "RENDERING MESH...",
    "ESTABLISHING CONNECTION...",
    "BOOT SEQUENCE COMPLETE"
  ];
  let statusTime = 3 / statuses.length;
  statuses.forEach((text, i) => {
    gsap.delayedCall(i * statusTime, () => {
      if (statusEl) statusEl.innerHTML = text;
    });
  });
  
  // Slow subtle zoom out of the entire loader
  gsap.fromTo(".loader-massive-wrapper", 
    { scale: 1.05 }, 
    { scale: 1, duration: 3, ease: "power2.out" }
  );

  // Fake loading animation
  gsap.to(perc, {
    val: 100,
    duration: 3, // 3 second load hold for immersion
    ease: "power2.inOut",
    onUpdate: () => {
      // pad with 0 if under 10
      let num = Math.round(perc.val);
      percText.innerHTML = num < 10 ? '0' + num : num;
      document.getElementById("loader-fill").style.width = num + "%";
    },
    onComplete: () => {
      // Fire the exit loader trigger
      const tl = gsap.timeline();
      
      // Snuff out the loader massive wrapper
      tl.to(".loader-massive-wrapper", { scale: 0.9, opacity: 0, duration: 0.4, ease: "power2.out" })
        .to("#preloader", {
          opacity: 0,
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            document.getElementById("preloader").style.display = "none";
            window.scrollTo(0, 0); // Final alignment lock
            document.body.style.overflow = ""; // restore scrollbar
            lenis.start(); // re-enable lenis smooth scroll
          }
        }, "+=0.2")

        // Trigger Main Hero Sequence
        .from(".hide-on-load, .corner-l", { opacity: 0, duration: 1.5, ease: "power2.out" }, "-=0.4")
        .from(".reveal-avatar", { y: -50, scale: 0.95, opacity: 0, duration: 1.5, ease: "power4.out" }, "-=1")
        .from(".ambient-mesh", { scale: 0.5, opacity: 0, duration: 2, ease: "power3.out" }, "-=1.5")
        .from(".hero-small-text", { opacity: 0, x: -20, duration: 1, stagger: 0.1 }, "-=1")
        .from(".staggered span", {
          y: 80, opacity: 0, rotation: 2, duration: 1.2, stagger: 0.15, ease: "power4.out"
        }, "-=0.8");
    }
  });

  // Parallax the ambient glow orb for depth
  gsap.to(".ambient-mesh", {
    y: 150,
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  // Works Grid Stagger
  const gridItems = gsap.utils.toArray('.grid-item, .blueprint-card');
  gridItems.forEach((item) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  });

  // What I Do Vertical text reveal
  gsap.from(".massive-vertical", {
    scrollTrigger: {
      trigger: ".whatido-block",
      start: "top 70%",
    },
    x: -50,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out"
  });

  // Desk Avatar Fade
  gsap.from(".desk-image", {
    scrollTrigger: {
      trigger: ".whatido-block",
      start: "top 60%",
    },
    y: 50,
    scale: 0.9,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out"
  });
});
