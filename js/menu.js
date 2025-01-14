// Global state
let menuData = null;
let cart = [];
let tableNumber = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get table number from URL
    const urlParams = new URLSearchParams(window.location.search);
    tableNumber = urlParams.get('table');
    if (tableNumber) {
        document.getElementById('tableNumber').textContent = tableNumber;
    }

    // Load menu data
    loadMenuData();
});

// Load menu data from localStorage
function loadMenuData() {
    const savedData = localStorage.getItem('restaurantData');
    console.log('Loaded menu data:', savedData); // Debug log
    if (savedData) {
        try {
            menuData = JSON.parse(savedData);
            if (menuData && menuData.categories && menuData.dishes) {
                renderMenu();
            } else {
                console.error('Invalid menu data structure');
                document.getElementById('menuCategories').innerHTML = '<p class="text-center">Menu is being updated. Please check back later.</p>';
            }
        } catch (e) {
            console.error('Error parsing menu data:', e);
            document.getElementById('menuCategories').innerHTML = '<p class="text-center">Error loading menu. Please try again later.</p>';
        }
    } else {
        document.getElementById('menuCategories').innerHTML = '<p class="text-center">No menu items available. Please check back later.</p>';
    }
}

// Render the menu
function renderMenu() {
    const menuContainer = document.getElementById('menuCategories');
    menuContainer.innerHTML = '';

    if (!menuData.categories || menuData.categories.length === 0) {
        menuContainer.innerHTML = '<p class="text-center">No menu categories available.</p>';
        return;
    }

    menuData.categories.forEach(category => {
        if (menuData.dishes[category] && menuData.dishes[category].length > 0) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.innerHTML = `
                <h2 class="category-title">${category}</h2>
                <div class="row">
                    ${renderDishesForCategory(category)}
                </div>
            `;
            menuContainer.appendChild(categorySection);
        }
    });
}

// Render dishes for a category
function renderDishesForCategory(category) {
    return menuData.dishes[category].map(dish => `
        <div class="col-md-6 col-lg-4">
            <div class="dish-card">
                <img src="${dish.imageUrl}" alt="${dish.name}" class="dish-image">
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
    cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none';
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