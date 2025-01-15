// Global state
let menuData = null;

// Get base URL for data sharing
function getBaseUrl() {
    return 'https://ritustark.github.io/hotel-test';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Confirmed menu page initialized');
    loadMenuData();
});

// Load menu data
function loadMenuData() {
    try {
        // Get confirmed menu data
        const confirmedMenu = localStorage.getItem('confirmed-menu');
        if (!confirmedMenu) {
            showMessage('No confirmed menu found. Please confirm the menu from the admin panel first.');
            return;
        }

        menuData = JSON.parse(confirmedMenu);
        console.log('Loaded confirmed menu:', menuData);
        renderMenuPreview();
    } catch (error) {
        console.error('Error loading menu:', error);
        showMessage('Error loading menu data');
    }
}

// Generate QR codes for tables
function generateQRCodes() {
    const tableCount = parseInt(document.getElementById('tableCount').value);
    if (!tableCount || tableCount < 1) {
        alert('Please enter a valid number of tables');
        return;
    }

    const qrCodesContainer = document.getElementById('qrCodes');
    qrCodesContainer.innerHTML = '';

    for (let i = 1; i <= tableCount; i++) {
        const tableQR = document.createElement('div');
        tableQR.className = 'table-qr';
        tableQR.innerHTML = `
            <div class="qr-card">
                <h4 class="table-title">Table ${i}</h4>
                <div id="qr-${i}" class="qr-code"></div>
                <div class="qr-actions mt-3">
                    <button class="btn btn-outline-primary" onclick="downloadQR(${i})">
                        <i class="bi bi-download"></i> Download QR
                    </button>
                    <a href="${getBaseUrl()}/menu.html?table=${i}" 
                       target="_blank" 
                       class="btn btn-outline-success">
                        <i class="bi bi-eye"></i> Preview Menu
                    </a>
                </div>
            </div>
        `;
        qrCodesContainer.appendChild(tableQR);

        // Generate QR code
        const qrUrl = `${getBaseUrl()}/menu.html?table=${i}`;
        new QRCode(document.getElementById(`qr-${i}`), {
            text: qrUrl,
            width: 128,
            height: 128
        });
    }

    // Show download all button
    document.querySelector('.download-all').style.display = 'inline-block';
}

// Download individual QR code
function downloadQR(tableNumber) {
    const canvas = document.querySelector(`#qr-${tableNumber} canvas`);
    downloadCanvas(canvas, `Table-${tableNumber}-QR.png`);
}

// Download all QR codes
function downloadAllQRCodes() {
    const qrCodes = document.querySelectorAll('.table-qr canvas');
    qrCodes.forEach((canvas, index) => {
        setTimeout(() => {
            downloadCanvas(canvas, `Table-${index + 1}-QR.png`);
        }, index * 500);
    });
}

// Helper function to download canvas as image
function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Show message in menu preview
function showMessage(message) {
    const menuPreview = document.getElementById('menuPreview');
    menuPreview.innerHTML = `
        <div class="alert alert-info text-center">
            <h4 class="alert-heading">${message}</h4>
        </div>
    `;
}

// Render menu preview
function renderMenuPreview() {
    const menuPreview = document.getElementById('menuPreview');
    menuPreview.innerHTML = '';

    // Add back to admin button
    menuPreview.innerHTML = `
        <div class="d-flex justify-content-between mb-4">
            <h3>Menu Preview</h3>
            <button class="btn btn-primary" onclick="window.location.href='index.html'">
                <i class="bi bi-arrow-left"></i> Back to Admin
            </button>
        </div>
    `;

    // Render categories and dishes
    menuData.categories.forEach(category => {
        if (menuData.dishes[category] && menuData.dishes[category].length > 0) {
            const categorySection = document.createElement('div');
            categorySection.className = 'mb-4';
            categorySection.innerHTML = `
                <h4 class="category-title">${category}</h4>
                <div class="row">
                    ${renderDishesForCategory(category)}
                </div>
            `;
            menuPreview.appendChild(categorySection);
        }
    });
}

// Render dishes for category
function renderDishesForCategory(category) {
    return menuData.dishes[category].map(dish => `
        <div class="col-md-4 mb-3">
            <div class="dish-card">
                <div class="dish-image-container">
                    <img src="${dish.imageUrl || 'https://via.placeholder.com/300x200'}" 
                         alt="${dish.name}" 
                         class="img-fluid rounded mb-2"
                         onerror="this.src='https://via.placeholder.com/300x200'">
                </div>
                <h5 class="dish-title">${dish.name}</h5>
                <p class="dish-description text-muted">${dish.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="dish-price text-success">₹${dish.price}</span>
                    <button class="btn btn-sm btn-outline-success" disabled>
                        <i class="bi bi-plus-circle"></i> ADD
                    </button>
                </div>
            </div>
        </div>
    `).join('');
} 