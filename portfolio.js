document.addEventListener('DOMContentLoaded', () => {
    // 1. Basic Info
    document.getElementById('hero-bio').textContent = portfolioConfig.bio;
    document.getElementById('contact-email').textContent = portfolioConfig.email;

    // Render Hero Photo
    if (portfolioConfig.profilePhoto) {
        document.getElementById('hero-photo').innerHTML = `<img src="${portfolioConfig.profilePhoto}" alt="${portfolioConfig.name}">`;
    }

    // 2. Populate Portfolio Tabs
    const tabContainer = document.getElementById('portfolio-tabs');
    portfolioConfig.categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = cat.name;
        btn.onclick = () => switchCategory(cat.id, btn);
        tabContainer.appendChild(btn);
    });

    // Load first category
    if (portfolioConfig.categories.length > 0) {
        renderCategory(portfolioConfig.categories[0].id);
    }

    // 3. Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

function renderCategory(catId) {
    const cat = portfolioConfig.categories.find(c => c.id === catId);
    if (!cat) return;

    const content = document.getElementById('portfolio-content');
    content.innerHTML = `
        <div class="precision-frame">
            <div class="corner-bracket corner-tl"></div>
            <div class="corner-bracket corner-tr"></div>
            <div class="corner-bracket corner-bl"></div>
            <div class="corner-bracket corner-br"></div>
            <div class="category-flex">
                <div class="category-info">
                    <h2 class="category-title">${cat.title}</h2>
                    <p class="category-desc">${cat.description}</p>
                    ${cat.externalLink 
                        ? `<a href="${cat.externalLink}" target="_blank" class="btn-more">VER EN YOUTUBE ⟶</a>`
                        : `<a class="btn-more" onclick="openDeepDive('${cat.id}')">CONOCE MÁS ⟶</a>`
                    }
                </div>
                <div class="category-image-wrap">
                    <img src="${cat.coverImage}" alt="${cat.title}">
                </div>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

function switchCategory(catId, btn) {
    // 1. Update Tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Animate and Render Content
    const content = document.getElementById('portfolio-content');
    content.classList.add('hidden');
    
    setTimeout(() => {
        renderCategory(catId);
        content.classList.remove('hidden');
    }, 400);
}

// Deep Dive Logic
function openDeepDive(catId) {
    const cat = portfolioConfig.categories.find(c => c.id === catId);
    if (!cat) return;

    const modal = document.getElementById('project-modal');
    const content = document.getElementById('modal-content');
    document.body.classList.add('modal-open');

    let innerHtml = `
        <div class="container">
            <h1 class="modal-title">${cat.title}</h1>
            <p class="modal-desc">${cat.description}</p>
    `;

    // Render 5 sections with sliders
    if (cat.details) {
        cat.details.forEach((section, sIndex) => {
            innerHtml += `
                <div class="slider-section">
                    <h3 class="slider-title">${section.title}</h3>
                    <p class="slider-desc">${section.content}</p>
                    <div class="slider-wrapper">
                        <button class="slider-btn slider-prev" onclick="scrollSlider(this, -1)">←</button>
                        <div class="slider-container" id="slider-${sIndex}">
                            ${section.images.map((img, iIndex) => `
                                <div class="slider-item" onclick="openLightbox(${sIndex}, ${iIndex})">
                                    <img src="${img}" alt="${section.title}">
                                </div>
                            `).join('')}
                        </div>
                        <button class="slider-btn slider-next" onclick="scrollSlider(this, 1)">→</button>
                    </div>
                </div>
            `;
        });
        // Store images for lightbox
        window.currentProjectDetails = cat.details;
    }

    innerHtml += `</div>`;
    content.innerHTML = innerHtml;
    modal.classList.add('active');
}

function scrollSlider(btn, direction) {
    const container = btn.parentElement.querySelector('.slider-container');
    const scrollAmount = 300;
    container.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
}

let currentSIndex = 0;
let currentIIndex = 0;

function openLightbox(sIndex, iIndex) {
    currentSIndex = sIndex;
    currentIIndex = iIndex;
    
    let lb = document.getElementById('lightbox');
    if (!lb) {
        lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.className = 'lightbox';
        document.body.appendChild(lb);
    }
    
    updateLightbox();
    lb.style.display = 'flex';
}

function updateLightbox() {
    const lb = document.getElementById('lightbox');
    const images = window.currentProjectDetails[currentSIndex].images;
    const src = images[currentIIndex];
    
    lb.innerHTML = `
        <button class="lightbox-nav lb-prev" onclick="event.stopPropagation(); changeLightboxImage(-1)">‹</button>
        <img src="${src}" class="lightbox-img">
        <button class="lightbox-nav lb-next" onclick="event.stopPropagation(); changeLightboxImage(1)">›</button>
        <button onclick="closeLightbox()" style="position: absolute; top: 2rem; right: 2rem; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">×</button>
    `;
}

function changeLightboxImage(dir) {
    const images = window.currentProjectDetails[currentSIndex].images;
    currentIIndex = (currentIIndex + dir + images.length) % images.length;
    updateLightbox();
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.style.display = 'none';
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox')?.style.display === 'flex') {
        if (e.key === 'ArrowLeft') changeLightboxImage(-1);
        if (e.key === 'ArrowRight') changeLightboxImage(1);
        if (e.key === 'Escape') closeLightbox();
    } else if (document.getElementById('project-modal').classList.contains('active')) {
        if (e.key === 'Escape') closeModal();
    }
});

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
