// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Table management initialized');
    loadTables();
});

// Get base URL for QR codes
function getBaseUrl() {
    return 'https://ritustark.github.io/hotel-test';
}

// Load tables from localStorage
function loadTables() {
    try {
        const savedData = localStorage.getItem('tableData');
        const tables = savedData ? JSON.parse(savedData) : [];
        renderTables(tables);
    } catch (error) {
        console.error('Error loading tables:', error);
        alert('Error loading tables');
    }
}

// Save tables to localStorage
function saveTables(tables) {
    try {
        localStorage.setItem('tableData', JSON.stringify(tables));
    } catch (error) {
        console.error('Error saving tables:', error);
        alert('Error saving tables');
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
                    No tables added yet. Click the + button to add your first table.
                </div>
            </div>
        `;
        return;
    }
    
    tablesList.innerHTML = tables.map(table => `
        <div class="col-md-4 mb-3">
            <div class="table-card">
                <div class="table-number">Table ${table.number}</div>
                <div id="qr-${table.number}" class="qr-code"></div>
                <div class="mt-3">
                    <button class="btn btn-outline-danger" onclick="deleteTable(${table.number})">
                        <i class="bi bi-trash"></i> Delete Table
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Generate QR codes
    tables.forEach(table => {
        new QRCode(document.getElementById(`qr-${table.number}`), {
            text: table.qrCode,
            width: 128,
            height: 128
        });
    });
} 