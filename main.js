/* ==========================================================================
   Generation Music Academy - Premium Interactivity Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // Initialize Lucide icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Initialize custom cursor
    initCustomCursor();

    // Initialize Ambient Audio Synth
    initAmbientAudio();

    // Initialize Three.js 3D Scene
    initThreeJSBackground();

    // Initialize 2D Soundwave Visualizer
    initSoundwaveVisualizer();

    // Initialize GSAP & ScrollTrigger Animations
    initGSAPScrollAnimations();

    // Initialize 3D Card Tilts
    initCard3DTilt();

    // Initialize Stats Counters
    initStatsCounters();

    // Initialize Testimonial Slider
    initTestimonialsSlider();

    // Initialize Lightbox Gallery
    initLightboxGallery();

    // Initialize Branches Interactive Map
    initBranchesMap();

    // Initialize Demo Class Form Handler
    initDemoFormHandler();

    // Initialize Mobile Menu
    initMobileMenu();
    
    // Handle Navbar Scrolled styling
    window.addEventListener("scroll", () => {
        const navbar = document.getElementById("navbar");
        if (window.scrollY > 50) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }
    });
});

/* ==========================================================================
   1. Custom Cursor Controller
   ========================================================================== */
function initCustomCursor() {
    const dot = document.getElementById("cursor-dot");
    const glow = document.getElementById("cursor-glow");
    
    if (!dot || !glow) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let glowX = 0, glowY = 0;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Custom easing loop for cursor follow
    function updateCursor() {
        // Smooth interpolation (lerp)
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;
        
        glowX += (mouseX - glowX) * 0.12;
        glowY += (mouseY - glowY) * 0.12;

        dot.style.left = `${dotX}px`;
        dot.style.top = `${dotY}px`;

        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover detection classes
    const hoverables = document.querySelectorAll("a, button, select, input, .map-marker, .course-card-3d, .gallery-item");
    hoverables.forEach(item => {
        item.addEventListener("mouseenter", () => {
            document.body.classList.add("cursor-hover");
        });
        item.addEventListener("mouseleave", () => {
            document.body.classList.remove("cursor-hover");
        });
    });
}

/* ==========================================================================
   2. Web Audio Procedural Synth Pad (Ambient Sound)
   ========================================================================== */
function initAmbientAudio() {
    const toggleBtn = document.getElementById("audio-toggle");
    if (!toggleBtn) return;

    let audioCtx = null;
    let oscillators = [];
    let masterGain = null;
    let isPlaying = false;

    toggleBtn.addEventListener("click", () => {
        if (!isPlaying) {
            startSynth();
        } else {
            stopSynth();
        }
    });

    function startSynth() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Mellow warm major chord: C3, G3, C4, E4, G4, B4
                const chordNotes = [130.81, 196.00, 261.63, 329.63, 392.00, 493.88];
                
                masterGain = audioCtx.createGain();
                masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
                
                // Lowpass filter for warm, cozy synth pad sound
                const lowpassFilter = audioCtx.createBiquadFilter();
                lowpassFilter.type = 'lowpass';
                lowpassFilter.frequency.setValueAtTime(320, audioCtx.currentTime);
                lowpassFilter.Q.setValueAtTime(1.2, audioCtx.currentTime);
                
                // Spacey delay feedback loop
                const delayNode = audioCtx.createDelay(1.5);
                delayNode.delayTime.setValueAtTime(0.5, audioCtx.currentTime);
                const delayGain = audioCtx.createGain();
                delayGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                
                // Routing
                masterGain.connect(lowpassFilter);
                lowpassFilter.connect(audioCtx.destination);
                
                lowpassFilter.connect(delayNode);
                delayNode.connect(delayGain);
                delayGain.connect(delayNode); // loop feedback
                delayGain.connect(audioCtx.destination);
                
                // Create warm oscillators with slow chorus LFOs
                chordNotes.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const oscGain = audioCtx.createGain();
                    
                    osc.type = 'triangle'; // Smooth mellow sound
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                    
                    // LFO to modulate frequency slightly for lush chorus sound
                    const lfo = audioCtx.createOscillator();
                    const lfoGain = audioCtx.createGain();
                    lfo.frequency.setValueAtTime(0.08 + idx * 0.04, audioCtx.currentTime);
                    lfoGain.gain.setValueAtTime(1.8, audioCtx.currentTime);
                    
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    
                    // Setup oscillator volumes to prevent clipping
                    oscGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                    
                    osc.connect(oscGain);
                    oscGain.connect(masterGain);
                    
                    osc.start();
                    lfo.start();
                    
                    oscillators.push(osc);
                    oscillators.push(lfo);
                });
            }

            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            // Smooth linear volume ramp-up (fade-in)
            masterGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 2.0);
            
            isPlaying = true;
            toggleBtn.classList.add("playing");
            toggleBtn.querySelector("span").textContent = "Pause Ambient Sound";
            
        } catch (e) {
            console.warn("Web Audio API is blocked or unsupported in this browser", e);
        }
    }

    function stopSynth() {
        if (masterGain) {
            // Smooth linear volume ramp-down (fade-out)
            masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
        }
        isPlaying = false;
        toggleBtn.classList.remove("playing");
        toggleBtn.querySelector("span").textContent = "Play Ambient Sound";
    }
}

