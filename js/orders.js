// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Orders management initialized');
    loadOrders();
    // Auto-refresh orders every 30 seconds
    setInterval(loadOrders, 30000);
});

// Load orders
function loadOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        renderOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Error loading orders');
    }
}

// Render orders
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
    
    // Sort orders: waiting first, then by timestamp (newest first)
    orders.sort((a, b) => {
        if (a.status === b.status) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return a.status === 'waiting' ? -1 : 1;
    });
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h5 class="mb-0">Table ${order.tableNumber}</h5>
                <span class="status-badge status-${order.status}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </div>
            
            <div class="order-body">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">₹${item.price} × ${item.quantity}</small>
                        </div>
                        <div class="text-end">
                            ₹${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    Total: ₹${calculateOrderTotal(order)}
                </div>
                ${order.status === 'waiting' ? `
                    <button class="btn btn-success" onclick="updateOrderStatus('${order.timestamp}', 'ready')">
                        Mark as Ready
                    </button>
                ` : `
                    <button class="btn btn-warning" onclick="updateOrderStatus('${order.timestamp}', 'waiting')">
                        Mark as Waiting
                    </button>
                `}
            </div>
        </div>
    `).join('');
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