// Load orders on page load
document.addEventListener('DOMContentLoaded', loadOrders);

// Auto-refresh orders every 30 seconds
setInterval(loadOrders, 30000);

// Load and display orders
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <h3 class="mt-3">No Orders Yet</h3>
                <p>New orders will appear here automatically</p>
            </div>
        `;
        return;
    }

    // Sort orders by timestamp (newest first) and status (waiting first)
    orders.sort((a, b) => {
        if (a.status === b.status) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return a.status === 'waiting' ? -1 : 1;
    });

    ordersContainer.innerHTML = orders.map(order => `
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
                        <div class="order-item-total">
                            ₹${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-actions d-flex justify-content-between align-items-center">
                <div class="order-total">
                    Total: ₹${calculateOrderTotal(order)}
                </div>
                ${order.status === 'waiting' ? `
                    <button class="btn btn-success" onclick="markOrderReady('${order.timestamp}')">
                        Mark as Ready
                    </button>
                ` : `
                    <button class="btn btn-secondary" onclick="markOrderWaiting('${order.timestamp}')">
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

// Mark order as ready
function markOrderReady(timestamp) {
    updateOrderStatus(timestamp, 'ready');
}

// Mark order as waiting
function markOrderWaiting(timestamp) {
    updateOrderStatus(timestamp, 'waiting');
}

// Update order status
function updateOrderStatus(timestamp, status) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(order => order.timestamp === timestamp);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }
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