/* ==========================================================================
   3. Three.js Interactive Particle Backdrop
   ========================================================================== */
function initThreeJSBackground() {
    const canvas = document.getElementById("three-canvas");
    if (!canvas) return;

    // Set up scene, camera & renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create floating particle system (Star field/Notes)
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const waveOffsets = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Distribute in cylindrical/cloud pattern
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * 320 + 30;
        
        positions[i] = Math.cos(theta) * radius;
        positions[i + 1] = (Math.random() - 0.5) * 500;
        positions[i + 2] = Math.sin(theta) * radius;

        waveOffsets.push(Math.random() * Math.PI * 2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom circle-like soft particle texture using Canvas API (no external file needed)
    const pTexture = createParticleTexture();

    const material = new THREE.PointsMaterial({
        size: 2.2,
        map: pTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: 0x7C3AED // Electric Purple
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Add glowing constellation wire lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3B82F6, // Neon Blue
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    
    const linesGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(150 * 3 * 2); // 150 connection lines
    
    for (let i = 0; i < linePositions.length; i++) {
        linePositions[i] = (Math.random() - 0.5) * 300;
    }
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const constellationLines = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(constellationLines);

    // Add ambient lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7C3AED, 2, 300);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);

    // Mouse tracking for parallax rotation
    let mouseX = 0, mouseY = 0;
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
    });

    // Resize handler
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    let clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Slow scene rotations
        particles.rotation.y = time * 0.02;
        constellationLines.rotation.y = time * -0.015;
        constellationLines.rotation.z = time * 0.008;

        // Apply sine-wave particle oscillations
        const posArray = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const index = i * 3;
            // Oscillate Y position
            posArray[index + 1] += Math.sin(time + waveOffsets[i]) * 0.08;
        }
        geometry.attributes.position.needsUpdate = true;

        // Eased camera follow mouse
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    // Procedural canvas particle generator
    function createParticleTexture() {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 16;
        pCanvas.height = 16;
        const ctx = pCanvas.getContext('2d');

        // Draw radial glow dot
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);

        const texture = new THREE.Texture(pCanvas);
        texture.needsUpdate = true;
        return texture;
    }
}

/* ==========================================================================
   4. Soundwave 2D Canvas Wave Visualizer
   ========================================================================== */
