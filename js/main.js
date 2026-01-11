// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

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
        
        // Remplacer par votre URL d'API Render quand elle sera disponible
        const response = await fetch('https://votre-api.onrender.com/api/products');
        
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
    
    if (products.length === 0) {
        container.innerHTML = '<div class="loading">Aucun produit disponible pour le moment.</div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image || 'https://via.placeholder.com/300x250?text=Parfum'}" 
                 alt="${product.name}" 
                 class="product-img">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">${product.price}€</p>
                <p class="product-description">${product.description || 'Description non disponible'}</p>
                <button class="btn add-to-cart" data-id="${product.id}">
                    Ajouter au panier
                </button>
            </div>
        </div>
    `).join('');
    
    // Ajouter les événements aux boutons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Gestion du panier
function addToCart(event) {
    const productId = event.target.getAttribute('data-id');
    const product = products.find(p => p.id == productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification('Produit ajouté au panier !');
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
    document.querySelector('.cart-icon').addEventListener('click', openCartModal);
    
    // Fermer modal
    document.querySelector('.close').addEventListener('click', closeCartModal);
    
    // Fermer en cliquant en dehors
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cart-modal');
        if (event.target === modal) {
            closeCartModal();
        }
    });
    
    // Bouton commander
    document.getElementById('checkout-btn').addEventListener('click', checkout);
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
    
    if (cart.length === 0) {
        container.innerHTML = '<p>Votre panier est vide</p>';
        totalElement.textContent = '0';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.name}</h4>
                <p>${item.price}€ × ${item.quantity}</p>
            </div>
            <div>
                <button class="btn-remove" data-id="${item.id}">Supprimer</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = total.toFixed(2);
    
    // Ajouter événements aux boutons supprimer
    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
}

function removeFromCart(event) {
    const productId = event.target.getAttribute('data-id');
    cart = cart.filter(item => item.id != productId);
    updateCart();
}

function checkout() {
    if (cart.length === 0) {
        alert('Votre panier est vide !');
        return;
    }
    
    alert('Fonctionnalité de commande à implémenter avec le backend');
    // Ici vous ajouterez l'appel à votre API pour créer une commande
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1002;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Service Worker pour PWA (optionnel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
