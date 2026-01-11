// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
const API_URL = 'https://es-parfumerie-api.onrender.com'; // REMPLACEZ par votre URL si différente

// Fonction pour obtenir l'URL correcte de l'image
function getImageUrl(product) {
    if (!product.image) {
        return 'https://via.placeholder.com/300x250?text=Parfum';
    }
    
    // Si l'image a déjà une URL complète
    if (product.image.startsWith('http')) {
        return product.image;
    }
    
    // Si l'image commence par /uploads/
    if (product.image.startsWith('/uploads/')) {
        return `${API_URL}${product.image}`;
    }
    
    // Si c'est juste un nom de fichier
    return `${API_URL}/uploads/${product.image}`;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    setupEventListeners();
});

// Charger les produits depuis l'API
async function loadProducts() {
    try {
        const container = document.getElementById('products-container');
        container.innerHTML = '<div class="loading">Chargement des produits...</div>';
        
        const response = await fetch(`${API_URL}/api/products`);
        
        if (!response.ok) {
            throw new Error('Erreur de chargement des produits');
        }
        
        products = await response.json();
        displayProducts(products);
        
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('products-container').innerHTML = 
            '<div class="error">Impossible de charger les produits. Veuillez réessayer plus tard.</div>';
    }
}

// Afficher les produits
function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="loading">Aucun produit disponible pour le moment.</div>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        const imageUrl = getImageUrl(product);
        const stock = product.stock || 0;
        const price = product.price || 0;
        const description = product.description || 'Description non disponible';
        
        return `
            <div class="product-card">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     class="product-img"
                     onerror="this.src='https://via.placeholder.com/300x250?text=Parfum'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${price}€</p>
                    <p class="product-description">${description}</p>
                    <div class="product-stock">
                        <span class="stock-badge ${stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${stock > 0 ? `${stock} en stock` : 'Rupture de stock'}
                        </span>
                    </div>
                    ${stock > 0 ? `
                        <button class="btn add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Ajouter au panier
                        </button>
                    ` : `
                        <button class="btn btn-disabled" disabled>
                            <i class="fas fa-times-circle"></i> Indisponible
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
    
    // Ajouter les événements aux boutons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Ajouter du CSS pour les badges de stock
    const style = document.createElement('style');
    style.textContent = `
        .product-stock {
            margin: 10px 0;
        }
        .stock-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .stock-badge.in-stock {
            background-color: #d4edda;
            color: #155724;
        }
        .stock-badge.out-of-stock {
            background-color: #f8d7da;
            color: #721c24;
        }
        .btn-disabled {
            background-color: #ccc !important;
            cursor: not-allowed !important;
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
}

// Gestion du panier
function addToCart(event) {
    const productId = event.target.closest('.add-to-cart').getAttribute('data-id');
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Produit non trouvé', 'error');
        return;
    }
    
    // Vérifier le stock
    const stock = product.stock || 0;
    if (stock <= 0) {
        showNotification('Produit en rupture de stock', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        // Vérifier si on dépasse le stock disponible
        if (existingItem.quantity >= stock) {
            showNotification('Stock insuffisant', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            image: getImageUrl(product),
            stock: stock,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification('Produit ajouté au panier !', 'success');
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartModal();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Modal panier
function setupEventListeners() {
    // Ouvrir modal panier
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCartModal);
    }
    
    // Fermer modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCartModal);
    }
    
    // Fermer en cliquant en dehors
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cart-modal');
        if (event.target === modal) {
            closeCartModal();
        }
    });
    
    // Bouton commander
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}

function openCartModal() {
    updateCartModal();
    document.getElementById('cart-modal').style.display = 'block';
}

function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}

function updateCartModal() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    if (!container || !totalElement) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Votre panier est vide</p></div>';
        totalElement.textContent = '0';
        return;
    }
    
    container.innerHTML = cart.map(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/50'}" 
                         alt="${item.name}"
                         onerror="this.src='https://via.placeholder.com/50'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${item.price}€ × ${item.quantity} = ${itemTotal}€</p>
                    <div class="cart-item-actions">
                        <button class="btn-quantity" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn-quantity" onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = total.toFixed(2);
    
    // Ajouter du CSS pour le panier
    const style = document.createElement('style');
    style.textContent = `
        .empty-cart {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        .empty-cart i {
            font-size: 48px;
            margin-bottom: 15px;
            color: #ccc;
        }
        .cart-item {
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
        }
        .cart-item-image {
            width: 60px;
            height: 60px;
            margin-right: 15px;
        }
        .cart-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
        }
        .cart-item-details {
            flex: 1;
        }
        .cart-item-details h4 {
            margin: 0 0 5px 0;
            font-size: 16px;
        }
        .cart-item-price {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
        }
        .cart-item-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .btn-quantity {
            width: 30px;
            height: 30px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-quantity:hover {
            background: #f5f5f5;
        }
        .quantity {
            min-width: 30px;
            text-align: center;
            font-weight: bold;
        }
        .btn-remove {
            background: none;
            border: none;
            color: #ff4757;
            cursor: pointer;
            padding: 5px;
            font-size: 16px;
        }
        .btn-remove:hover {
            color: #ff3838;
        }
    `;
    document.head.appendChild(style);
}

function changeQuantity(productId, change) {
    const item = cart.find(item => item.id == productId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    // Vérifier le stock
    const product = products.find(p => p.id == productId);
    if (product && product.stock && newQuantity > product.stock) {
        showNotification(`Stock insuffisant. Maximum: ${product.stock}`, 'error');
        return;
    }
    
    item.quantity = newQuantity;
    updateCart();
}

function removeFromCart(productId) {
    if (!confirm('Retirer ce produit du panier ?')) return;
    
    cart = cart.filter(item => item.id != productId);
    updateCart();
    showNotification('Produit retiré du panier', 'success');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide !', 'error');
        return;
    }
    
    // Pour l'instant, juste une alerte
    // Plus tard, connectez ceci à votre API de commandes
    alert('Fonctionnalité de commande à venir !\n\nTotal: ' + 
          cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2) + '€\n' +
          'Nombre d\'articles: ' + cart.reduce((sum, item) => sum + item.quantity, 0));
}

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#ff4757'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        max-width: 350px;
    `;
    
    // Ajouter les animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Recherche de produits (optionnel)
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
            displayProducts(filteredProducts);
        });
    }
}

// Filtrage par catégorie (optionnel)
function setupCategoryFilter() {
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', function(e) {
            const selectedCategory = e.target.value;
            if (!selectedCategory) {
                displayProducts(products);
                return;
            }
            
            const filteredProducts = products.filter(product => 
                product.category === selectedCategory
            );
            displayProducts(filteredProducts);
        });
    }
}

// Initialiser les fonctionnalités supplémentaires
document.addEventListener('DOMContentLoaded', function() {
    setupSearch();
    setupCategoryFilter();
});

// Service Worker pour PWA (optionnel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}
