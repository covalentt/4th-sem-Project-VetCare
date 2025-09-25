document.addEventListener('DOMContentLoaded', async () => {

    // ---------------- Navbar Hide/Show on Scroll ----------------
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > 100) {
            if (currentScroll > lastScrollTop) navbar.classList.add('hidden');
            else navbar.classList.remove('hidden');
        }
        lastScrollTop = Math.max(0, currentScroll);
    });

    // ---------------- Smooth Anchor Scrolling ----------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ---------------- Intersection Observer ----------------
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // ---------------- Fetch Products ----------------
    try {
        const productsResponse = await fetch('http://localhost:8080/api/products', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` }
        });
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const products = await productsResponse.json();
        const productsContainer = document.getElementById('products-container');

        if (productsContainer) {
            productsContainer.innerHTML = products.slice(0, 3).map((product, index) => `
                <div class="col-lg-4 col-md-6">
                    <div class="card product-card h-100" style="animation-delay:${index * 0.1}s">
                        <div class="product-image">
                            <img src="${product.imageUrl}" alt="${product.title}">
                        </div>
                        <div class="card-body">
                            <h5 class="product-title">${product.title}</h5>
                            <p class="product-description">${product.description}</p>
                            ${product.price ? `<p class="product-price">${product.price}</p>` : ''}
                            <button class="btn view-product" data-product-id="${product.id}">
                                <i class="fas fa-eye me-2"></i>View Product
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.view-product').forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.getAttribute('data-product-id');
                    window.location.href = `product.html?productId=${productId}`;
                });
            });

            document.querySelectorAll('.product-card').forEach(el => observer.observe(el));
        }
    } catch (err) {
        console.error('Error loading products:', err);
    }

    // ---------------- Fetch Services ----------------
    try {
        const servicesResponse = await fetch('http://localhost:8080/api/services', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` }
        });
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');
        const services = await servicesResponse.json();
        const servicesContainer = document.getElementById('services-container');

        if (servicesContainer) {
            servicesContainer.innerHTML = services.slice(0, 3).map((service, index) => `
                <div class="col-lg-4 col-md-6">
                    <div class="card service-card h-100" style="animation-delay:${index * 0.1}s">
                        <div class="service-image">
                            <img src="${service.imageUrl}" alt="${service.title}">
                        </div>
                        <div class="card-body">
                            <h5 class="service-title">${service.title}</h5>
                            <p class="service-description">${service.description}</p>
                            ${service.price ? `<p class="service-price">${service.price}</p>` : ''}
                            <button class="btn book-service" data-service-id="${service.id}">
                                <i class="fas fa-calendar-plus me-2"></i>Book This Service
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.book-service').forEach(button => {
                button.addEventListener('click', () => {
                    if (!localStorage.getItem('authToken')) {
                        window.location.href = 'login.html';
                        return;
                    }
                    const serviceId = button.getAttribute('data-service-id');
                    window.location.href = `book.html?serviceId=${serviceId}`;
                });
            });

            document.querySelectorAll('.service-card').forEach(el => observer.observe(el));
        }
    } catch (err) {
        console.error('Error loading services:', err);
    }

    // ---------------- Hero Slideshow ----------------
    const heroSlides = [
        { title: "Professional Veterinary Care in Nepal", subtitle: "As Nepal's leading animal health company, Vetcare nurtures Nepal and humankind by advancing care for animals.", image: "/image/dog 1.png" },
        { title: "24/7 Emergency Pet Care", subtitle: "Round-the-clock emergency services ensure your pet gets immediate care when they need it most.", image: "/image/vetu 1.png" },
        { title: "Premium Pet Products & Supplies", subtitle: "High-quality pet food, toys, and health supplements to keep your furry friends healthy and happy.", image: "/image/dogy 2.png" }
    ];

    const heroContainer = document.querySelector('.hero-section .container');
    if (heroContainer) {
        heroContainer.innerHTML = `
            <div class="hero-slideshow d-flex">
                ${heroSlides.map(slide => `
                    <div class="hero-slide flex-shrink-0">
                        <div class="hero-content col-lg-6 col-md-12">
                            <h1>${slide.title}</h1>
                            <p class="lead">${slide.subtitle}</p>
                            <div class="hero-buttons">
                                <a href="book.html" class="btn btn-primary me-3">Book Now</a>
                                <a href="services.html" class="btn btn-outline-primary">Our Services</a>
                            </div>
                        </div>
                        <div class="col-lg-6 col-md-12">
                            <img src="${slide.image}" alt="Veterinary Care" class="hero-image">
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const slides = document.querySelectorAll('.hero-slide');
        let currentSlide = 0;
        const slideshow = document.querySelector('.hero-slideshow');
        let slideInterval = setInterval(nextSlide, 3000);

        function goToSlide(index) {
            currentSlide = index;
            slideshow.style.transform = `translateX(-${index * 100}%)`;
        }

        function nextSlide() {
            goToSlide((currentSlide + 1) % slides.length);
        }

        slideshow.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slideshow.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 3000));
        goToSlide(0);
    }

    // ---------------- Newsletter Form ----------------
    const newsletterForm = document.querySelector('.footer-newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const btn = this.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'Subscribed!';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-primary');

            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
                emailInput.value = '';
            }, 2000);
        });
    }
});
