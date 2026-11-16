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

  // Works Grid Stagger (only on static section cards, avoiding modals and drawers)
  const gridItems = gsap.utils.toArray('.grid-item, .whatido-right .blueprint-card, .exp-card, .github-card, #about .blueprint-card');
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

  // Projects Data Repository for Detailed Modal Experience
  const projectsData = {
    'repomind-ai': {
      num: '01',
      title: 'RepoMind AI',
      tags: ['Agentic AI', 'Neo4j', 'LangGraph', 'Tree-sitter AST', 'Python'],
      problem: 'Software architectures deteriorate over time as teams add features without boundary verification. Standard linters only analyze isolated files, failing to detect cross-module architectural drift or reconstruct the historical context behind architectural decisions.',
      overview: 'RepoMind AI constructs a temporal knowledge graph of a Git repository—mapping syntax ASTs alongside evolutionary commit history. It verifies architectural rules against real dependency graphs, surfaces structural violations, and automates code reviews without hallucinations by grounding LLM reasoning strictly in verified graph facts.',
      features: [
        'Temporal AST knowledge graph constructed via Tree-sitter & Neo4j graph database',
        'Automated architecture drift detection against custom dependency & layering rules',
        'Deterministic code review powered by LangGraph stateful multi-agent workflows',
        'Automated extraction of Architectural Decision Records (ADRs) with linked commit diffs',
        'Zero-hallucination policy: LLM explains only verified graph facts with confidence scores'
      ],
      techImpl: 'Employs Tree-sitter to parse syntax trees across multiple languages, ingesting entities and call graphs into Neo4j. Git commit diffs are linked temporally. LangGraph coordinates deterministic reviewer agents that query graph invariants before drafting review comments.',
      stack: ['Python', 'LangGraph', 'Neo4j', 'Tree-sitter AST', 'Git Engine'],
      github: 'https://github.com/ByteWizard750/RepoMind-AI'
    },
    'veriai': {
      num: '02',
      title: 'VeriAI Fact-Checker',
      tags: ['NLP', 'DeBERTa-v3', 'SHAP', 'Flask', 'Live Web Search', 'Python 3.13'],
      problem: 'Automated fake news detectors frequently rely on "linguistic shortcuts" (sentiment bias, sensationalized phrasing) rather than verifying actual factual claims, leaving them vulnerable to subtle entity substitution scams and chronological date mismatches.',
      overview: 'VeriAI is a real-time fact verification and explainable AI (XAI) architecture that bridges deep NLP classification with live multi-source web evidence retrieval. By applying formal SHAP attribution metrics, it surfaces token-level explanations and rigorously cross-examines claims against fresh search engine results.',
      features: [
        'Hybrid classification pipeline featuring fine-tuned DeBERTa-v3 and Scikit-Learn baselines',
        'Formal Explainable AI (XAI) evaluation utilizing SHAP waterfall and attribution metrics',
        'Live web search evidence retrieval via DuckDuckGo and Tavily APIs',
        'Mitigation of linguistic shortcuts via adversarial synthetic evaluation sets',
        'Real-time interactive verification dashboard built with Flask and Chart.js'
      ],
      techImpl: 'DeBERTa-v3 processes input claims while live search agents retrieve grounding evidence. Model predictions are interpreted using SHAP Tree and Linear Explainers to visualize word-level impact scores. Served via Flask 3.0+ REST endpoints.',
      stack: ['Python 3.13', 'Flask', 'DeBERTa-v3', 'Scikit-Learn', 'SHAP', 'DuckDuckGo API', 'NLP'],
      github: 'https://github.com/ByteWizard750/VeriAI-Fact-Checker'
    },
    'vit-carpool': {
      num: '03',
      title: 'VIT Carpool (RideShare VIT)',
      tags: ['TypeScript 5.6', 'NestJS 10', 'React 19', 'PostGIS 3.6', 'Redis', 'Socket.io'],
      problem: 'University students and faculty face unreliable, high-cost daily commutes and chaotic ad-hoc group chats when coordinating shared airport or railway cabs, without safety verification or fair expense splitting.',
      overview: 'RideShare VIT is a high-performance, mobile-first campus carpooling and cab-sharing platform built exclusively for the VIT Chennai community. It pairs driver-led vehicle carpools with student-led cab sharing groups, powered by PostGIS geospatial indexing and real-time Socket.io coordination.',
      features: [
        'Driver-led carpooling with instant seat reservation and status lifecycles',
        'Organiser-led cab sharing with dynamic automated passenger cost splitting',
        'Intelligent route discovery using PostgreSQL PostGIS ST_DWithin spatial queries',
        'Instant real-time messaging and status updates powered by Socket.io WebSockets',
        'Campus identity verification with institutional JWT authentication and strict privacy rules'
      ],
      techImpl: 'Architected with a NestJS backend utilizing Prisma ORM and PostgreSQL 16 with PostGIS 3.6 spatial extensions. Session state and pub/sub cached in Redis 7.4. Frontend built in React 19 and Tailwind CSS with interactive Leaflet map overlays.',
      stack: ['TypeScript 5.6', 'NestJS 10', 'React 19', 'PostgreSQL', 'PostGIS 3.6', 'Redis 7.4', 'Socket.io', 'Prisma'],
      github: 'https://github.com/ByteWizard750/vit-carpool'
    },
    'ads-agent': {
      num: '04',
      title: 'ads-agent (AdGen)',
      tags: ['LangGraph', 'Hermes', 'Apify', 'OpenRouter', 'Supabase', 'Python'],
      problem: 'High-performing video ad campaigns require continuous competitor research, copy angle extraction, multi-variant script writing, and programmatic video rendering—a process that is traditionally manual, slow, and expensive.',
      overview: 'AdGen is a configuration-driven, multi-tenant AI marketing automation engine built with Hermes and LangGraph. It automates competitor creative research, extracts copy-grounded marketing angles, generates targeted ad scripts, and renders programmatic video ads without niche-specific hardcoding.',
      features: [
        'Autonomous Research Agent pulling competitor creatives via Apify integration',
        'Script Generation Agent crafting targeted hook, problem, body, and CTA variants',
        'Programmatic video rendering pipeline utilizing OpenMontage',
        'LangGraph state machine with built-in checkpointing and human-in-the-loop review',
        'Multi-tenant isolation managed via client YAML configuration and Supabase PostgreSQL'
      ],
      techImpl: 'LangGraph coordinates stateful agent nodes (Research -> Analyze -> Script -> Awaiting Approval -> Render). Apify handles scraping, OpenRouter routes LLM inferences, and Supabase manages state checkpoints and ad asset storage.',
      stack: ['Python', 'LangGraph', 'Hermes', 'Apify', 'OpenRouter', 'Supabase', 'OpenMontage'],
      github: 'https://github.com/ByteWizard750/ads-agent'
    },
    'supportflow-ai': {
      num: '05',
      title: 'SupportFlow AI',
      tags: ['Google Gemini', 'FAISS', 'Sentence Transformers', 'Streamlit', 'Python'],
      problem: 'Support desks are swamped with customer queries, leading to delayed first-response times, SLA breaches, and inconsistent troubleshooting suggestions across support agents.',
      overview: 'SupportFlow AI is an AI-powered support ticket intelligence and response assistant that analyzes incoming tickets, retrieves relevant knowledge from documentation, and drafts high-accuracy, human-reviewed response suggestions.',
      features: [
        'Automated ticket metadata extraction: Category, Priority, Sentiment, Department',
        'Retrieval-Augmented Generation (RAG) using local FAISS vector embeddings',
        'Grounded response generation with cited source knowledge articles',
        'Deterministic SLA policy tracking with automated escalation warnings',
        'Multi-page interactive operations dashboard with SQLite persistence'
      ],
      techImpl: 'Sentence Transformers encode technical documentation into dense vector embeddings indexed in FAISS. Google Gemini handles metadata classification and synthesizes grounded draft responses. Streamlit delivers the operator interface.',
      stack: ['Python', 'Google Gemini API', 'FAISS', 'Sentence Transformers', 'Streamlit', 'SQLite'],
      github: 'https://github.com/ByteWizard750/SupportFlow-AI'
    },
    'intelliscale': {
      num: '06',
      title: 'IntelliScale',
      tags: ['PyTorch', 'Gymnasium', 'Deep Q-Networks', 'Streamlit', 'Python'],
      problem: 'Rule-based and threshold-based cloud auto-scalers either over-provision compute (inflating cloud bills) or lag during unexpected traffic spikes (causing latency and SLA violations).',
      overview: 'IntelliScale simulates a dynamic cloud computing environment and applies Reinforcement Learning (Q-Learning and Deep Q-Networks / DQN) to optimize VM provisioning based on fluctuating workload demand while accounting for physical VM boot delays.',
      features: [
        'Custom cloud simulation environment adhering to the Gymnasium environment interface',
        'Reinforcement Learning agents using Q-Learning and Deep Q-Networks (DQN)',
        'Real-world constraint modeling including non-instantaneous VM boot delays',
        'Comparative benchmark evaluations against static and reactive threshold baselines',
        'Interactive Streamlit telemetry dashboard visualizing cost vs SLA violation tradeoffs'
      ],
      techImpl: 'Built with PyTorch for DQN neural network policies with experience replay and target networks. Gymnasium models reward functions balancing provisioning cost and latency penalties. Streamlit provides live workload telemetry.',
      stack: ['Python', 'PyTorch', 'Gymnasium', 'Streamlit', 'Pandas', 'NumPy'],
      github: 'https://github.com/ByteWizard750/IntelliScale-RL-Based-Cloud-Resource-Optimization'
    },
    'tmud': {
      num: '07',
      title: 'TMuD',
      tags: ['Django REST Framework', 'Spotify API', 'JavaScript', 'HTML5/CSS3', 'Python'],
      problem: 'Music fans often switch across disjointed apps to preview songs, read lyrics, discuss tracks with peers, and see how songs rank in community polls.',
      overview: 'TMuD (The Music Universe Database) is a full-stack music exploration, review, and community platform integrated directly with the Spotify Web API and backed by Django REST Framework.',
      features: [
        'Universal live search across Spotify songs, artists, and albums',
        'Persistent in-portal cross-page audio mini-player with playback controls',
        'Community review system with a 1–10 rating scale',
        'Real-time top 10 community leaderboard and discovered tracks feed',
        'Toast notifications and responsive mobile-first dark media interface'
      ],
      techImpl: 'Django REST Framework backend coordinates with Spotify Web API endpoints, handling authentication and caching track metadata. Custom frontend manages Web Audio playback states seamlessly.',
      stack: ['Python', 'Django REST Framework', 'Spotify Web API', 'JavaScript', 'HTML5/CSS3'],
      github: 'https://github.com/ByteWizard750/TMUD'
    },
    'binance-bot': {
      num: '08',
      title: 'Binance Futures Trading Bot',
      tags: ['Python 3.12+', 'Binance Futures API', 'HMAC-SHA256', 'Algorithmic Trading', 'CLI'],
      problem: 'Manual cryptocurrency futures execution suffers from emotional execution drift, latency slippage, and human rounding errors against strict exchange lot-size and price-tick filter rules.',
      overview: 'A clean, modular Python-based algorithmic trading bot engineered for the Binance Futures Testnet (USDT-M). It executes MARKET, LIMIT, and STOP_LIMIT orders with sub-second latency, rigorous HMAC-SHA256 request authentication, and automated exchange tick/lot size rule enforcement.',
      features: [
        'Full order lifecycle support: MARKET, LIMIT, and STOP_MARKET / STOP_LIMIT orders',
        'Cryptographic HMAC-SHA256 signature generation and timestamp synchronization',
        'Pre-execution validation engine enforcing exchange filter rules (minNotional, tickSize, stepSize)',
        'Dual-mode interface: headless CLI arguments for automated cron scripts and an interactive CLI',
        'Structured audit logging with execution timing, trade parameters, and error tracing'
      ],
      techImpl: 'Implemented in modular Python utilizing urllib and requests for raw REST endpoints with zero bloated wrapper dependencies. Includes HMAC-SHA256 signature hashing, decimal precision math for financial safety, and comprehensive unit tests.',
      stack: ['Python 3.12+', 'Binance Futures API', 'HMAC-SHA256', 'REST Endpoints', 'CLI'],
      github: 'https://github.com/ByteWizard750/Binance-futures-trading-bot'
    }
  };

  // 1. PROJECT DETAIL MODAL INTERACTIONS & INDEPENDENT SCROLLING
  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalScrollBody = document.getElementById('modal-scroll-body');
  let savedScrollPosition = 0;

  function openProjectModal(projectId) {
    const data = projectsData[projectId];
    if (!data || !modal) return;

    document.getElementById('modal-project-num').innerText = data.num;
    document.getElementById('modal-project-title').innerText = data.title;
    
    // Tags
    const tagsContainer = document.getElementById('modal-project-tags');
    tagsContainer.innerHTML = data.tags.map(tag => `<span class="tech-pill">${tag}</span>`).join('');

    // Problem & Overview
    document.getElementById('modal-problem').innerText = data.problem;
    document.getElementById('modal-overview').innerText = data.overview;

    // Features
    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');

    // Tech Impl
    document.getElementById('modal-tech-impl').innerText = data.techImpl;

    // Stack
    const stackContainer = document.getElementById('modal-tech-stack');
    stackContainer.innerHTML = data.stack.map(s => `<span class="tech-pill">${s}</span>`).join('');

    // GitHub link
    const ghLink = document.getElementById('modal-github-link');
    ghLink.href = data.github;

    // Reset scroll to top
    if (modalScrollBody) {
      modalScrollBody.scrollTop = 0;
    }

    // Capture exact scroll position
    savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Freeze body scroll reliably across iOS/Android/Desktop
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollPosition}px`;
    document.body.style.width = '100%';

    // Pause Lenis
    lenis.stop();

    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    }, 100);
  }

  function closeProjectModal() {
    if (!modal || !modal.classList.contains('active')) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    // Restore body scrolling & position
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollPosition);

    // Resume Lenis
    lenis.start();
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeProjectModal();
    }
  });

  // Stop scroll event propagation inside modal so background/Lenis is never triggered
  if (modalScrollBody) {
    modalScrollBody.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });
    modalScrollBody.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  // Attach click listener to all featured project cards
  document.querySelectorAll('.grid-item').forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-project-id');
      if (pid) openProjectModal(pid);
    });
  });

  // MOBILE NAVIGATION DRAWER
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');

  function openMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.add('active');
    mobileNavDrawer.setAttribute('aria-hidden', 'false');
    if (mobileMenuToggle) mobileMenuToggle.classList.add('active');
    lenis.stop();
  }

  function closeMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.remove('active');
    mobileNavDrawer.setAttribute('aria-hidden', 'true');
    if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
    lenis.start();
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      if (mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // 2. PROJECT CATEGORY FILTERING
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.grid-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          gsap.to(card, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            onStart: () => { card.style.display = 'block'; }
          });
        } else {
          gsap.to(card, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => { card.style.display = 'none'; }
          });
        }
      });

      // Synchronize ScrollTrigger
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 400);
    });
  });

  // 3. MORE EXPERIMENTS & PROJECTS (Accordion Explorer)
  const toggleExplorerBtn = document.getElementById('toggle-explorer-btn');
  const explorerContent = document.getElementById('explorer-content');

  if (toggleExplorerBtn && explorerContent) {
    toggleExplorerBtn.addEventListener('click', () => {
      const isExpanded = explorerContent.classList.contains('expanded');
      if (isExpanded) {
        explorerContent.classList.remove('expanded');
        explorerContent.classList.add('collapsed');
        toggleExplorerBtn.classList.remove('expanded');
      } else {
        explorerContent.classList.remove('collapsed');
        explorerContent.classList.add('expanded');
        toggleExplorerBtn.classList.add('expanded');
      }
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 450);
    });
  }

  // 4. LENIS SMOOTH ANCHOR NAVIGATION
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, {
            offset: -60,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      }
    });
  });

  // 5. 3D CUSTOM CURSOR LOGIC (Sleek 38px, Radiant 3D Glow, Highly Responsive)
  const cursorWrapper = document.querySelector('.cursor-wrapper');
  const cursorHoverState = document.querySelector('.cursor-hover-state');
  const cursorOrb = document.querySelector('.cursor-3d-orb');

  if (cursorWrapper && window.matchMedia("(pointer: fine)").matches) {
    let xTo = gsap.quickTo(cursorWrapper, "x", {duration: 0.15, ease: "power3"});
    let yTo = gsap.quickTo(cursorWrapper, "y", {duration: 0.15, ease: "power3"});

    let isHovering = false;

    window.addEventListener("mousemove", (e) => {
      if (cursorWrapper.style.opacity === "0" || cursorWrapper.style.opacity === "") {
        gsap.to(cursorWrapper, { opacity: 1, duration: 0.2 });
      }
      xTo(e.clientX - 19); // Centered on 38x38 orb
      yTo(e.clientY - 19);

      // Check for clickable interactive elements
      const target = e.target.closest(
        'a, button, input, .grid-item-head, .btn-view-details, .filter-btn, .explorer-card, .explorer-toggle-btn, .btn-github-profile, .gh-repo-item, .modal-close-btn, .btn-modal-primary, .thumb-wrapper, .mobile-menu-toggle'
      );

      if (target && !isHovering) {
        isHovering = true;
        gsap.to(cursorHoverState, {
          scale: 1.4,
          duration: 0.3,
          ease: "back.out(1.5)",
          overwrite: "auto"
        });
        gsap.to(cursorOrb, {
          boxShadow: "0 0 35px rgba(213, 174, 255, 0.95), 0 0 65px rgba(164, 93, 250, 0.6), inset -3px -3px 8px rgba(120, 50, 200, 0.4)",
          duration: 0.3,
          overwrite: "auto"
        });
      } else if (!target && isHovering) {
        isHovering = false;
        gsap.to(cursorHoverState, {
          scale: 1,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto"
        });
        gsap.to(cursorOrb, {
          boxShadow: "0 0 22px rgba(213, 174, 255, 0.75), 0 0 45px rgba(164, 93, 250, 0.45), inset -3px -3px 8px rgba(120, 50, 200, 0.4)",
          duration: 0.25,
          overwrite: "auto"
        });
      }
    });

    // Tactile Click Response
    window.addEventListener("mousedown", () => {
      gsap.to(cursorHoverState, {
        scale: isHovering ? 1.15 : 0.82,
        duration: 0.12,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
    window.addEventListener("mouseup", () => {
      gsap.to(cursorHoverState, {
        scale: isHovering ? 1.4 : 1,
        duration: 0.25,
        ease: "back.out(1.5)",
        overwrite: "auto"
      });
    });

    // Window Leave/Enter handling
    document.addEventListener("mouseleave", () => {
      gsap.to(cursorWrapper, { opacity: 0, duration: 0.2 });
    });
    document.addEventListener("mouseenter", () => {
      gsap.to(cursorWrapper, { opacity: 1, duration: 0.2 });
    });
  }

  // 6. MAGNETIC HOVER PHYSICS
  const magnets = document.querySelectorAll('.nav-links a, .sidebar-socials a, .btn-resume, .filter-btn, .explorer-toggle-btn, .btn-github-profile');
  magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
      const bound = magnet.getBoundingClientRect();
      const x = (e.clientX - bound.left - bound.width / 2) * 0.35;
      const y = (e.clientY - bound.top - bound.height / 2) * 0.35;
      gsap.to(magnet, { x: x, y: y, duration: 0.8, ease: "power3.out", overwrite: "auto" });
    });
    magnet.addEventListener('mouseleave', () => {
      gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)", overwrite: "auto" });
    });
  });

  // 7. THUMBNAIL IMAGE PARALLAX
  const thumbs = gsap.utils.toArray('.thumb-wrapper');
  thumbs.forEach((wrapper) => {
    const img = wrapper.querySelector('.thumb-image');
    if (img) {
      gsap.to(img, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
      
      wrapper.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.05, duration: 0.6, ease: "power2.out", overwrite: "auto" });
      });
      wrapper.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1, duration: 0.6, ease: "power2.out", overwrite: "auto" });
      });
    }
  });

});
