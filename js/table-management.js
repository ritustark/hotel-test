// Initialize data structure
let tables = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing table management...');
        loadTables();
        renderTables();
    } catch (error) {
        console.error('Error initializing:', error);
        showError('Failed to initialize. Please refresh the page.');
    }
});

// Get base URL for QR codes
function getBaseUrl() {
    try {
        // Get the current URL
        const currentUrl = window.location.href;
        console.log('Current URL:', currentUrl);
        
        // Remove trailing slashes and 'table-management.html'
        const baseUrl = currentUrl.replace(/\/+$/, '').replace(/\/[^\/]+$/, '');
        console.log('Base URL:', baseUrl);
        
        return baseUrl;
    } catch (error) {
        console.error('Error getting base URL:', error);
        showError('Failed to generate QR code URL');
        return '';
    }
}

// Load tables from localStorage
function loadTables() {
    try {
        const savedData = localStorage.getItem('tableData');
        if (savedData) {
            tables = JSON.parse(savedData);
            console.log('Loaded tables:', tables);
        }
    } catch (error) {
        console.error('Error loading tables:', error);
        tables = [];
    }
}

// Save tables to localStorage
function saveTables() {
    try {
        localStorage.setItem('tableData', JSON.stringify(tables));
        console.log('Saved tables:', tables);
    } catch (error) {
        console.error('Error saving tables:', error);
        showError('Failed to save changes');
    }
}

// Add new table
function addTable() {
    try {
        // Get the next table number
        const tableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
        
        // Generate QR code URL
        const baseUrl = getBaseUrl();
        const qrCodeUrl = `${baseUrl}/menu.html?table=${tableNumber}`;
        console.log('Generated QR code URL:', qrCodeUrl);
        
        // Add new table
        tables.push({
            number: tableNumber,
            qrCode: qrCodeUrl
        });
        
        saveTables();
        renderTables();
    } catch (error) {
        console.error('Error adding table:', error);
        showError('Failed to add table');
    }
}

// Delete table
function deleteTable(index) {
    try {
        if (confirm(`Are you sure you want to delete Table ${tables[index].number}?`)) {
            tables.splice(index, 1);
            saveTables();
            renderTables();
        }
    } catch (error) {
        console.error('Error deleting table:', error);
        showError('Failed to delete table');
    }
}

// Render tables
function renderTables() {
    const tablesList = document.getElementById('tablesList');
    
    if (!tables || tables.length === 0) {
        tablesList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="bi bi-info-circle"></i> No tables added yet. Click the + button to add your first table.
                </div>
            </div>
        `;
        return;
    }
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    tables.forEach((table, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="table-card">
                <div class="table-number">Table ${table.number}</div>
                <div id="qr-${table.number}" class="qr-code"></div>
                <button class="btn btn-danger mt-3" onclick="deleteTable(${index})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        `;
        fragment.appendChild(col);
    });
    
    tablesList.innerHTML = '';
    tablesList.appendChild(fragment);
    
    // Generate QR codes after DOM update
    requestAnimationFrame(() => {
        tables.forEach(table => {
            new QRCode(document.getElementById(`qr-${table.number}`), {
                text: table.qrCode,
                width: 128,
                height: 128,
                correctLevel: QRCode.CorrectLevel.H
            });
        });
    });
}

// Generate QR codes page
function generateQRCodes() {
    try {
        if (!tables || tables.length === 0) {
            alert('Please add some tables first');
            return;
        }
        
        window.location.href = 'qr-codes.html';
    } catch (error) {
        console.error('Error generating QR codes:', error);
        showError('Failed to generate QR codes');
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