// Initialize Bootstrap modals
let addCategoryModal = null;
let addDishModal = null;
let currentCategory = null;

// Menu data structure
let menuData = {
    categories: [],
    dishes: {}
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu management initialized');
    
    // Initialize Bootstrap modals
    addCategoryModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    addDishModal = new bootstrap.Modal(document.getElementById('addDishModal'));
    
    // Load saved menu data
    loadMenuData();
    
    // Add form submit handlers
    document.getElementById('categoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addCategory();
    });
    
    document.getElementById('dishForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addDish();
    });
});

// Load menu data from localStorage
function loadMenuData() {
    try {
        const savedData = localStorage.getItem('menuData');
        if (savedData) {
            menuData = JSON.parse(savedData);
            console.log('Loaded menu data:', menuData);
        }
        renderCategories();
    } catch (error) {
        console.error('Error loading menu data:', error);
        alert('Error loading menu data');
    }
}

// Save menu data to localStorage
function saveMenuData() {
    try {
        localStorage.setItem('menuData', JSON.stringify(menuData));
        console.log('Saved menu data:', menuData);
    } catch (error) {
        console.error('Error saving menu data:', error);
        alert('Error saving menu data');
    }
}

// Show add category modal
function showAddCategoryModal() {
    document.getElementById('categoryName').value = '';
    addCategoryModal.show();
}

// Add new category
function addCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    if (menuData.categories.includes(categoryName)) {
        alert('Category already exists');
        return;
    }
    
    menuData.categories.push(categoryName);
    menuData.dishes[categoryName] = [];
    
    saveMenuData();
    renderCategories();
    addCategoryModal.hide();
}

// Show add dish modal
function showAddDishModal(category) {
    currentCategory = category;
    document.getElementById('dishName').value = '';
    document.getElementById('dishPrice').value = '';
    addDishModal.show();
}

// Add new dish
function addDish() {
    const dishName = document.getElementById('dishName').value.trim();
    const dishPrice = parseFloat(document.getElementById('dishPrice').value);
    
    if (!dishName || isNaN(dishPrice)) {
        alert('Please fill in all fields');
        return;
    }
    
    const dish = {
        name: dishName,
        price: dishPrice
    };
    
    menuData.dishes[currentCategory].push(dish);
    
    saveMenuData();
    renderCategories();
    addDishModal.hide();
}

// Delete category
function deleteCategory(category) {
    if (confirm(`Delete category "${category}" and all its dishes?`)) {
        menuData.categories = menuData.categories.filter(c => c !== category);
        delete menuData.dishes[category];
        saveMenuData();
        renderCategories();
    }
}

// Delete dish
function deleteDish(category, dishIndex) {
    menuData.dishes[category].splice(dishIndex, 1);
    saveMenuData();
    renderCategories();
}

// Render categories and dishes
function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';
    
    menuData.categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        
        categoryCard.innerHTML = `
            <div class="category-header">
                <h2 class="category-title">${category}</h2>
                <div class="btn-group">
                    <button class="btn btn-outline-success btn-sm" onclick="showAddDishModal('${category}')">
                        <i class="bi bi-plus-lg"></i> Add Dish
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteCategory('${category}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <div class="dishes-list">
                ${renderDishes(category)}
            </div>
        `;
        
        categoriesList.appendChild(categoryCard);
    });
}

// Render dishes for a category
function renderDishes(category) {
    return menuData.dishes[category].map((dish, index) => `
        <div class="dish-item">
            <div class="dish-header">
                <h3 class="dish-name">${dish.name}</h3>
                <span class="dish-price">₹${dish.price}</span>
            </div>
            <div class="action-buttons">
                <button class="btn btn-outline-danger btn-sm" onclick="deleteDish('${category}', ${index})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Confirm menu and redirect to QR code page
function confirmMenu() {
    try {
        // Save the confirmed menu
        localStorage.setItem('confirmed-menu', JSON.stringify(menuData));
        console.log('Menu confirmed:', menuData);
        
        // Redirect to QR codes page
        window.location.href = 'qr-codes.html';
    } catch (error) {
        console.error('Error confirming menu:', error);
        alert('Error confirming menu');
    }
} 