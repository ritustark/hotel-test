// Global state
let menuData = null;
let cart = [];
let tableNumber = null;

// Get base URL for data sharing
function getBaseUrl() {
    return 'https://ritustark.github.io/hotel-test';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu page initialized');
    console.log('Current URL:', window.location.href);
    console.log('Base URL:', getBaseUrl());
    
    // Get table number from URL
    const urlParams = new URLSearchParams(window.location.search);
    tableNumber = urlParams.get('table');
    console.log('Table number:', tableNumber);
    
    if (tableNumber) {
        document.getElementById('tableNumber').textContent = tableNumber;
    }

    // Load menu data
    loadMenuData();

    // Set up periodic refresh
    setInterval(loadMenuData, 5000); // Refresh every 5 seconds
});

// Load menu data from all possible storage locations
function loadMenuData() {
    try {
        console.log('Attempting to load menu data...');
        
        // Try all possible storage keys
        const keys = [
            'hotel-look-menu',
            'menuData',
            'restaurantData'
        ];
        
        let savedData = null;
        for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) {
                console.log(`Found data in ${key}`);
                savedData = data;
                break;
            }
        }
        
        if (!savedData) {
            console.warn('No menu data found in any storage location');
            showNoMenuMessage('Menu data not found');
            return;
        }

        // Parse the saved data
        const newMenuData = JSON.parse(savedData);
        console.log('Parsed menu data:', newMenuData);
        
        // Validate the data structure
        if (!newMenuData || !newMenuData.categories || !newMenuData.dishes) {
            console.error('Invalid menu data structure:', newMenuData);
            showNoMenuMessage('Invalid menu data');
            return;
        }

        // Check if we have any categories and dishes
        if (newMenuData.categories.length === 0) {
            console.warn('No categories found');
            showNoMenuMessage('No menu categories available');
            return;
        }

        const totalDishes = Object.values(newMenuData.dishes).reduce((sum, dishes) => sum + dishes.length, 0);
        console.log('Total dishes found:', totalDishes);
        
        if (totalDishes === 0) {
            console.warn('No dishes found');
            showNoMenuMessage('No dishes available');
            return;
        }

        // Update menu data and render
        menuData = newMenuData;
        console.log('Menu data loaded successfully:', {
            categories: menuData.categories.length,
            dishes: totalDishes
        });
        
        renderMenu();
        updateCartUI();
        
    } catch (error) {
        console.error('Error loading menu data:', error);
        showNoMenuMessage('Error loading menu. Please try refreshing.');
    }
}

function showNoMenuMessage(message = 'Menu Not Available') {
    const menuContainer = document.getElementById('menuCategories');
    menuContainer.innerHTML = `
        <div class="alert alert-info text-center" role="alert">
            <h4 class="alert-heading">${message}</h4>
            <p>Please ask the staff to update the menu.</p>
            <hr>
            <p class="mb-0">
                <button onclick="loadMenuData()" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-clockwise"></i> Refresh Menu
                </button>
            </p>
        </div>
    `;
}

// Render the menu
function renderMenu() {
    const menuContainer = document.getElementById('menuCategories');
    menuContainer.innerHTML = '';

    menuData.categories.forEach(category => {
        if (menuData.dishes[category] && menuData.dishes[category].length > 0) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section mb-4';
            categorySection.innerHTML = `
                <h2 class="category-title">${category}</h2>
                <div class="row">
                    ${renderDishesForCategory(category)}
                </div>
            `;
            menuContainer.appendChild(categorySection);
        }
    });

    // If no categories were rendered, show message
    if (menuContainer.children.length === 0) {
        showNoMenuMessage('No menu items available');
    }
}

// Render dishes for a category
function renderDishesForCategory(category) {
    return menuData.dishes[category].map(dish => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="dish-card">
                <img src="${dish.imageUrl || 'https://via.placeholder.com/300x200'}" 
                     alt="${dish.name}" 
                     class="dish-image"
                     onerror="this.src='https://via.placeholder.com/300x200'">
                <div class="card-body p-3">
                    <h5 class="card-title">${dish.name}</h5>
                    <p class="card-text">${dish.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="dish-price">₹${dish.price}</span>
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateQuantity('${category}', '${dish.name}', -1)">-</button>
                            <span id="quantity-${category}-${dish.name}">
                                ${getQuantityInCart(category, dish.name)}
                            </span>
                            <button class="quantity-btn" onclick="updateQuantity('${category}', '${dish.name}', 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Get quantity of a dish in cart
function getQuantityInCart(category, dishName) {
    const cartItem = cart.find(item => item.category === category && item.name === dishName);
    return cartItem ? cartItem.quantity : 0;
}

// Update quantity of a dish
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

    updateCartUI();
    document.getElementById(`quantity-${category}-${dishName}`).textContent = 
        getQuantityInCart(category, dishName);
}

// Toggle cart visibility
function toggleCart() {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer.style.display === 'none' || !cartContainer.style.display) {
        cartContainer.style.display = 'block';
    } else {
        cartContainer.style.display = 'none';
    }
}

// Update cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartBadge = document.querySelector('.cart-badge');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Show/hide cart badge and update its position
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    
    // Update cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">₹${item.price} × ${item.quantity}</small>
            </div>
            <div class="quantity-control">
                <button class="quantity-btn" 
                    onclick="updateQuantity('${item.category}', '${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" 
                    onclick="updateQuantity('${item.category}', '${item.name}', 1)">+</button>
            </div>
        </div>
    `).join('');
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
    
    // Show cart container if there are items
    const cartContainer = document.getElementById('cartContainer');
    if (totalItems > 0 && cartContainer.style.display === 'none') {
        cartContainer.style.display = 'block';
    }
}

// Place order
function placeOrder() {
    if (cart.length === 0) return;

    const order = {
        tableNumber,
        items: cart,
        status: 'waiting',
        timestamp: new Date().toISOString()
    };

    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();

    // Show order status
    document.getElementById('orderStatus').style.display = 'block';

    // Clear cart
    cart = [];
    updateCartUI();
    toggleCart();
}

// Check order status periodically
setInterval(() => {
    if (tableNumber) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const tableOrders = orders.filter(order => order.tableNumber === tableNumber);
        
        if (tableOrders.length > 0) {
            const latestOrder = tableOrders[tableOrders.length - 1];
            const statusElement = document.getElementById('orderStatus');
            
            if (latestOrder.status === 'ready') {
                statusElement.innerHTML = '<span class="status-ready">Order Status: Ready</span>';
            } else {
                statusElement.innerHTML = '<span class="status-waiting">Order Status: Waiting</span>';
            }
            
            statusElement.style.display = 'block';
        }
    }
}, 5000); 