function initSoundwaveVisualizer() {
    const canvas = document.getElementById("soundwave-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId = null;

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let step = 0;
    
    // Wave definitions
    const waves = [
        { amplitude: 35, frequency: 0.008, speed: 0.04, color: "rgba(124, 58, 237, 0.15)" },
        { amplitude: 20, frequency: 0.015, speed: 0.06, color: "rgba(59, 130, 246, 0.2)" },
        { amplitude: 10, frequency: 0.025, speed: 0.08, color: "rgba(245, 158, 11, 0.1)" }
    ];

    function drawWaves() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render each wave
        waves.forEach(w => {
            ctx.beginPath();
            ctx.strokeStyle = w.color;
            ctx.lineWidth = 1.5;
            
            const amplitudeMod = document.body.classList.contains("cursor-hover") ? 1.5 : 1;
            
            for (let x = 0; x < canvas.width; x++) {
                // Sine calculation with speed shift
                const y = Math.sin(x * w.frequency + step * w.speed) * (w.amplitude * amplitudeMod) + (canvas.height / 2);
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        });

        step++;
        animationId = requestAnimationFrame(drawWaves);
    }
    drawWaves();
}

/* ==========================================================================
   5. GSAP & ScrollTrigger Page Animations
   ========================================================================== */
function initGSAPScrollAnimations() {
    // Check if libraries are loaded
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero Section staggered load-ins
    const heroTl = gsap.timeline();
    heroTl.from(".luxury-navbar", {
        y: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
    })
    .from(".reveal-item", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
    }, "-=0.6");

    // Scroll-reveals: generic GSAP scroll trigger entries
    const fadeUpItems = document.querySelectorAll("[data-gsap='fade-up']");
    fadeUpItems.forEach(item => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    const fadeLeftItems = document.querySelectorAll("[data-gsap='fade-left']");
    fadeLeftItems.forEach(item => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%"
            },
            x: 60,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    const fadeRightItems = document.querySelectorAll("[data-gsap='fade-right']");
    fadeRightItems.forEach(item => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%"
            },
            x: -60,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // Course Cards stagger entrance
    gsap.from(".course-card-3d", {
        scrollTrigger: {
            trigger: ".courses-grid",
            start: "top 80%"
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out"
    });

    // Timeline Progress Bar Scroll Animation
    gsap.to("#timeline-progress", {
        scrollTrigger: {
            trigger: ".timeline-steps",
            start: "top 70%",
            end: "bottom 30%",
            scrub: true
        },
        width: "83.33%",
        ease: "none"
    });

    // Step item markers activation trigger on scroll
    const stepItems = document.querySelectorAll(".timeline-step-item");
    stepItems.forEach((step, idx) => {
        ScrollTrigger.create({
            trigger: step,
            start: "top 75%",
            onEnter: () => {
                step.classList.add("active");
            },
            onLeaveBack: () => {
                // Keep the first step always active
                if (idx > 0) step.classList.remove("active");
            }
        });
    });

    // Magnetic Buttons implementation
    const magneticBtns = document.querySelectorAll(".magnetic-btn");
    magneticBtns.forEach(btn => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculate hover offset from button center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Magnetic attraction translate values
            gsap.to(btn, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

/* ==========================================================================
   6. 3D Card Hover Perspective Rotation (Tilt Effect)
   ========================================================================== */
function initCard3DTilt() {
    const cards = document.querySelectorAll(".course-card-3d, .trainer-card");
    
    cards.forEach(card => {
        const inner = card.querySelector(".card-inner") || card.querySelector(".trainer-card");
        if (!inner) return;

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            
            // Mouse coordinate relative to card bounds (normalized from -0.5 to 0.5)
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            // Limit tilt values: tilt up to 12 degrees
            const tiltX = -y * 12;
            const tiltY = x * 12;

            gsap.to(inner, {
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 1000,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(inner, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: "power3.out"
            });
        });
    });
}

/* ==========================================================================
   7. Statistical Numbers Counter Animators
   ========================================================================== */
function initStatsCounters() {
    const statNumbers = document.querySelectorAll(".stat-number");
    if (statNumbers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetValue = parseInt(target.getAttribute("data-target"), 10);
                animateCount(target, targetValue);
                observer.unobserve(target); // Animate once only
            }
        });
    }, { threshold: 0.8 });

    statNumbers.forEach(stat => {
        observer.observe(stat);
    });

    function animateCount(element, target) {
        let current = 0;
        const duration = 1500; // ms
        const stepTime = Math.max(Math.floor(duration / target), 15);
        
        const timer = setInterval(() => {
            current += Math.ceil(target / 80);
            if (current >= target) {
                element.textContent = target + "+";
                clearInterval(timer);
            } else {
                element.textContent = current;
            }
        }, stepTime);
    }
}

/* ==========================================================================
   8. Success Stories Slider (Testimonials Slider)
   ========================================================================== */
function initTestimonialsSlider() {
    const slides = document.querySelectorAll(".testimonial-slide");
    const dots = document.querySelectorAll("#slider-dots .dot");
    const prevBtn = document.getElementById("prev-testimonial");
    const nextBtn = document.getElementById("next-testimonial");

    if (slides.length === 0) return;

    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach((slide, idx) => {
            slide.classList.remove("active");
            dots[idx].classList.remove("active");
        });

        slides[index].classList.add("active");
        dots[index].classList.add("active");
        currentIndex = index;
    }

    nextBtn.addEventListener("click", () => {
        let index = currentIndex + 1;
        if (index >= slides.length) index = 0;
        showSlide(index);
    });

    prevBtn.addEventListener("click", () => {
        let index = currentIndex - 1;
        if (index < 0) index = slides.length - 1;
        showSlide(index);
    });

    // Dot indicators click events
    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            showSlide(idx);
        });
    });

    // Auto rotate slides every 8 seconds
    setInterval(() => {
        let index = currentIndex + 1;
        if (index >= slides.length) index = 0;
        showSlide(index);
    }, 8000);
}

