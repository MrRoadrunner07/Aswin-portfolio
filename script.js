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
        });

        window.addEventListener('resize', resize);

        resize();
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

});
