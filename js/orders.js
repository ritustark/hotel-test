// Initialize with enhanced error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Orders management initialized');
        initializeOrderSystem();
    } catch (error) {
        console.error('Failed to initialize order system:', error);
        showError('System initialization failed. Please refresh the page.');
    }
});

// Initialize order system
function initializeOrderSystem() {
    loadOrders();
    setupAutoRefresh();
    setupEventListeners();
}

// Set up auto-refresh with intelligent timing
function setupAutoRefresh() {
    let refreshInterval = 30000; // Start with 30 seconds
    let lastOrderCount = 0;
    
    setInterval(() => {
        const currentOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Adjust refresh rate based on order activity
        if (currentOrders.length > lastOrderCount) {
            refreshInterval = Math.max(15000, refreshInterval - 5000); // Decrease interval
        } else if (currentOrders.length === lastOrderCount) {
            refreshInterval = Math.min(60000, refreshInterval + 5000); // Increase interval
        }
        
        lastOrderCount = currentOrders.length;
        loadOrders();
    }, refreshInterval);
}

// Set up event listeners
function setupEventListeners() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'orders') {
            console.log('Orders updated in another tab');
            loadOrders();
        }
    });
    
    window.addEventListener('online', () => {
        console.log('Connection restored');
        loadOrders();
    });
}

// Validate order data
function validateOrderData(orders) {
    if (!Array.isArray(orders)) return false;
    return orders.every(order => 
        order &&
        typeof order.tableNumber === 'number' &&
        Array.isArray(order.items) &&
        typeof order.timestamp === 'string' &&
        ['waiting', 'ready'].includes(order.status)
    );
}

// Load orders with validation
function loadOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        if (!validateOrderData(orders)) {
            console.error('Invalid order data detected');
            localStorage.removeItem('orders');
            renderOrders([]);
            return;
        }
        
        renderOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders. Please refresh the page.');
    }
}

// Enhanced render orders with performance optimization
function renderOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <h3 class="mt-3">No Orders Yet</h3>
                <p class="text-muted">New orders will appear here automatically</p>
            </div>
        `;
        return;
    }
    
    // Sort orders with improved efficiency
    orders.sort((a, b) => {
        const statusPriority = { waiting: 0, ready: 1 };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        return statusDiff || new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = generateOrderHTML(order);
        fragment.appendChild(orderCard);
    });
    
    ordersList.innerHTML = '';
    ordersList.appendChild(fragment);
}

// Generate order HTML (separated for better maintainability)
function generateOrderHTML(order) {
    return `
        <div class="order-header">
            <h5 class="mb-0">Table ${order.tableNumber}</h5>
            <span class="status-badge status-${order.status}">
                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
        </div>
        
        <div class="order-body">
            ${generateOrderItemsHTML(order.items)}
        </div>
        
        <div class="order-footer">
            <div class="order-total">
                Total: ₹${calculateOrderTotal(order)}
            </div>
            ${generateOrderActionHTML(order)}
        </div>
    `;
}

// Generate order items HTML
function generateOrderItemsHTML(items) {
    return items.map(item => `
        <div class="order-item">
            <div>
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">₹${item.price} × ${item.quantity}</small>
            </div>
            <div class="text-end">
                ₹${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Generate order action HTML
function generateOrderActionHTML(order) {
    return order.status === 'waiting' 
        ? `<button class="btn btn-success" onclick="updateOrderStatus('${order.timestamp}', 'ready')">
               <i class="bi bi-check-circle"></i> Mark as Ready
           </button>`
        : `<button class="btn btn-warning" onclick="updateOrderStatus('${order.timestamp}', 'waiting')">
               <i class="bi bi-clock"></i> Mark as Waiting
           </button>`;
}

// Calculate order total
function calculateOrderTotal(order) {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}

// Update order status
function updateOrderStatus(timestamp, newStatus) {
    try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderIndex = orders.findIndex(order => order.timestamp === timestamp);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('orders', JSON.stringify(orders));
            renderOrders(orders);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Error updating order status');
    }
}

// Show error message
function showError(message) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = `
        <div class="alert alert-danger text-center">
            <i class="bi bi-exclamation-circle"></i> ${message}
        </div>
    `;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
} 