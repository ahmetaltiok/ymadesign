// ── Hamburger Menü ────────────────────────────────────────────
(function initMenu() {
  const toggle = document.getElementById('menu-toggle');
  const overlay = document.getElementById('menu-overlay');
  const links = overlay ? overlay.querySelectorAll('.menu-link') : [];
  if (!toggle || !overlay) return;

  function openMenu() {
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Menüyü kapat');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menüyü aç');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = targetId ? document.querySelector(targetId) : null;
      closeMenu();
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeMenu();
    }
  });
})();

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODEL_CANDIDATES = ["./Untitled.glb", "./logo.glb"];
const BASE_ROTATION = {
  x: Math.PI / 2,
  y: 0,
  z: 0
};
const MOUSE_ROTATION = {
  y: 0.5
};
const canvas = document.getElementById("logo-canvas");
const modelStatus = document.getElementById("model-status");
const portfolioSection = document.getElementById("portfolio");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.38;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 0, 6);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.88);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xf6f9ff, 0x11111a, 1.15);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3.45);
keyLight.position.set(3.8, 4.8, 4.2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -6;
keyLight.shadow.camera.right = 6;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -6;
keyLight.shadow.bias = -0.00025;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd6e5ff, 1.42);
fillLight.position.set(-4.2, 1.6, 2.6);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xb8deff, 2.1);
rimLight.position.set(-3.2, 2.4, -5.2);
scene.add(rimLight);

const topLight = new THREE.SpotLight(0xffffff, 1.85, 26, Math.PI / 5, 0.28, 1.2);
topLight.position.set(0, 6, 1.4);
topLight.castShadow = true;
topLight.shadow.mapSize.set(1024, 1024);
topLight.shadow.bias = -0.00018;
scene.add(topLight);

const shadowPlaneMaterial = new THREE.ShadowMaterial({
  color: 0x000000,
  opacity: 0.23
});
const shadowPlane = new THREE.Mesh(
  new THREE.CircleGeometry(4.2, 64),
  shadowPlaneMaterial
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -1.42;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

const motionPivot = new THREE.Group();
const logoPivot = new THREE.Group();
scene.add(motionPivot);
motionPivot.add(logoPivot);
logoPivot.rotation.set(BASE_ROTATION.x, BASE_ROTATION.y, BASE_ROTATION.z);
topLight.target = logoPivot;

function applyThemeMode(isDark) {
  document.body.classList.toggle("theme-dark", isDark);
  renderer.setClearColor(0x000000, 1);
  shadowPlaneMaterial.opacity = isDark ? 0.24 : 0.18;
  ambientLight.intensity = isDark ? 1.04 : 0.88;
  hemiLight.intensity = isDark ? 1.25 : 1.15;
  keyLight.intensity = isDark ? 3.75 : 3.45;
  fillLight.intensity = isDark ? 1.62 : 1.42;
  rimLight.intensity = isDark ? 2.35 : 2.1;
  topLight.intensity = isDark ? 2.05 : 1.85;
}

const target = {
  y: 0
};

const mouse = {
  x: 0,
  y: 0
};

window.addEventListener("pointermove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
});

function centerAndScaleModel(model) {
  const boxBefore = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  boxBefore.getSize(size);

  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const fitScale = 2.4 / maxDimension;
  model.scale.setScalar(fitScale);

  const boxAfter = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  boxAfter.getCenter(center);
  model.position.sub(center);
}

const loader = new GLTFLoader();
const LUMINANCE_THRESHOLD = 0.5;

function setStatus(message) {
  modelStatus.hidden = false;
  modelStatus.textContent = message;
}

function clearStatus() {
  modelStatus.hidden = true;
  modelStatus.textContent = "";
}

function getMaterialLuminance(model) {
  let total = 0;
  let count = 0;

  model.traverse((node) => {
    if (!node.isMesh || !node.material) {
      return;
    }

    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];

    materials.forEach((material) => {
      if (!material || !material.color) {
        return;
      }

      const color = material.color;
      const luminance =
        0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;

      total += luminance;
      count += 1;
    });
  });

  if (count === 0) {
    return null;
  }

  return total / count;
}

function applyContrastTheme(model) {
  const luminance = getMaterialLuminance(model);
  const isDarkModel =
    luminance === null ? true : luminance < LUMINANCE_THRESHOLD;
  const autoDarkTheme = !isDarkModel;
  applyThemeMode(autoDarkTheme);
}

