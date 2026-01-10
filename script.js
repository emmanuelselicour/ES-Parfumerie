// Variables globales
let panier = JSON.parse(localStorage.getItem('panier')) || [];
let produits = [];

// DOM Elements
const produitsContainer = document.getElementById('produits-container');
const cartModal = document.getElementById('panier-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');
const cartBtn = document.querySelector('.cart-btn');
const closeModal = document.querySelector('.close-modal');
const checkoutBtn = document.getElementById('checkout-btn');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// API Configuration (à remplacer par ton URL backend)
const API_URL = 'https://ton-api.com/api'; // À MODIFIER

// Événements
document.addEventListener('DOMContentLoaded', () => {
    chargerProduits();
    mettreAJourPanier();
    
    // Événements pour le panier
    cartBtn.addEventListener('click', () => {
        cartModal.style.display = 'block';
        afficherPanier();
    });
    
    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    checkoutBtn.addEventListener('click', commander);
    
    // Menu mobile
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});

// Charger les produits depuis l'API
async function chargerProduits() {
    try {
        // Simulation de données (remplacer par appel API)
        produits = [
            {
                id: 1,
                nom: "Parfum Élégance",
                description: "Un parfum sophistiqué aux notes florales",
                prix: 89.99,
                image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400"
            },
            {
                id: 2,
                nom: "Essence Royale",
                description: "Notes boisées pour un charme intense",
                prix: 129.99,
                image: "https://images.unsplash.com/photo-1590736969955-0126f7e1e88d?w-400"
            },
            {
                id: 3,
                nom: "Mystère Oriental",
                description: "Un mélange exotique d'épices et de fleurs",
                prix: 109.99,
                image: "https://images.unsplash.com/photo-1590738900553-9c0e5b2e7b6c?w=400"
            }
        ];
        
        afficherProduits(produits);
        
        // Pour la version avec API réelle :
        // const response = await fetch(`${API_URL}/produits`);
        // produits = await response.json();
        // afficherProduits(produits);
        
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        produitsContainer.innerHTML = '<p class="error">Erreur de chargement des produits</p>';
    }
}

// Afficher les produits
function afficherProduits(produitsList) {
    produitsContainer.innerHTML = '';
    
    produitsList.forEach(produit => {
        const produitCard = document.createElement('div');
        produitCard.className = 'produit-card';
        produitCard.innerHTML = `
            <img src="${produit.image}" alt="${produit.nom}" class="produit-image">
            <div class="produit-info">
                <h3 class="produit-titre">${produit.nom}</h3>
                <p class="produit-description">${produit.description}</p>
                <p class="produit-prix">${produit.prix.toFixed(2)}€</p>
                <button class="add-to-cart" onclick="ajouterAuPanier(${produit.id})">
                    Ajouter au panier
                </button>
            </div>
        `;
        produitsContainer.appendChild(produitCard);
    });
}

// Gestion du panier
function ajouterAuPanier(produitId) {
    const produit = produits.find(p => p.id === produitId);
    if (!produit) return;
    
    const itemExist = panier.find(item => item.id === produitId);
    
    if (itemExist) {
        itemExist.quantite += 1;
    } else {
        panier.push({
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            quantite: 1,
            image: produit.image
        });
    }
    
    sauvegarderPanier();
    mettreAJourPanier();
    
    // Feedback visuel
    const btn = event.target;
    btn.textContent = 'Ajouté !';
    btn.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
        btn.textContent = 'Ajouter au panier';
        btn.style.backgroundColor = '';
    }, 1000);
}

function retirerDuPanier(produitId) {
    panier = panier.filter(item => item.id !== produitId);
    sauvegarderPanier();
    mettreAJourPanier();
    afficherPanier();
}

function modifierQuantite(produitId, changement) {
    const item = panier.find(item => item.id === produitId);
    if (!item) return;
    
    item.quantite += changement;
    
    if (item.quantite <= 0) {
        retirerDuPanier(produitId);
    } else {
        sauvegarderPanier();
        mettreAJourPanier();
        afficherPanier();
    }
}

function afficherPanier() {
    if (panier.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        return;
    }
    
    cartItems.innerHTML = panier.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.nom}</h4>
                <p class="cart-item-price">${item.prix.toFixed(2)}€</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="modifierQuantite(${item.id}, -1)">-</button>
                <span>${item.quantite}</span>
                <button class="quantity-btn" onclick="modifierQuantite(${item.id}, 1)">+</button>
                <button class="btn-remove" onclick="retirerDuPanier(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    calculerTotal();
}

function calculerTotal() {
    const total = panier.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    cartTotal.textContent = total.toFixed(2);
}

function mettreAJourPanier() {
    const totalItems = panier.reduce((sum, item) => sum + item.quantite, 0);
    cartCount.textContent = totalItems;
}

function sauvegarderPanier() {
    localStorage.setItem('panier', JSON.stringify(panier));
}

function commander() {
    if (panier.length === 0) {
        alert('Votre panier est vide !');
        return;
    }
    
    alert(`Commande passée ! Total: ${panier.reduce((sum, item) => sum + (item.prix * item.quantite), 0).toFixed(2)}€\n\nNote: Ceci est une démo. Pour une vraie commande, connectez le backend.`);
    
    // En production: envoyer la commande à l'API
    panier = [];
    sauvegarderPanier();
    mettreAJourPanier();
    afficherPanier();
    cartModal.style.display = 'none';
}
