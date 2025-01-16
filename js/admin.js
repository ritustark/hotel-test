// Initialize data structure
let categories = [];

// Initialize the application
function initializeData() {
    try {
        console.log('Initializing admin panel...');
        // Load saved categories if they exist
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            categories = JSON.parse(savedCategories);
        }
        renderCategories();
    } catch (error) {
        console.error('Error initializing data:', error);
        showError('Failed to initialize. Please refresh the page.');
    }
}

// Save data
function saveData() {
    try {
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
        showError('Failed to save data');
    }
}

// Add category
function addCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    categories.push({
        name: categoryName,
        items: []
    });
    
    saveData();
    renderCategories();
    
    // Clear input and close modal
    document.getElementById('categoryName').value = '';
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
    modal.hide();
}

// Add item to category
function addItem(categoryIndex) {
    const itemName = document.getElementById(`itemName${categoryIndex}`).value.trim();
    const itemPrice = parseFloat(document.getElementById(`itemPrice${categoryIndex}`).value);
    
    if (!itemName || isNaN(itemPrice) || itemPrice <= 0) {
        alert('Please enter valid item details');
        return;
    }
    
    categories[categoryIndex].items.push({
        name: itemName,
        price: itemPrice
    });
    
    saveData();
    renderCategories();
    
    // Clear inputs and close modal
    document.getElementById(`itemName${categoryIndex}`).value = '';
    document.getElementById(`itemPrice${categoryIndex}`).value = '';
    const modal = bootstrap.Modal.getInstance(document.getElementById(`addItemModal${categoryIndex}`));
    modal.hide();
}

// Delete category
function deleteCategory(index) {
    if (confirm('Are you sure you want to delete this category and all its items?')) {
        categories.splice(index, 1);
        saveData();
        renderCategories();
    }
}

// Delete item
function deleteItem(categoryIndex, itemIndex) {
    if (confirm('Are you sure you want to delete this item?')) {
        categories[categoryIndex].items.splice(itemIndex, 1);
        saveData();
        renderCategories();
    }
}

// Confirm menu function
function confirmMenu() {
    try {
        if (!categories || categories.length === 0) {
            alert('Please add some menu items first');
            return;
        }
        
        // Save menu data in a format suitable for the menu page
        const menuData = {
            categories: categories.map(category => ({
                name: category.name,
                items: category.items.map((item, index) => ({
                    id: `${category.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
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
    document.getElementById('menuContent').prepend(errorDiv);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeData); 