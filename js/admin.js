// Global state
let menuData = {
    categories: [],
    dishes: {},
    tables: []
};

// Get GitHub Pages base URL
function getBaseUrl() {
    // Get the repository name from the URL
    const pathArray = window.location.pathname.split('/');
    const repoName = pathArray[1]; // This will be 'hotel-look'
    return `${window.location.protocol}//${window.location.host}/${repoName}`;
}

// Initialize from localStorage if available
function initializeData() {
    try {
        // Try to load data from all possible storage keys
        const keys = ['hotel-look-menu', 'menuData', 'restaurantData'];
        let savedData = null;
        
        for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) {
                console.log(`Found data in ${key}`);
                savedData = data;
                break;
            }
        }
        
        if (savedData) {
            menuData = JSON.parse(savedData);
            console.log('Initialized menu data:', menuData);
        } else {
            console.log('No existing data found, starting fresh');
            menuData = {
                categories: [],
                dishes: {},
                tables: []
            };
        }
        
        // Save to ensure data is in all storage locations
        saveData();
        
        // Render UI
        renderCategories();
        renderTables();
    } catch (error) {
        console.error('Error initializing data:', error);
        menuData = {
            categories: [],
            dishes: {},
            tables: []
        };
        saveData();
    }
}

// Save data to localStorage
function saveData() {
    try {
        const dataToSave = JSON.stringify(menuData);
        
        // Save to all storage keys for compatibility
        const storageKeys = [
            'hotel-look-menu',
            'menuData',
            'restaurantData'
        ];
        
        storageKeys.forEach(key => {
            localStorage.setItem(key, dataToSave);
            console.log(`Saved data to ${key}`);
        });
        
        // Save timestamp
        localStorage.setItem('hotel-look-lastUpdated', new Date().toISOString());
        
        console.log('Data saved successfully:', menuData);
        
        // Force update for other windows/tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'hotel-look-menu',
            newValue: dataToSave,
            url: window.location.href
        }));
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

// Category Management
function showAddCategoryModal() {
    const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    document.getElementById('categoryName').value = '';
    modal.show();
}

function addCategory() {
    try {
        const categoryInput = document.getElementById('categoryName');
        const categoryName = categoryInput.value.trim();
        
        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }
        
        if (menuData.categories.includes(categoryName)) {
            alert('This category already exists');
            return;
        }
        
        menuData.categories.push(categoryName);
        menuData.dishes[categoryName] = [];
        
        saveData();
        renderCategories();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
        modal.hide();
        categoryInput.value = '';
        
        console.log('Category added successfully:', categoryName);
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category. Please try again.');
    }
}

function renderCategories() {
    try {
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = '';
        
        if (!menuData.categories || menuData.categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        No categories added yet. Click "Add Category" to create your first category.
                    </div>
                </div>
            `;
            return;
        }
        
        menuData.categories.forEach(category => {
            const dishCount = menuData.dishes[category] ? menuData.dishes[category].length : 0;
            const categoryCard = document.createElement('div');
            categoryCard.className = 'col-md-4 mb-3';
            categoryCard.innerHTML = `
                <div class="card category-card">
                    <div class="card-body">
                        <h5 class="card-title">${category}</h5>
                        <p class="card-text">${dishCount} dishes</p>
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="showAddDishModal('${category}')">
                                <i class="bi bi-plus-circle"></i> Add Dish
                            </button>
                            <button class="btn btn-danger" onclick="deleteCategory('${category}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div class="list-group list-group-flush">
                        ${renderDishesForCategory(category)}
                    </div>
                </div>
            `;
            categoriesList.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('Error rendering categories:', error);
        alert('Error displaying categories. Please refresh the page.');
    }
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
    // Clear previous form data
    document.getElementById('dishName').value = '';
    document.getElementById('dishPrice').value = '';
    document.getElementById('dishDescription').value = '';
    document.getElementById('dishImage').value = '';
    modal.show();
}

function addDish() {
    try {
        // Get form values
        const name = document.getElementById('dishName').value.trim();
        const price = parseFloat(document.getElementById('dishPrice').value);
        const description = document.getElementById('dishDescription').value.trim();
        const imageUrl = document.getElementById('dishImage').value.trim();

        console.log('Adding dish:', { name, price, description, imageUrl, category: currentCategory });

        // Validate inputs
        if (!name) {
            alert('Please enter a dish name');
            return;
        }
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price');
            return;
        }
        if (!description) {
            alert('Please enter a dish description');
            return;
        }

        // Check if category exists
        if (!currentCategory || !menuData.dishes[currentCategory]) {
            console.error('Invalid category:', currentCategory);
            alert('Error: Invalid category selected');
            return;
        }

        // Check for duplicate dish names in the category
        if (menuData.dishes[currentCategory].some(dish => dish.name === name)) {
            alert('A dish with this name already exists in this category');
            return;
        }

        // Create dish object
        const dish = {
            name,
            price,
            description,
            imageUrl: imageUrl || 'https://via.placeholder.com/300x200'
        };

        // Add dish to menu
        menuData.dishes[currentCategory].push(dish);
        console.log('Updated menu data after adding dish:', menuData);

        // Save and update UI
        saveData();
        renderCategories();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDishModal'));
        modal.hide();

        // Show success message
        alert('Dish added successfully!');

    } catch (error) {
        console.error('Error adding dish:', error);
        alert('Error adding dish. Please try again.');
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
    const baseUrl = getBaseUrl();
    console.log('Generating QR URL with base:', baseUrl);
    return `${baseUrl}/menu.html?table=${tableNumber}`;
}

// QR Code Management
function generateAllQRCodes() {
    alert('To download QR codes:\n1. Right-click on each QR code\n2. Select "Save image as..."\n3. Save it to your computer');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeData); 