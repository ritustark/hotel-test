// Global state
let menuData = null;
let cart = [];
let tableNumber = null;
let currentCategory = null;
let cartModal = null;
let orderModal = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu page initialized');
    
    // Initialize Bootstrap modals
    cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    
    // Get table number from URL
    const urlParams = new URLSearchParams(window.location.search);
    tableNumber = urlParams.get('table');
    console.log('Table number:', tableNumber);
    
    if (tableNumber) {
        document.getElementById('tableNumber').textContent = tableNumber;
    }

    // Load menu data
    loadMenuData();

    // Add touch event listeners for better mobile interaction
    addTouchEventListeners();
});

// Add touch event listeners
function addTouchEventListeners() {
    // Prevent double-tap zoom on buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            // The click event will still fire
        });
    });

    // Smooth scroll for category tabs
    const categoryTabs = document.getElementById('categoryTabs');
    let isScrolling = false;
    let startX;
    let scrollLeft;

    categoryTabs.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - categoryTabs.offsetLeft;
        scrollLeft = categoryTabs.scrollLeft;
    });

    categoryTabs.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.touches[0].pageX - categoryTabs.offsetLeft;
        const walk = (x - startX) * 2;
        categoryTabs.scrollLeft = scrollLeft - walk;
    });

    categoryTabs.addEventListener('touchend', () => {
        isScrolling = false;
    });
}

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
                onclick="switchCategory('${category}')"
                role="tab"
                aria-selected="${category === currentCategory}">
            ${category}
        </button>
    `).join('');

    // Scroll active category into view
    const activeTab = categoryTabs.querySelector('.active');
    if (activeTab) {
        const scrollLeft = activeTab.offsetLeft - (categoryTabs.clientWidth - activeTab.clientWidth) / 2;
        categoryTabs.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
}

// Switch category with smooth transitions
function switchCategory(category) {
    if (category === currentCategory) return;
    
    const menuItems = document.getElementById('menuItems');
    menuItems.style.opacity = '0';
    
    setTimeout(() => {
        currentCategory = category;
        renderCategories();
        renderMenuItems();
        menuItems.style.opacity = '1';
    }, 150);
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
                    <button class="add-btn" 
                            onclick="updateQuantity('${currentCategory}', '${dish.name}', 1)"
                            aria-label="Add ${dish.name}">
                        ADD+
                    </button>
                ` : `
                    <div class="quantity-control">
                        <button class="btn btn-outline-success btn-sm" 
                                onclick="updateQuantity('${currentCategory}', '${dish.name}', -1)"
                                aria-label="Decrease quantity">-</button>
                        <span aria-label="Quantity">${quantity}</span>
                        <button class="btn btn-outline-success btn-sm" 
                                onclick="updateQuantity('${currentCategory}', '${dish.name}', 1)"
                                aria-label="Increase quantity">+</button>
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

// Update quantity of an item with haptic feedback
function updateQuantity(category, dishName, change) {
    // Provide haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
    }

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
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
    }
    cartModal.show();
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
    
    // Show/hide cart badge with animation
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    if (totalItems > 0) {
        cartBadge.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBadge.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Update cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">₹${item.price} × ${item.quantity}</small>
            </div>
            <div class="quantity-control">
                <button class="btn btn-sm btn-outline-success" 
                    onclick="updateQuantity('${item.category}', '${item.name}', -1)"
                    aria-label="Decrease quantity">-</button>
                <span aria-label="Quantity">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-success" 
                    onclick="updateQuantity('${item.category}', '${item.name}', 1)"
                    aria-label="Increase quantity">+</button>
            </div>
        </div>
    `).join('');
    
    // Update total with animation
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById('cartTotal');
    totalElement.style.transform = 'scale(1.1)';
    totalElement.textContent = total.toFixed(2);
    setTimeout(() => {
        totalElement.style.transform = 'scale(1)';
    }, 100);
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
    cartModal.hide();
    setTimeout(() => {
        orderModal.show();
    }, 300);

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