async function loadModel() {
  let lastError = null;
  const isFileProtocol = window.location.protocol === "file:";

  if (isFileProtocol) {
    setStatus("file:// modunda model engellenebilir. Yerel sunucu ile ac.");
  }

  for (const url of MODEL_CANDIDATES) {
    try {
      const gltf = await loader.loadAsync(url);

      const model = gltf.scene;
      centerAndScaleModel(model);

      model.traverse((node) => {
        if (!node.isMesh) {
          return;
        }

        node.castShadow = true;
        node.receiveShadow = false;

        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];

        materials.forEach((material) => {
          if (!material) {
            return;
          }

          if (material.color) {
            material.color.setHex(0xf0f0f0);
          }

          if (material.emissive) {
            material.emissive.setHex(0x1f1f1f);
          }

          if (typeof material.emissiveIntensity === "number") {
            material.emissiveIntensity = 0.18;
          }

          if ("map" in material) {
            material.map = null;
          }

          if ("vertexColors" in material) {
            material.vertexColors = false;
          }

          if (typeof material.metalness === "number") {
            material.metalness = 0.02;
          }

          if (typeof material.envMapIntensity === "number") {
            material.envMapIntensity = Math.max(material.envMapIntensity, 1.15);
          }

          if (typeof material.roughness === "number") {
            material.roughness = Math.min(material.roughness, 0.3);
          }

          material.needsUpdate = true;
        });
      });

      applyContrastTheme(model);
      logoPivot.add(model);
      clearStatus();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  const fileHint = isFileProtocol ? " Yerel sunucu ile ac: http://localhost:5500" : "";
  setStatus(
    `3D model yuklenemedi. logo.glb veya Untitled.glb dosyasini kontrol et.${fileHint}`
  );
  console.error("3D model yuklenemedi:", lastError);
}

loadModel();

if (portfolioSection) {
  const portfolioObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          portfolioSection.classList.add("portfolio-visible");
        }
      });
    },
    { threshold: 0.28 }
  );

  portfolioObserver.observe(portfolioSection);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener("resize", onResize);

function animate() {
  requestAnimationFrame(animate);

  target.y = mouse.x * MOUSE_ROTATION.y;

  motionPivot.rotation.y += (target.y - motionPivot.rotation.y) * 0.08;
  motionPivot.rotation.x += (0 - motionPivot.rotation.x) * 0.08;

  const keyTargetX = 3.8 + mouse.x * 1.15;
  const keyTargetY = 4.8 + mouse.y * 0.45;
  const rimTargetX = -3.2 - mouse.x * 0.8;

  keyLight.position.x += (keyTargetX - keyLight.position.x) * 0.04;
  keyLight.position.y += (keyTargetY - keyLight.position.y) * 0.04;
  rimLight.position.x += (rimTargetX - rimLight.position.x) * 0.03;

  renderer.render(scene, camera);
}

animate();

// ── Text 3D Flip (MagicUI-style) ────────────────────────────
(function initText3DFlip() {
  const containers = document.querySelectorAll('.text-3d-flip');
  if (!containers.length) return;

  const HAS_SEGMENTER = typeof Intl !== 'undefined' && 'Segmenter' in Intl;

  function splitGraphemes(text) {
    if (HAS_SEGMENTER) {
      const segmenter = new Intl.Segmenter('tr', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (s) => s.segment);
    }
    return Array.from(text);
  }

  function splitIntoWordsAndChars(text) {
    const words = text.split(' ');
    return words.map((word, i) => ({
      chars: splitGraphemes(word),
      needsSpace: i !== words.length - 1
    }));
  }

  function getTransforms(height) {
    return {
      container: `translateZ(${-height / 2}px)`,
      front: `translateZ(${height / 2}px)`,
      back: `rotateX(-90deg) translateZ(${height / 2}px)`,
      target: 'rotateX(90deg)',
      reset: 'rotateX(0deg) rotateY(0deg)'
    };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  containers.forEach((container) => {
    const raw = (container.textContent || '').replace(/\s+/g, ' ').trim();
    if (!raw) return;

    container.setAttribute('aria-label', raw);
    container.setAttribute('tabindex', '0');

    const computed = getComputedStyle(container);
    const lineHeightStr = computed.lineHeight;
    let charHeight;
    if (lineHeightStr === 'normal') {
      charHeight = parseFloat(computed.fontSize) * 1.2;
    } else {
      charHeight = parseFloat(lineHeightStr);
    }

    const t = getTransforms(charHeight);
    const words = splitIntoWordsAndChars(raw);

    let html = `<span class="sr-only">${escapeHtml(raw)}</span>`;

    words.forEach((wordObj) => {
      html += '<span class="word">';
      wordObj.chars.forEach((char) => {
        const escaped = escapeHtml(char);
        html += `<span class="text-3d-flip-char" style="transform: ${t.container};">
          <span class="face-front" style="transform: ${t.front}; height: ${charHeight}px;">${escaped}</span>
          <span class="face-back" style="transform: ${t.back}; height: ${charHeight}px;">${escaped}</span>
        </span>`;
      });
      if (wordObj.needsSpace) {
        html += '<span class="whitespace-pre"> </span>';
      }
      html += '</span>';
    });

    container.innerHTML = html;

    let isAnimating = false;

    const triggerAnimation = async () => {
      if (isAnimating) return;
      isAnimating = true;

      const chars = container.querySelectorAll('.text-3d-flip-char');
      const animations = [];

      chars.forEach((char, i) => {
        const anim = char.animate(
          [
            { transform: `${t.container} ${t.reset}` },
            { transform: `${t.container} ${t.target}` }
          ],
          {
            duration: 500,
            delay: i * 50,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            fill: 'forwards'
          }
        );
        animations.push(anim);
      });

      await Promise.all(animations.map((a) => a.finished));

      chars.forEach((char) => {
        char.style.transform = `${t.container} ${t.reset}`;
      });
      animations.forEach((a) => a.cancel());

      isAnimating = false;
    };

    container.addEventListener('mouseenter', triggerAnimation);
    container.addEventListener('focus', triggerAnimation);
  });
})();

// ── Video Text (MagicUI-style) ──────────────────────────────
(function initVideoText() {
  const maskContainer = document.querySelector('.video-text-mask');
  if (!maskContainer) return;

  const text = 'YMA DESIGN';

  function updateMask() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' font-size='15vw' font-weight='700' text-anchor='middle' dominant-baseline='middle' font-family='Space Grotesk, sans-serif' fill='white'>${text}</text></svg>`;
    const dataUrl = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    maskContainer.style.setProperty('--mask-url', dataUrl);
  }

  updateMask();
  window.addEventListener('resize', updateMask);

  const slides = document.querySelectorAll('.video-slide');
  if (!slides.length) return;

  let current = 0;
  const interval = 4000;

  slides.forEach((slide, i) => {
    if (i === 0) {
      slide.classList.add('active');
      slide.play().catch(() => {});
    }
  });

  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
    slides[current].play().catch(() => {});
  }, interval);
})();

