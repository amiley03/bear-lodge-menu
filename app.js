// Bear Lodge Inn - Menu Application

let menuData = null;

// Load menu data
async function loadMenuData() {
    try {
        const response = await fetch('menu-data.json');
        menuData = await response.json();
        renderMenu();
    } catch (error) {
        console.error('Error loading menu data:', error);
        document.getElementById('menu-sections').innerHTML = `
            <p style="text-align: center; color: #c75b4a; padding: 2rem;">
                Error loading menu. Please make sure menu-data.json exists.
            </p>
        `;
    }
}

// Render the entire menu
function renderMenu() {
    renderSchedule();
    renderMenuSections();
    renderGuidelines();
    setupModal();
}

// Render daily schedule
function renderSchedule() {
    const container = document.getElementById('schedule-grid');
    const schedule = menuData.dailySchedule.meals;

    container.innerHTML = schedule.map(meal => `
        <div class="schedule-item">
            <div class="time">${meal.time}</div>
            <div class="type">${meal.type}</div>
        </div>
    `).join('');
}

// Render all menu sections
function renderMenuSections() {
    const container = document.getElementById('menu-sections');

    container.innerHTML = menuData.categories.map(category => `
        <section id="${category.id}" class="menu-section">
            <div class="section-header">
                <h2>${category.name}</h2>
                ${category.description ? `<p>${category.description}</p>` : ''}
            </div>
            <div class="menu-grid">
                ${category.items.map(item => renderMenuItem(item)).join('')}
            </div>
        </section>
    `).join('');
}

// Render individual menu item
function renderMenuItem(item) {
    const badges = [];
    if (item.isFavorite) badges.push('<span class="badge favorite">Larry\'s Fave</span>');
    if (item.isSignature) badges.push('<span class="badge signature">Signature</span>');
    if (item.isFlareUpSafe) badges.push('<span class="badge gentle">Gentle</span>');

    let cardClass = 'menu-item';
    if (item.isFavorite) cardClass += ' favorite';
    if (item.isSignature) cardClass += ' signature';
    if (item.isFlareUpSafe) cardClass += ' flare-up-safe';

    return `
        <div class="${cardClass}" data-item-id="${item.id}" onclick="showRecipe('${item.id}')">
            <img src="${item.image}" alt="${item.name}" class="item-image"
                 onerror="this.src='https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400'">
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="item-badges">${badges.join('')}</div>
                </div>
                <p class="item-description">${item.description}</p>
                <span class="view-recipe">View Recipe →</span>
            </div>
        </div>
    `;
}

// Toggle Flare-Up Mode filter
function toggleFlareUpFilter() {
    const toggle = document.getElementById('flareup-toggle');
    const isActive = toggle.checked;
    document.body.classList.toggle('flare-up-mode', isActive);

    // Hide/show menu sections that have no gentle items
    document.querySelectorAll('.menu-section').forEach(section => {
        const gentleItems = section.querySelectorAll('.menu-item.flare-up-safe');
        if (isActive && gentleItems.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

// Render guidelines
function renderGuidelines() {
    // Rules
    const rulesList = document.getElementById('rules-list');
    rulesList.innerHTML = menuData.dietaryNotes.rules.map(rule =>
        `<li>${rule}</li>`
    ).join('');

    // Avoid list
    const avoidList = document.getElementById('avoid-list');
    avoidList.innerHTML = menuData.notAllowed.categories.map(cat => `
        <div class="avoid-category">
            <h4>${cat.name}</h4>
            <span>${cat.items.join(', ')}</span>
        </div>
    `).join('');

    // Weekly prep
    const weeklyPrep = document.getElementById('weekly-prep');
    weeklyPrep.innerHTML = menuData.mealPrepGuide.weekly.map(item =>
        `<li>${item}</li>`
    ).join('');

    // Always stock
    const alwaysStock = document.getElementById('always-stock');
    alwaysStock.innerHTML = menuData.mealPrepGuide.alwaysStock.map(item =>
        `<li>${item}</li>`
    ).join('');
}

// Find item by ID across all categories
function findItemById(id) {
    for (const category of menuData.categories) {
        const item = category.items.find(i => i.id === id);
        if (item) return item;
    }
    return null;
}

// Show recipe modal
function showRecipe(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="modal-image"
             onerror="this.src='https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400'">
        <div class="modal-body-content">
            <h2>${item.name}</h2>
            <p class="description">${item.description}</p>

            ${item.recipe ? `
                <div class="recipe-section">
                    <h3>Ingredients</h3>
                    <ul>
                        ${item.recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>

                <div class="recipe-section">
                    <h3>Instructions</h3>
                    <ol>
                        ${item.recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                    </ol>
                </div>
            ` : '<p>Recipe coming soon...</p>'}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Setup modal close handlers
function setupModal() {
    const modal = document.getElementById('recipe-modal');
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.onclick = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Smooth scroll for nav links
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
            const navHeight = document.querySelector('.menu-nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', loadMenuData);
