// Global state
let menuData = null;
let cart = [];
let tableNumber = null;
let currentCategory = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu page initialized');
    
    // Get table number from URL
    const urlParams = new URLSearchParams(window.location.search);
    tableNumber = urlParams.get('table');
    console.log('Table number:', tableNumber);
    
    if (tableNumber) {
        document.getElementById('tableNumber').textContent = tableNumber;
    }

    // Load menu data
    loadMenuData();
});

// Load menu data from localStorage
function loadMenuData() {
    try {
        console.log('Loading menu data...');
        
        // Get confirmed menu data
        const confirmedMenu = localStorage.getItem('confirmed-menu');
        if (!confirmedMenu) {
            showMessage('Menu data not found');
            return;
        }

        // Parse the saved data
        menuData = JSON.parse(confirmedMenu);
        console.log('Loaded menu data:', menuData);
        
        if (!menuData || !menuData.categories || !menuData.dishes) {
            showMessage('Invalid menu data');
            return;
        }

        // Set first category as current
        if (menuData.categories.length > 0) {
            currentCategory = menuData.categories[0];
        }

        // Render UI
        renderCategories();
        renderMenuItems();
        updateCartUI();
        
    } catch (error) {
        console.error('Error loading menu:', error);
        showMessage('Error loading menu');
    }
}

// Render category tabs
function renderCategories() {
    const categoryTabs = document.getElementById('categoryTabs');
    categoryTabs.innerHTML = menuData.categories.map(category => `
        <button class="category-tab ${category === currentCategory ? 'active' : ''}"
                onclick="switchCategory('${category}')">
            ${category}
        </button>
    `).join('');
}

// Switch category
function switchCategory(category) {
    currentCategory = category;
    renderCategories();
    renderMenuItems();
}

// Render menu items for current category
function renderMenuItems() {
    const menuItems = document.getElementById('menuItems');
    menuItems.innerHTML = '';

    if (!currentCategory) return;

    const dishes = menuData.dishes[currentCategory] || [];
    dishes.forEach(dish => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        
        const quantity = getQuantityInCart(currentCategory, dish.name);
        
        itemCard.innerHTML = `
            <div class="item-details">
                <div class="item-info">
                    <div class="item-name">${dish.name}</div>
                    <div class="item-price">₹${dish.price}</div>
                </div>
                ${quantity === 0 ? `
                    <button class="add-btn" onclick="updateQuantity('${currentCategory}', '${dish.name}', 1)">
                        ADD+
                    </button>
                ` : `
                    <div class="quantity-control">
                        <button class="btn btn-outline-success btn-sm" onclick="updateQuantity('${currentCategory}', '${dish.name}', -1)">-</button>
                        <span>${quantity}</span>
                        <button class="btn btn-outline-success btn-sm" onclick="updateQuantity('${currentCategory}', '${dish.name}', 1)">+</button>
                    </div>
                `}
            </div>
        `;
        menuItems.appendChild(itemCard);
    });
}

// Get quantity of item in cart
function getQuantityInCart(category, dishName) {
    const cartItem = cart.find(item => item.category === category && item.name === dishName);
    return cartItem ? cartItem.quantity : 0;
}

// Update quantity of an item
function updateQuantity(category, dishName, change) {
    const cartItem = cart.find(item => item.category === category && item.name === dishName);
    const dish = menuData.dishes[category].find(d => d.name === dishName);
    
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item !== cartItem);
        }
    } else if (change > 0) {
        cart.push({
            category,
            name: dishName,
            price: dish.price,
            quantity: 1
        });
    }

    renderMenuItems();
    updateCartUI();
}

// Toggle cart modal
function toggleCart() {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
}

// Update cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">₹${item.price} × ${item.quantity}</small>
            </div>
            <div class="quantity-control">
                <button class="btn btn-sm btn-outline-success" 
                    onclick="updateQuantity('${item.category}', '${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="btn btn-sm btn-outline-success" 
                    onclick="updateQuantity('${item.category}', '${item.name}', 1)">+</button>
            </div>
        </div>
    `).join('');
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Place order
function placeOrder() {
    if (cart.length === 0) {
        alert('Please add items to your cart first');
        return;
    }

    const order = {
        tableNumber,
        items: cart,
        status: 'waiting',
        timestamp: new Date().toISOString()
    };

    // Save order
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show confirmation
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    cartModal.hide();
    
    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show();

    // Clear cart
    cart = [];
    updateCartUI();
    renderMenuItems();
}

// Show message
function showMessage(message) {
    const menuItems = document.getElementById('menuItems');
    menuItems.innerHTML = `
        <div class="alert alert-info text-center m-3">
            <h4 class="alert-heading">${message}</h4>
            <p>Please ask the staff to update the menu.</p>
            <button onclick="loadMenuData()" class="btn btn-outline-primary mt-3">
                <i class="bi bi-arrow-clockwise"></i> Refresh Menu
            </button>
        </div>
    `;
} 