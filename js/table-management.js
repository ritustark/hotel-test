// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Table management initialized');
        initializeTableSystem();
    } catch (error) {
        console.error('Failed to initialize table system:', error);
        showError('System initialization failed. Please refresh the page.');
    }
});

// Initialize table system
function initializeTableSystem() {
    loadTables();
    // Add event listeners for offline/online status
    window.addEventListener('online', () => {
        console.log('Connection restored');
        loadTables();
    });
}

// Enhanced error handling and user feedback
function showError(message) {
    const tablesList = document.getElementById('tablesList');
    tablesList.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger text-center">
                <i class="bi bi-exclamation-circle"></i> ${message}
            </div>
        </div>
    `;
}

// Improved table data validation
function validateTableData(tables) {
    if (!Array.isArray(tables)) return false;
    return tables.every(table => 
        table && 
        typeof table.number === 'number' && 
        typeof table.qrCode === 'string'
    );
}

// Get base URL for QR codes
function getBaseUrl() {
    // Get the current URL and remove any trailing slashes
    const currentUrl = window.location.href.replace(/\/+$/, '');
    // Remove the current page name from the URL to get the base URL
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    return baseUrl;
}

// Load tables from localStorage
function loadTables() {
    try {
        const savedData = localStorage.getItem('tableData');
        const tables = savedData ? JSON.parse(savedData) : [];
        
        if (!validateTableData(tables)) {
            console.error('Invalid table data detected');
            localStorage.removeItem('tableData'); // Clear invalid data
            renderTables([]);
            return;
        }
        
        renderTables(tables);
    } catch (error) {
        console.error('Error loading tables:', error);
        showError('Failed to load tables. Please try again.');
    }
}

// Save tables to localStorage
function saveTables(tables) {
    try {
        if (!validateTableData(tables)) {
            throw new Error('Invalid table data');
        }
        localStorage.setItem('tableData', JSON.stringify(tables));
        return true;
    } catch (error) {
        console.error('Error saving tables:', error);
        showError('Failed to save tables. Please try again.');
        return false;
    }
}

// Add new table
function addTable() {
    try {
        const savedData = localStorage.getItem('tableData');
        const tables = savedData ? JSON.parse(savedData) : [];
        
        const newTable = {
            number: tables.length + 1,
            qrCode: `${getBaseUrl()}/menu.html?table=${tables.length + 1}`
        };
        
        tables.push(newTable);
        saveTables(tables);
        renderTables(tables);
        
    } catch (error) {
        console.error('Error adding table:', error);
        alert('Error adding table');
    }
}

// Delete table
function deleteTable(tableNumber) {
    if (confirm(`Delete Table ${tableNumber}?`)) {
        try {
            const savedData = localStorage.getItem('tableData');
            let tables = savedData ? JSON.parse(savedData) : [];
            
            tables = tables.filter(table => table.number !== tableNumber);
            
            // Renumber remaining tables
            tables.forEach((table, index) => {
                table.number = index + 1;
                table.qrCode = `${getBaseUrl()}/menu.html?table=${index + 1}`;
            });
            
            saveTables(tables);
            renderTables(tables);
            
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('Error deleting table');
        }
    }
}

// Generate QR codes for all tables
function generateQRCodes() {
    try {
        const savedData = localStorage.getItem('tableData');
        const tables = savedData ? JSON.parse(savedData) : [];
        
        if (tables.length === 0) {
            alert('Please add some tables first');
            return;
        }
        
        // Redirect to QR codes page
        window.location.href = 'qr-codes.html';
        
    } catch (error) {
        console.error('Error generating QR codes:', error);
        alert('Error generating QR codes');
    }
}

// Render tables
function renderTables(tables) {
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
    
    tables.forEach(table => {
        const tableCol = document.createElement('div');
        tableCol.className = 'col-md-4 mb-3';
        tableCol.innerHTML = `
            <div class="table-card">
                <div class="table-number">Table ${table.number}</div>
                <div id="qr-${table.number}" class="qr-code"></div>
                <div class="mt-3">
                    <button class="btn btn-outline-danger" onclick="deleteTable(${table.number})">
                        <i class="bi bi-trash"></i> Delete Table
                    </button>
                </div>
            </div>
        `;
        fragment.appendChild(tableCol);
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