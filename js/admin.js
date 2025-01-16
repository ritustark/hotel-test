// Initialize data structure
let categories = [];
let currentCategoryIndex = -1;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing admin panel...');
        loadCategories();
        renderCategories();
    } catch (error) {
        console.error('Error initializing:', error);
        showError('Failed to initialize. Please refresh the page.');
    }
});

// Load categories from localStorage
function loadCategories() {
    try {
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            categories = JSON.parse(savedCategories);
            console.log('Loaded categories:', categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        categories = [];
    }
}

// Save categories to localStorage
function saveCategories() {
    try {
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log('Saved categories:', categories);
    } catch (error) {
        console.error('Error saving categories:', error);
        showError('Failed to save changes');
    }
}

// Show add category modal
function showAddCategoryModal() {
    const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    document.getElementById('categoryName').value = '';
    modal.show();
}

// Add new category
function addCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
        alert('A category with this name already exists');
        return;
    }
    
    categories.push({
        name: categoryName,
        items: []
    });
    
    saveCategories();
    renderCategories();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
    modal.hide();
}

// Show add item modal
function showAddItemModal(categoryIndex) {
    currentCategoryIndex = categoryIndex;
    
    // Clone the template modal
    const template = document.getElementById('addItemModalTemplate');
    const modal = new bootstrap.Modal(template);
    
    // Clear inputs
    template.querySelector('#itemName').value = '';
    template.querySelector('#itemPrice').value = '';
    
    modal.show();
}

// Add new item to category
function addItem() {
    const itemName = document.getElementById('itemName').value.trim();
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    
    if (!itemName || isNaN(itemPrice) || itemPrice <= 0) {
        alert('Please enter valid item details');
        return;
    }
    
    if (categories[currentCategoryIndex].items.some(item => item.name.toLowerCase() === itemName.toLowerCase())) {
        alert('An item with this name already exists in this category');
        return;
    }
    
    categories[currentCategoryIndex].items.push({
        name: itemName,
        price: itemPrice
    });
    
    saveCategories();
    renderCategories();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModalTemplate'));
    modal.hide();
}

// Delete category
function deleteCategory(index) {
    if (confirm(`Are you sure you want to delete "${categories[index].name}" and all its items?`)) {
        categories.splice(index, 1);
        saveCategories();
        renderCategories();
    }
}

// Delete item
function deleteItem(categoryIndex, itemIndex) {
    const item = categories[categoryIndex].items[itemIndex];
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        categories[categoryIndex].items.splice(itemIndex, 1);
        saveCategories();
        renderCategories();
    }
}

// Render categories and items
function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    
    if (!categories || categories.length === 0) {
        categoriesList.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="bi bi-info-circle"></i> No categories added yet. Click "Add Category" to create your first category.
            </div>
        `;
        return;
    }
    
    categoriesList.innerHTML = categories.map((category, categoryIndex) => `
        <div class="category-card">
            <div class="category-header">
                <h2 class="mb-0" style="font-size: 1.2rem;">${category.name}</h2>
                <div class="action-buttons">
                    <button class="btn btn-light btn-sm" onclick="showAddItemModal(${categoryIndex})">
                        <i class="bi bi-plus-circle"></i> Add Item
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory(${categoryIndex})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <div class="category-content">
                ${category.items.length === 0 ? `
                    <div class="text-muted text-center py-3">
                        No items in this category. Click "Add Item" to add your first item.
                    </div>
                ` : category.items.map((item, itemIndex) => `
                    <div class="item-row">
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">₹${item.price.toFixed(2)}</div>
                        </div>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteItem(${categoryIndex}, ${itemIndex})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Confirm menu and proceed to table management
function confirmMenu() {
    try {
        if (!categories || categories.length === 0) {
            alert('Please add some categories and items first');
            return;
        }
        
        let hasItems = false;
        for (const category of categories) {
            if (category.items.length > 0) {
                hasItems = true;
                break;
            }
        }
        
        if (!hasItems) {
            alert('Please add some items to your categories first');
            return;
        }
        
        // Format menu data for the menu page
        const menuData = {
            categories: categories.map(category => ({
                name: category.name,
                items: category.items.map((item, index) => ({
                    id: `${category.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
                    name: item.name,
                    price: item.price
                }))
            }))
        };
        
        // Save menu data
        localStorage.setItem('menuData', JSON.stringify(menuData));
        console.log('Menu data saved:', menuData);
        
        // Redirect to table management
        window.location.href = 'table-management.html';
        
    } catch (error) {
        console.error('Error confirming menu:', error);
        alert('Error confirming menu. Please try again.');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        <i class="bi bi-exclamation-circle"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').prepend(errorDiv);
} 