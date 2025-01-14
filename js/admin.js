// Global state
let menuData = {
    categories: [],
    dishes: {},
    tables: []
};

// Initialize from Firebase
function initializeData() {
    try {
        // Get reference to menu data
        const menuRef = firebase.database().ref('menuData');
        
        // Listen for changes
        menuRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                menuData = data;
                console.log('Loaded menu data from Firebase:', menuData);
                renderCategories();
                renderTables();
            } else {
                console.log('No existing data found, starting fresh');
                saveData();
            }
        });
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Save data to Firebase
function saveData() {
    try {
        const menuRef = firebase.database().ref('menuData');
        menuRef.set(menuData);
        console.log('Saved menu data to Firebase:', menuData);
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving menu data. Please try again.');
    }
}

// Show/Hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
}

// Get GitHub Pages base URL
function getBaseUrl() {
    // Get the repository name from the URL
    const pathArray = window.location.pathname.split('/');
    const repoName = pathArray[1]; // This will be your repository name
    return `${window.location.protocol}//${window.location.host}/${repoName}`;
}

// Category Management
function showAddCategoryModal() {
    const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    modal.show();
}

function addCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    console.log('Adding category:', categoryName);
    
    if (categoryName && !menuData.categories.includes(categoryName)) {
        menuData.categories.push(categoryName);
        menuData.dishes[categoryName] = [];
        console.log('Updated menu data after adding category:', menuData);
        
        saveData();
        renderCategories();
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
        modal.hide();
        document.getElementById('categoryForm').reset();
    } else {
        console.log('Invalid category name or category already exists');
    }
}

function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';
    
    menuData.categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'col-md-4';
        categoryCard.innerHTML = `
            <div class="card category-card">
                <div class="card-body">
                    <h5 class="card-title">${category}</h5>
                    <p class="card-text">${menuData.dishes[category].length} dishes</p>
                    <button class="btn btn-primary" onclick="showAddDishModal('${category}')">Add Dish</button>
                    <button class="btn btn-danger" onclick="deleteCategory('${category}')">Delete</button>
                </div>
                <div class="list-group list-group-flush">
                    ${renderDishesForCategory(category)}
                </div>
            </div>
        `;
        categoriesList.appendChild(categoryCard);
    });
}

function deleteCategory(category) {
    if (confirm(`Are you sure you want to delete ${category} and all its dishes?`)) {
        menuData.categories = menuData.categories.filter(c => c !== category);
        delete menuData.dishes[category];
        saveData();
        renderCategories();
    }
}

// Dish Management
let currentCategory = '';

function showAddDishModal(category) {
    currentCategory = category;
    const modal = new bootstrap.Modal(document.getElementById('addDishModal'));
    modal.show();
}

function addDish() {
    const name = document.getElementById('dishName').value.trim();
    const price = document.getElementById('dishPrice').value;
    const description = document.getElementById('dishDescription').value.trim();
    const imageUrl = document.getElementById('dishImage').value.trim();
    
    console.log('Adding dish:', { name, price, description, imageUrl, category: currentCategory });
    
    if (name && price && description) {
        const dish = {
            name,
            price: parseFloat(price),
            description,
            imageUrl: imageUrl || 'https://via.placeholder.com/300x200'
        };
        
        if (!menuData.dishes[currentCategory]) {
            menuData.dishes[currentCategory] = [];
        }
        
        menuData.dishes[currentCategory].push(dish);
        console.log('Updated menu data after adding dish:', menuData);
        
        saveData();
        renderCategories();
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDishModal'));
        modal.hide();
        document.getElementById('dishForm').reset();
    } else {
        console.log('Invalid dish data');
    }
}

function renderDishesForCategory(category) {
    return menuData.dishes[category].map(dish => `
        <div class="list-group-item dish-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${dish.name}</h6>
                    <p class="mb-1 text-success">₹${dish.price}</p>
                    <small class="text-muted">${dish.description}</small>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteDish('${category}', '${dish.name}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteDish(category, dishName) {
    if (confirm(`Are you sure you want to delete ${dishName}?`)) {
        menuData.dishes[category] = menuData.dishes[category].filter(dish => dish.name !== dishName);
        saveData();
        renderCategories();
    }
}

// Table Management
function addTable() {
    const tableNumber = menuData.tables.length + 1;
    menuData.tables.push({
        number: tableNumber,
        qrCode: generateQRCodeUrl(tableNumber)
    });
    saveData();
    renderTables();
}

function renderTables() {
    const tablesList = document.getElementById('tablesList');
    tablesList.innerHTML = '';
    
    menuData.tables.forEach(table => {
        const tableCard = document.createElement('div');
        tableCard.className = 'col-md-3';
        tableCard.innerHTML = `
            <div class="card mb-3">
                <div class="card-body text-center">
                    <h5 class="card-title">Table ${table.number}</h5>
                    <div class="table-qr" id="qr-${table.number}"></div>
                    <button class="btn btn-danger mt-2" onclick="deleteTable(${table.number})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        tablesList.appendChild(tableCard);
        
        // Generate QR Code
        new QRCode(document.getElementById(`qr-${table.number}`), {
            text: table.qrCode,
            width: 128,
            height: 128
        });
    });
}

function deleteTable(tableNumber) {
    if (confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
        menuData.tables = menuData.tables.filter(table => table.number !== tableNumber);
        saveData();
        renderTables();
    }
}

function generateQRCodeUrl(tableNumber) {
    // Use GitHub Pages URL
    return `${getBaseUrl()}/menu.html?table=${tableNumber}`;
}

// QR Code Management
function generateAllQRCodes() {
    alert('To download QR codes:\n1. Right-click on each QR code\n2. Select "Save image as..."\n3. Save it to your computer');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeData); 