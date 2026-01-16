document.addEventListener('DOMContentLoaded', () => {

    // --- STARRY SKY & COMET ANIMATION ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let stars = [];
        let comets = [];
        let scrollY = window.scrollY;

        // Configuration
        const starCount = 150;
        const baseCometChance = 0.005; // Chance per frame to spawn a comet
        const scrollEffectSpeed = 0.5;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initStars();
        }

        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2;
                this.opacity = Math.random();
                this.fadeSpeed = Math.random() * 0.02 + 0.005;
            }

            update() {
                // Twinkle
                this.opacity += this.fadeSpeed;
                if (this.opacity > 1 || this.opacity < 0) this.fadeSpeed *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(this.opacity)})`;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class Comet {
            constructor(isSpecial = false) {
                this.x = Math.random() * width;
                this.y = -50;
                this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5; // Downward-ish
                this.speed = Math.random() * 3 + 2;
                this.size = Math.random() * 2 + 1;
                this.length = Math.random() * 50 + 30;
                this.isSpecial = isSpecial;
                this.color = isSpecial ? '255, 0, 128' : '0, 243, 255'; // Magenta (Special) or Cyan (Default)

                // If it's special, make it faster/brighter maybe?
                if (isSpecial) this.speed *= 1.5;
            }

            update() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
            }

            draw() {
                const gradient = ctx.createLinearGradient(
                    this.x, this.y,
                    this.x - Math.cos(this.angle) * this.length,
                    this.y - Math.sin(this.angle) * this.length
                );
                gradient.addColorStop(0, `rgba(${this.color}, 1)`);
                gradient.addColorStop(1, `rgba(${this.color}, 0)`);

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.size;
                ctx.lineCap = 'round';
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x - Math.cos(this.angle) * this.length,
                    this.y - Math.sin(this.angle) * this.length
                );
                ctx.stroke();

                // Head glow
                ctx.beginPath();
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgb(${this.color})`;
                ctx.fillStyle = `rgb(${this.color})`;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function initStars() {
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Draw Stars
            stars.forEach(star => {
                star.update();
                star.draw();
            });

            // Draw Moon
            if (moon) {
                moon.draw();
            }

            // Handle Comets
            if (Math.random() < baseCometChance) {
                const isSpecial = Math.random() < 0.2; // 20% chance for special comet
                comets.push(new Comet(isSpecial));
            }

            for (let i = comets.length - 1; i >= 0; i--) {
                const c = comets[i];
                c.update();
                c.draw();

                // Remove off-screen comets
                if (c.y > height + 100 || c.x > width + 100) {
                    comets.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }

        window.addEventListener('scroll', () => {
            const newScrollY = window.scrollY;
            const deltaY = newScrollY - scrollY;
            scrollY = newScrollY;

            // Shift stars parallax
            stars.forEach(s => {
                s.y -= deltaY * scrollEffectSpeed;
                if (s.y < 0) s.y += height;
                if (s.y > height) s.y -= height;
            });

            // Shift comets (faster parallax)
            comets.forEach(c => {
                c.y -= deltaY * (scrollEffectSpeed * 2);
            });

            // Shift moon (slower parallax)
            if (moon) {
                moon.y -= deltaY * (scrollEffectSpeed * 0.2);
            }
        });

        // --- MOON LOGIC ---
        function getMoonPhase(date) {
            // Accurate calculation using a known moon cycle epoch
            const lp = 2551443;
            const now = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 35, 0);
            const new_moon = new Date(1970, 0, 7, 20, 35, 0);
            const phase = ((now.getTime() - new_moon.getTime()) / 1000) % lp;
            return phase / lp; // 0 to 1
        }

        class Moon {
            constructor() {
                this.x = width * 0.8; // Top right area
                this.y = height * 0.2;
                this.size = 40;
                this.phase = getMoonPhase(new Date()); // 0.0 - 1.0
                this.glowColor = '220, 220, 255';
            }

            draw() {
                const cx = this.x;
                const cy = this.y;
                const r = this.size;
                const p = this.phase; // 0 to 1

                // 1. Draw Glow
                ctx.beginPath();
                ctx.shadowBlur = 50;
                ctx.shadowColor = `rgba(${this.glowColor}, 0.5)`;
                ctx.fillStyle = `rgba(255, 255, 240, 0)`; // Transparent fill
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // 2. Draw Dark Earthshine Base
                ctx.beginPath();
                ctx.fillStyle = 'rgba(30, 30, 40, 0.9)';
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();

                // 3. Draw Lit Part based on phase
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(-Math.PI / 8); // Slight tilt

                ctx.fillStyle = 'rgba(255, 255, 240, 1)';
                ctx.beginPath();

                if (p <= 0.5) {
                    // WAXING (New -> Full)
                    // Draw Right Semi-Circle
                    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);

                    // Determine Terminator Shape
                    let xscale = Math.cos(p * 2 * Math.PI); // 1 -> -1

                    // Ellipse for terminator (0,0, abs(xscale*r), r)
                    // If Crescent (xscale > 0): Inner curve, remove from right semi-circle
                    // If Gibbous (xscale < 0): Outer curve, add to right semi-circle

                    ctx.ellipse(0, 0, Math.abs(xscale * r), r, 0, Math.PI / 2, 3 * Math.PI / 2, xscale > 0);
                } else {
                    // WANING (Full -> New)
                    // Draw Left Semi-Circle
                    ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2);

                    let xscale = Math.cos(p * 2 * Math.PI); // -1 -> 1

                    ctx.ellipse(0, 0, Math.abs(xscale * r), r, 0, 3 * Math.PI / 2, Math.PI / 2, xscale > 0);
                }

                ctx.fill();
                ctx.restore();
            }
        }

        let moon; // Define moon variable

        window.addEventListener('resize', resize);

        resize();
        // initStars called in resize, let's init moon there too or here
        moon = new Moon();

        animate();
    }

    // --- INTERSECTION OBSERVER ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-section');
    fadeElements.forEach(el => observer.observe(el));

    // --- SMOOTH SCROLL ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- YOUTUBE API FOR HOVER PLAY ---
    // Load API Asynchronously
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Global callback for when API is ready
    window.onYouTubeIframeAPIReady = function () {
        const players = document.querySelectorAll('.yt-player');

        players.forEach(playerDiv => {
            const videoId = playerDiv.getAttribute('data-video-id');
            const elementId = playerDiv.id;

            new YT.Player(elementId, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,    // Hide controls
                    'mute': 1,        // Muted
                    'rel': 0,         // No related videos
                    'loop': 1,        // Loop
                    'playlist': videoId, // Required for loop
                    'showinfo': 0,
                    'modestbranding': 1
                },
                events: {
                    'onReady': onPlayerReady
                }
            });
        });
    };

    function onPlayerReady(event) {
        // Find the wrapper (anchor or parent div) to bind hover events
        // The iframe is now the event.target.getIframe()
        const iframe = event.target.getIframe();
        const wrapper = iframe.closest('.video-link-wrapper'); // The anchor tag

        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => {
                event.target.playVideo();
            });

            wrapper.addEventListener('mouseleave', () => {
                event.target.pauseVideo();
            });
        }
    }

});