// ── Projeler Galerisi: Scroll Fade-in + Lightbox ────────────
(function initProjects() {
  const PROJECTS = {
    bros: {
      name: 'BROS',
      photos: [
        'Fotograflar/Bros1.jpg',
        'Fotograflar/Bros2.jpg',
        'Fotograflar/Bros3.jpg',
        'Fotograflar/Bros4.jpg',
        'Fotograflar/Bros5.jpg',
        'Fotograflar/Bros6.jpg',
        'Fotograflar/Bros7.jpg'
      ]
    },
    'doganköy': {
      name: 'DOĞANKÖY CONCEPT',
      photos: [
        'Fotograflar/DoğanköyConcept1.jpg',
        'Fotograflar/DoğanköyConcept2.jpg',
        'Fotograflar/DoğanköyConcept3.jpg',
        'Fotograflar/DoğanköyConcept4.jpg',
        'Fotograflar/DoğanköyConcept5.jpg',
        'Fotograflar/DoğanköyConcept6.jpg',
        'Fotograflar/DoğanköyConcept7.jpg',
        'Fotograflar/DoğanköyConcept8.jpg',
        'Fotograflar/DoğanköyConcept9.jpg',
        'Fotograflar/DoğanköyConcept10.jpg',
        'Fotograflar/DoğanköyConcept11.jpg',
        'Fotograflar/DoğanköyConcept12.jpg'
      ]
    },
    kafkas: {
      name: 'KAFKAS',
      photos: [
        'Fotograflar/Kafkas1.jpg',
        'Fotograflar/Kafkas2.jpg',
        'Fotograflar/Kafkas3.jpg',
        'Fotograflar/Kafkas4.jpg',
        'Fotograflar/Kafkas5.jpg'
      ]
    },
    kumova: {
      name: 'KUMOVA SUITES',
      photos: [
        'Fotograflar/KumovaSuites1.jpg',
        'Fotograflar/KumovaSuites2.jpg',
        'Fotograflar/KumovaSuites3.jpg',
        'Fotograflar/KumovaSuites4.jpg',
        'Fotograflar/KumovaSuites5.jpg',
        'Fotograflar/KumovaSuites6.jpg',
        'Fotograflar/KumovaSuites7.jpg',
        'Fotograflar/KumovaSuites8.jpg',
        'Fotograflar/KumovaSuites9.jpg',
        'Fotograflar/KumovaSuites10.jpg',
        'Fotograflar/KumovaSuites11.jpg',
        'Fotograflar/KumovaSuites12.jpg',
        'Fotograflar/KumovaSuites13.jpg'
      ]
    },
    luxury: {
      name: 'LUXURY',
      photos: [
        'Fotograflar/Luxury1.jpg',
        'Fotograflar/Luxury2.jpg',
        'Fotograflar/Luxury3.jpg',
        'Fotograflar/Luxury4.jpg',
        'Fotograflar/Luxury5.jpg',
        'Fotograflar/Luxury6.jpg',
        'Fotograflar/Luxury7.jpg'
      ]
    },
    fehmi: {
      name: 'FEHMİ',
      photos: [
        'Fotograflar/fehmi1.jpg',
        'Fotograflar/fehmi2.jpg',
        'Fotograflar/fehmi3.jpg',
        'Fotograflar/fehmi4.jpg',
        'Fotograflar/fehmi5.jpg',
        'Fotograflar/fehmi6.jpg'
      ]
    }
  };

  const cards = document.querySelectorAll('.project-card');
  const projectsSection = document.getElementById('projects');
  if (!cards.length || !projectsSection) return;

  let animationTimeout = null;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (animationTimeout) clearTimeout(animationTimeout);
          animationTimeout = setTimeout(() => {
            cards.forEach((card, idx) => {
              setTimeout(() => {
                card.classList.add('card-visible');
              }, idx * 100);
            });
          }, 150);
        } else {
          if (animationTimeout) clearTimeout(animationTimeout);
          cards.forEach((card) => card.classList.remove('card-visible'));
        }
      });
    },
    { threshold: 0.12 }
  );

  sectionObserver.observe(projectsSection);

  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightbox-img');
  const lbTitle      = document.getElementById('lightbox-title');
  const lbCounter    = document.getElementById('lightbox-counter');
  const lbClose      = document.getElementById('lightbox-close');
  const lbPrev       = document.getElementById('lightbox-prev');
  const lbNext       = document.getElementById('lightbox-next');

  if (!lightbox) return;

  let activeProject = null;
  let activeIndex   = 0;

  function openLightbox(projectKey, startIndex) {
    activeProject = PROJECTS[projectKey];
    if (!activeProject) return;
    activeIndex = startIndex || 0;

    lbTitle.textContent = activeProject.name;
    showPhoto(activeIndex, false);

    lightbox.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => lightbox.classList.add('lightbox-open'));
    });
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('lightbox-open');
    setTimeout(() => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      activeProject = null;
    }, 360);
  }

  function showPhoto(index, animate = true) {
    if (!activeProject) return;
    const total = activeProject.photos.length;
    activeIndex = (index + total) % total;

    lbCounter.textContent = `${activeIndex + 1} / ${total}`;

    if (animate) {
      const nextSrc = activeProject.photos[activeIndex];

      lbImg.classList.add('img-fade');

      const preload = new Image();
      preload.onload = () => {
        lbImg.src = nextSrc;
        lbImg.alt = `${activeProject.name} — ${activeIndex + 1}`;
        requestAnimationFrame(() => {
          lbImg.classList.remove('img-fade');
        });
      };
      preload.onerror = () => {
        lbImg.src = nextSrc;
        lbImg.alt = `${activeProject.name} — ${activeIndex + 1}`;
        lbImg.classList.remove('img-fade');
      };
      preload.src = nextSrc;
    } else {
      lbImg.src = activeProject.photos[activeIndex];
      lbImg.alt = `${activeProject.name} — ${activeIndex + 1}`;
    }
  }

  cards.forEach((card) => {
    const projectKey = card.dataset.project;

    card.addEventListener('click', () => openLightbox(projectKey, 0));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(projectKey, 0);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lbPrev.addEventListener('click', () => showPhoto(activeIndex - 1));
  lbNext.addEventListener('click', () => showPhoto(activeIndex + 1));

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPhoto(activeIndex - 1);
    if (e.key === 'ArrowRight')  showPhoto(activeIndex + 1);
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) showPhoto(activeIndex + 1);
    else          showPhoto(activeIndex - 1);
  }, { passive: true });
})();

// ── Flickering Grid (MagicUI-style) ──────────────────────────
(function initFlickeringGrid() {
  const grid = document.querySelector('.flickering-grid');
  if (!grid) return;

  const COLS = 20;
  const ROWS = 12;

  function buildGrid() {
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < COLS * ROWS; i++) {
      const cell = document.createElement('div');
      cell.classList.add('flickering-cell');
      cell.style.setProperty('--fd', `${1.8 + Math.random() * 3.2}s`);
      cell.style.setProperty('--dd', `${Math.random() * 4}s`);
      cell.style.setProperty('--fo', `${0.25 + Math.random() * 0.6}`);
      cell.style.setProperty('--fb', `${0.1 + Math.random() * 0.2}`);
      fragment.appendChild(cell);
    }
    grid.appendChild(fragment);
  }

  buildGrid();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildGrid, 400);
  });
})();

// ── Magic Cards Spotlight (MagicUI-style) ────────────────────
(function initMagicCards() {
  const cards = document.querySelectorAll('.magic-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
      card.style.setProperty('--spotlight-opacity', '1');
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--spotlight-opacity', '0');
    });
  });
})();
