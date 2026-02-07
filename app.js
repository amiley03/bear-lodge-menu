// Bear Lodge Inn - Menu Application

let menuData = null;

// User votes stored in localStorage
function getUserVotes() {
    const votes = localStorage.getItem('bearLodgeVotes');
    return votes ? JSON.parse(votes) : {};
}

function saveUserVotes(votes) {
    localStorage.setItem('bearLodgeVotes', JSON.stringify(votes));
}

function getVote(itemId) {
    const votes = getUserVotes();
    return votes[itemId] || null; // 'up', 'down', or null
}

function setVote(itemId, vote, event) {
    if (event) event.stopPropagation();
    const votes = getUserVotes();
    if (votes[itemId] === vote) {
        delete votes[itemId]; // Toggle off
    } else {
        votes[itemId] = vote;
    }
    saveUserVotes(votes);
    renderMenuSections(); // Re-render to update buttons
    // If modal is open, update it too
    const modal = document.getElementById('recipe-modal');
    if (modal.classList.contains('active')) {
        const currentItemId = modal.querySelector('[data-vote-item]')?.dataset.voteItem;
        if (currentItemId) showRecipe(currentItemId);
    }
}

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
    renderShoppingList();
    renderGuidelines();
    setupModal();
}

// Render shopping list with Walmart links
function renderShoppingList() {
    const container = document.getElementById('shopping-grid');
    if (!container || !menuData) return;

    const categories = [
        { name: 'Proteins', icon: '🥩', items: menuData.coreIngredients.proteins },
        { name: 'Dairy & Eggs', icon: '🥛', items: menuData.coreIngredients.dairy },
        { name: 'Carbs & Grains', icon: '🍞', items: menuData.coreIngredients.carbs },
        { name: 'Sauces & Broths', icon: '🥫', items: menuData.coreIngredients.sauces },
        { name: 'Produce', icon: '🍌', items: menuData.coreIngredients.produce },
        { name: 'Pantry Staples', icon: '🧂', items: menuData.coreIngredients.pantry }
    ];

    container.innerHTML = categories.map(cat => `
        <div class="shopping-category">
            <h3>${cat.icon} ${cat.name}</h3>
            <ul>
                ${cat.items.slice(0, 8).map(item => {
                    const name = typeof item === 'string' ? item : item.name;
                    const link = typeof item === 'object' && item.link ? item.link :
                        `https://www.walmart.com/search?q=${encodeURIComponent(name)}`;
                    return `
                        <li>
                            <span>${name}</span>
                            <a href="${link}" target="_blank" class="walmart-link">Walmart</a>
                        </li>
                    `;
                }).join('')}
            </ul>
        </div>
    `).join('');
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
    const vote = getVote(item.id);

    const badges = [];
    if (vote === 'up') badges.push('<span class="badge user-fave">Liked</span>');
    if (item.isFavorite) badges.push('<span class="badge favorite">Larry\'s Fave</span>');
    if (item.isSignature) badges.push('<span class="badge signature">Signature</span>');
    if (item.isFlareUpSafe) badges.push('<span class="badge gentle">Gentle</span>');
    if (item.isHealingSafe) badges.push('<span class="badge healing">Healing</span>');

    let cardClass = 'menu-item';
    if (item.isFavorite) cardClass += ' favorite';
    if (item.isSignature) cardClass += ' signature';
    if (item.isFlareUpSafe) cardClass += ' flare-up-safe';
    if (item.isHealingSafe) cardClass += ' healing-safe';
    if (vote === 'up') cardClass += ' user-liked';
    if (vote === 'down') cardClass += ' user-passed';

    const submitter = item.submittedBy ? `<span class="submitter">by ${item.submittedBy}</span>` : '';

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
                <div class="item-footer">
                    ${submitter}
                    <div class="vote-buttons">
                        <button class="vote-btn ${vote === 'up' ? 'active' : ''}" onclick="setVote('${item.id}', 'up', event)" title="I like this">👍</button>
                        <button class="vote-btn ${vote === 'down' ? 'active' : ''}" onclick="setVote('${item.id}', 'down', event)" title="I'll pass">👎</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Search filter
function filterMenuBySearch() {
    const searchInput = document.getElementById('menu-search');
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        clearSearch();
        return;
    }

    document.body.classList.add('search-active');

    // Filter menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        const name = item.querySelector('.item-name')?.textContent.toLowerCase() || '';
        const description = item.querySelector('.item-description')?.textContent.toLowerCase() || '';
        const badges = item.querySelector('.item-badges')?.textContent.toLowerCase() || '';

        if (name.includes(query) || description.includes(query) || badges.includes(query)) {
            item.classList.add('search-match');
        } else {
            item.classList.remove('search-match');
        }
    });

    // Hide sections with no matching items
    document.querySelectorAll('.menu-section').forEach(section => {
        const matchingItems = section.querySelectorAll('.menu-item.search-match');
        section.style.display = matchingItems.length === 0 ? 'none' : '';
    });
}

function clearSearch() {
    const searchInput = document.getElementById('menu-search');
    searchInput.value = '';
    document.body.classList.remove('search-active');

    // Remove search-match class from all items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('search-match');
    });

    // Show all sections
    document.querySelectorAll('.menu-section').forEach(section => {
        section.style.display = '';
    });

    // Re-apply any active filters
    const flareUpActive = document.getElementById('flareup-toggle')?.checked;
    const healingActive = document.getElementById('healing-toggle')?.checked;
    if (flareUpActive) toggleFlareUpFilter();
    if (healingActive) toggleHealingFilter();
}

// Toggle Flare-Up Mode filter
function toggleFlareUpFilter() {
    const toggle = document.getElementById('flareup-toggle');
    const isActive = toggle.checked;

    // Clear search when using filters
    if (isActive) {
        document.getElementById('menu-search').value = '';
        document.body.classList.remove('search-active');
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('search-match'));
    }

    document.body.classList.toggle('flare-up-mode', isActive);

    // Uncheck healing mode if flare-up is checked
    if (isActive) {
        document.getElementById('healing-toggle').checked = false;
        document.body.classList.remove('healing-mode');
    }

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

// Toggle Healing Mode filter (for esophageal band recovery)
function toggleHealingFilter() {
    const toggle = document.getElementById('healing-toggle');
    const isActive = toggle.checked;

    // Clear search when using filters
    if (isActive) {
        document.getElementById('menu-search').value = '';
        document.body.classList.remove('search-active');
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('search-match'));
    }

    document.body.classList.toggle('healing-mode', isActive);

    // Uncheck flare-up mode if healing is checked
    if (isActive) {
        document.getElementById('flareup-toggle').checked = false;
        document.body.classList.remove('flare-up-mode');
    }

    // Hide/show menu sections that have no healing items
    document.querySelectorAll('.menu-section').forEach(section => {
        const healingItems = section.querySelectorAll('.menu-item.healing-safe');
        if (isActive && healingItems.length === 0) {
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
    const vote = getVote(item.id);

    modalBody.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="modal-image"
             onerror="this.src='https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400'">
        <div class="modal-body-content" data-vote-item="${item.id}">
            <div class="modal-header-row">
                <h2>${item.name}</h2>
                <div class="modal-vote-buttons">
                    <button class="vote-btn large ${vote === 'up' ? 'active' : ''}" onclick="setVote('${item.id}', 'up')">👍 Like</button>
                    <button class="vote-btn large ${vote === 'down' ? 'active' : ''}" onclick="setVote('${item.id}', 'down')">👎 Pass</button>
                </div>
            </div>
            <p class="description">${item.description}</p>
            ${item.submittedBy ? `<p class="modal-submitter">Added by ${item.submittedBy}</p>` : ''}

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

// ========== EXPLORE / AI SECTION ==========

// Cloudflare Worker URL - UPDATE THIS after setting up your worker
const WORKER_URL = 'https://bear-lodge-api.amiley03.workers.dev';

let generatedRecipeData = null;

// Check if already unlocked this session
function checkExploreAuth() {
    if (sessionStorage.getItem('exploreUnlocked') === 'true') {
        document.getElementById('explore-login').style.display = 'none';
        document.getElementById('explore-interface').style.display = 'block';
        checkWorkerConfigured();
        populateCategoryDropdown();
    }
}

function unlockExplore() {
    const input = document.getElementById('explore-password');
    if (input.value === 'bearbear') {
        sessionStorage.setItem('exploreUnlocked', 'true');
        document.getElementById('explore-login').style.display = 'none';
        document.getElementById('explore-interface').style.display = 'block';
        checkWorkerConfigured();
        populateCategoryDropdown();
    } else {
        document.getElementById('explore-error').style.display = 'block';
        input.value = '';
    }
}

function checkWorkerConfigured() {
    if (WORKER_URL === 'YOUR_WORKER_URL_HERE') {
        document.getElementById('no-api-key-warning').style.display = 'block';
        document.getElementById('generate-btn').disabled = true;
    } else {
        // Load or generate Recipe of the Day
        loadRecipeOfDay();
    }
}

// Recipe of the Day - generates once per day, caches in localStorage
async function loadRecipeOfDay() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cached = localStorage.getItem('recipeOfDay');
    const dailyContent = document.getElementById('daily-recipe-content');

    if (cached) {
        const data = JSON.parse(cached);
        if (data.date === today && data.recipe) {
            displayDailyRecipe(data.recipe);
            return;
        }
    }

    // Generate new recipe for today
    dailyContent.innerHTML = '<p>🐻 Chef Bear is preparing today\'s special...</p>';

    try {
        const themes = [
            'a cozy breakfast bowl',
            'a warming soup',
            'a comforting dinner',
            'a satisfying snack',
            'a gentle dessert',
            'something with pasta',
            'a creamy bowl'
        ];
        // Use date to pick a consistent theme
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const theme = themes[dayOfYear % themes.length];

        const recipe = await generateRecipeOfDay(theme);
        if (recipe) {
            localStorage.setItem('recipeOfDay', JSON.stringify({ date: today, recipe }));
            displayDailyRecipe(recipe);
        }
    } catch (error) {
        dailyContent.innerHTML = '<p>Chef Bear is taking a break. Try again later!</p>';
    }
}

function displayDailyRecipe(recipe) {
    const dailyContent = document.getElementById('daily-recipe-content');
    dailyContent.innerHTML = `
        <div class="daily-recipe-card" onclick="showDailyRecipeModal()">
            <img src="${recipe.image}" alt="${recipe.name}"
                 onerror="this.src='https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400'">
            <div>
                <h4>${recipe.name}</h4>
                <p>${recipe.description}</p>
                <span style="color:var(--forest-green);font-weight:600;">Click to view recipe →</span>
            </div>
        </div>
    `;
    // Store for modal
    window.dailyRecipeData = recipe;
}

function showDailyRecipeModal() {
    const recipe = window.dailyRecipeData;
    if (!recipe) return;

    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="modal-image"
             onerror="this.src='https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400'">
        <div class="modal-body-content">
            <div class="modal-header-row">
                <h2>🌟 ${recipe.name}</h2>
            </div>
            <p class="description">${recipe.description}</p>
            <p class="modal-submitter">Today's Special from Chef Bear</p>

            <div class="recipe-section">
                <h3>Ingredients</h3>
                <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>

            <div class="recipe-section">
                <h3>Instructions</h3>
                <ol>${recipe.instructions.map(i => `<li>${i}</li>`).join('')}</ol>
            </div>

            <button onclick="addDailyToMenu()" style="margin-top:1rem;background:var(--forest-green);color:white;border:none;padding:0.8rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;">
                Add to Menu
            </button>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function addDailyToMenu() {
    const recipe = window.dailyRecipeData;
    if (!recipe) return;

    const category = menuData.categories.find(c => c.id === (recipe.category || 'dinners'));
    if (!category) return;

    const newItem = {
        id: recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        submittedBy: 'Chef Bear',
        recipe: {
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
        }
    };

    category.items.push(newItem);
    renderMenuSections();
    alert(`"${recipe.name}" added to ${category.name}! Export from Admin to save.`);

    document.getElementById('recipe-modal').classList.remove('active');
    document.body.style.overflow = '';
}

async function generateRecipeOfDay(theme) {
    const approved = [];
    ['proteins', 'carbs', 'dairy', 'sauces', 'produce', 'pantry'].forEach(cat => {
        menuData.coreIngredients[cat].forEach(item => {
            approved.push(typeof item === 'string' ? item : item.name);
        });
    });

    const forbidden = menuData.forbiddenIngredients.map(item =>
        typeof item === 'string' ? item : item.name
    );

    const existingRecipes = [];
    menuData.categories.forEach(cat => {
        cat.items.forEach(item => existingRecipes.push(item.name));
    });

    const systemPrompt = `You are Chef Bear creating safe recipes for Larry who has gastroparesis.