/* ==========================================================================
   9. Cinematic Concert Gallery Lightbox modal
   ========================================================================== */
function initLightboxGallery() {
    const grid = document.getElementById("gallery-grid");
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("lightbox-img");
    const modalCaption = document.getElementById("lightbox-caption");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    if (!grid || !modal) return;

    const galleryItems = Array.from(grid.querySelectorAll(".gallery-item"));
    let currentGalleryIndex = 0;

    galleryItems.forEach((item, index) => {
        const zoomBtn = item.querySelector(".gallery-zoom-btn");
        zoomBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openLightbox(index);
        });
    });

    function openLightbox(index) {
        currentGalleryIndex = index;
        const item = galleryItems[index];
        const img = item.querySelector("img");
        const title = item.querySelector("h3").textContent;
        const subtitle = item.querySelector("p").textContent;

        modalImg.src = img.src;
        modalCaption.textContent = `${title} - ${subtitle}`;
        
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scrolling
    }

    function closeLightbox() {
        modal.classList.remove("active");
        document.body.style.overflow = ""; // Re-enable scroll
    }

    function showNextImage() {
        let index = currentGalleryIndex + 1;
        if (index >= galleryItems.length) index = 0;
        openLightbox(index);
    }

    function showPrevImage() {
        let index = currentGalleryIndex - 1;
        if (index < 0) index = galleryItems.length - 1;
        openLightbox(index);
    }

    closeBtn.addEventListener("click", closeLightbox);
    nextBtn.addEventListener("click", showNextImage);
    prevBtn.addEventListener("click", showPrevImage);

    // Close on click outside image
    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.classList.contains("lightbox-content")) {
            closeLightbox();
        }
    });

    // Keyboard support
    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") showNextImage();
        if (e.key === "ArrowLeft") showPrevImage();
    });
}

/* ==========================================================================
   10. Interactive Maharashtra Branch Locations Map toggles
   ========================================================================== */
function initBranchesMap() {
    const markers = document.querySelectorAll(".map-marker");
    const cards = document.querySelectorAll(".branch-card");

    if (markers.length === 0) return;

    markers.forEach(marker => {
        marker.addEventListener("click", () => {
            const branchId = marker.getAttribute("data-branch");
            
            // Switch markers active classes
            markers.forEach(m => m.classList.remove("active"));
            marker.classList.add("active");

            // Switch display cards active classes
            cards.forEach(c => {
                c.classList.remove("active");
                if (c.id === `card-${branchId}`) {
                    c.classList.add("active");
                }
            });
        });
    });
}

/* ==========================================================================
   11. Free Demo Class Form Handler
   ========================================================================== */
function initDemoFormHandler() {
    const form = document.getElementById("demo-form");
    const successMsg = document.getElementById("form-success");
    const submitBtn = document.getElementById("submit-btn");

    if (!form || !successMsg) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Animate button submitting state
        submitBtn.disabled = true;
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Scheduling Demo...</span> <i data-lucide="loader" class="animate-spin"></i>`;
        if (typeof lucide !== "undefined") lucide.createIcons();

        // Simulate secure API database callback delay (1.5 seconds)
        setTimeout(() => {
            // Fade out form
            form.style.opacity = 0;
            setTimeout(() => {
                form.style.display = "none";
                
                // Show Success container
                successMsg.style.display = "flex";
                successMsg.style.opacity = 0;
                gsap.to(successMsg, { opacity: 1, duration: 0.5 });
                
                // Track details in console for diagnostic evaluation
                console.log("FREE DEMO CLASS REGISTERED SUCCESS:", {
                    name: document.getElementById("form-name").value,
                    phone: document.getElementById("form-phone").value,
                    course: document.getElementById("form-course").value,
                    branch: document.getElementById("form-branch").value,
                    timestamp: new Date().toISOString()
                });
            }, 400);

        }, 1800);
    });
}

/* ==========================================================================
   12. Responsive Mobile Navigation Toggle Menu Overlay
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.getElementById("menu-toggle");
    const mobileOverlay = document.getElementById("mobile-nav");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (!menuToggle || !mobileOverlay) return;

    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        mobileOverlay.classList.toggle("active");
        
        // Lock screen scroll when mobile navigation is active
        if (mobileOverlay.classList.contains("active")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.classList.remove("active");
            mobileOverlay.classList.remove("active");
            document.body.style.overflow = "";
        });
    });
}