ONLY use: ${approved.join(', ')}
NEVER use: ${forbidden.join(', ')}
NOT similar to: ${existingRecipes.join(', ')}

Create ${theme}. Soft, gentle, easy to digest.

RESPOND WITH ONLY RAW JSON. NO MARKDOWN, NO CODE BLOCKS.
{"name":"Recipe Name","description":"One sentence","ingredients":["item with amount"],"instructions":["Step"],"category":"breakfast|soups|dinners|snacks|desserts","imageSearch":"food photo term"}`;

    const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{ role: 'user', content: `Create ${theme} for today's special` }],
            system: systemPrompt
        })
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    let text = data.content[0].text;
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const recipe = JSON.parse(text);
    recipe.image = `https://source.unsplash.com/800x600/?${encodeURIComponent(recipe.imageSearch || recipe.name)},food`;

    return recipe;
}

function setPrompt(text) {
    document.getElementById('explore-prompt').value = text;
}

function populateCategoryDropdown() {
    if (!menuData) return;
    const select = document.getElementById('target-category');
    select.innerHTML = menuData.categories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
}

async function generateRecipe() {
    const prompt = document.getElementById('explore-prompt').value;

    if (WORKER_URL === 'YOUR_WORKER_URL_HERE') {
        alert('AI not configured yet. Ask Nick to set up the Cloudflare Worker.');
        return;
    }
    if (!prompt) {
        alert('Please enter what kind of recipe you want');
        return;
    }

    // Build the approved ingredients list
    const approved = [];
    ['proteins', 'carbs', 'dairy', 'sauces', 'produce', 'pantry'].forEach(cat => {
        menuData.coreIngredients[cat].forEach(item => {
            approved.push(typeof item === 'string' ? item : item.name);
        });
    });

    const forbidden = menuData.forbiddenIngredients.map(item =>
        typeof item === 'string' ? item : item.name
    );

    // Get existing recipe names to avoid duplicates
    const existingRecipes = [];
    menuData.categories.forEach(cat => {
        cat.items.forEach(item => existingRecipes.push(item.name));
    });

    const systemPrompt = `You are a recipe creator for Larry, who has portal hypertension, severe gastroparesis, and esophageal varices.

CRITICAL DIETARY RULES:
- ONLY use ingredients from this approved list: ${approved.join(', ')}
- NEVER use these forbidden ingredients: ${forbidden.join(', ')}
- All foods must be soft, low-fiber, low-fat
- Small portions only (1-1.5 cups max)
- No spicy foods, no raw vegetables, no tough meats
- Soups and soft foods are ideal
- Foods should be easy to swallow, requiring minimal chewing

EXISTING RECIPES (do NOT recreate these or anything too similar):
${existingRecipes.join(', ')}

Create something NEW and DIFFERENT from the existing recipes above.

RESPOND WITH ONLY A RAW JSON OBJECT. NO MARKDOWN, NO CODE BLOCKS, NO EXPLANATION.
{"name":"Recipe Name","description":"Short description","ingredients":["item"],"instructions":["Step"],"category":"breakfast|soups|dinners|mexican|snacks|desserts","imageSearch":"search term"}`;

    // Show loading
    document.getElementById('explore-result').style.display = 'block';
    document.getElementById('explore-loading').style.display = 'block';
    document.getElementById('generated-recipe').innerHTML = '';
    document.getElementById('recipe-actions').style.display = 'none';
    document.getElementById('generate-btn').disabled = true;

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                system: systemPrompt
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        let text = data.content[0].text;

        // Strip markdown code blocks if present
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        // Parse the JSON response
        const recipe = JSON.parse(text);

        // Generate Unsplash image URL from search term
        const searchTerm = recipe.imageSearch || recipe.name;
        recipe.image = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)},food`;

        generatedRecipeData = recipe;

        // Display the recipe
        document.getElementById('generated-recipe').innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}" style="width:100%;max-width:400px;border-radius:12px;margin-bottom:1rem;">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            <h4>Ingredients:</h4>
            <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
            <h4>Instructions:</h4>
            <ol>${recipe.instructions.map(i => `<li>${i}</li>`).join('')}</ol>
        `;

        // Set the category dropdown
        if (recipe.category) {
            document.getElementById('target-category').value = recipe.category;
        }

        document.getElementById('recipe-actions').style.display = 'flex';

    } catch (error) {
        document.getElementById('generated-recipe').innerHTML = `
            <p style="color: var(--soft-red);">Error: ${error.message}</p>
            <p>Make sure your API key is correct and has credits.</p>
        `;
    } finally {
        document.getElementById('explore-loading').style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
    }
}

function addGeneratedToMenu() {
    if (!generatedRecipeData) return;

    const categoryId = document.getElementById('target-category').value;
    const category = menuData.categories.find(c => c.id === categoryId);
    if (!category) {
        alert('Please select a category');
        return;
    }

    // Create the new menu item
    const newItem = {
        id: generatedRecipeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: generatedRecipeData.name,
        description: generatedRecipeData.description,
        image: generatedRecipeData.image || 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400',
        submittedBy: 'AI Generated',
        recipe: {
            ingredients: generatedRecipeData.ingredients,
            instructions: generatedRecipeData.instructions
        }
    };

    // Add to category
    category.items.push(newItem);

    // Re-render menu
    renderMenuSections();
    populateCategoryDropdown();

    // Show success
    alert(`"${newItem.name}" added to ${category.name}! Go to Admin > Export to save permanently.`);

    // Clear the result
    generatedRecipeData = null;
    document.getElementById('explore-result').style.display = 'none';
    document.getElementById('explore-prompt').value = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMenuData();
    // Check explore auth after a small delay to ensure DOM is ready
    setTimeout(checkExploreAuth, 100);
});
