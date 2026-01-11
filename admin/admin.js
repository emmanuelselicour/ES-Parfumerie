// Admin Panel JavaScript

// Simuler une connexion admin (à remplacer par une vraie authentification)
const isAdminLoggedIn = true; // À remplacer par vérification de session

if (!isAdminLoggedIn) {
    window.location.href = '../index.html';
}

// Navigation entre sections
const sidebarLinks = document.querySelectorAll('.sidebar a');
const sections = document.querySelectorAll('.section');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        
        // Mettre à jour la navigation
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Afficher la section correspondante
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
    });
});

// Gestion des produits (simulation)
let produitsAdmin = [
    {
        id: 1,
        nom: "Parfum Élégance",
        description: "Un parfum sophistiqué aux notes florales",
        prix: 89.99,
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
        categorie: "feminin"
    },
    {
        id: 2,
        nom: "Essence Royale",
        description: "Notes boisées pour un charme intense",
        prix: 129.99,
        image: "https://images.unsplash.com/photo-1590736969955-0126f7e1e88d?w=400",
        categorie: "masculin"
    },
    {
        id: 3,
        nom: "Mystère Oriental",
        description: "Un mélange exotique d'épices et de fleurs",
        prix: 109.99,
        image: "https://images.unsplash.com/photo-1590738900553-9c0e5b2e7b6c?w=400",
        categorie: "unisexe"
    }
];

// Charger les produits dans le tableau
function chargerProduitsAdmin() {
    const tbody = document.getElementById('produits-list');
    tbody.innerHTML = '';
    
    produitsAdmin.forEach(produit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${produit.image}" alt="${produit.nom}" class="produit-img">
            </td>
            <td>${produit.nom}</td>
            <td>${produit.description.substring(0, 50)}...</td>
            <td>${produit.prix.toFixed(2)}€</td>
            <td>
                <button class="btn-action btn-edit" onclick="editerProduit(${produit.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-action btn-delete" onclick="supprimerProduit(${produit.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Ajouter un produit
document.getElementById('ajouter-produit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nom = document.getElementById('nom').value;
    const description = document.getElementById('description').value;
    const prix = parseFloat(document.getElementById('prix').value);
    const image = document.getElementById('image').value;
    const categorie = document.getElementById('categorie').value;
    
    const nouveauProduit = {
        id: Date.now(), // ID temporaire
        nom,
        description,
        prix,
        image,
        categorie
    };
    
    // Ajouter le produit (simulation)
    produitsAdmin.push(nouveauProduit);
    
    // En production: envoyer à l'API
    // fetch(`${API_URL}/produits`, {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify(nouveauProduit)
    // });
    
    alert('Produit ajouté avec succès !');
    
    // Réinitialiser le formulaire
    e.target.reset();
    document.getElementById('image-preview').innerHTML = '<p>Aperçu de l\'image apparaîtra ici</p>';
    
    // Recharger la liste
    chargerProduitsAdmin();
    
    // Revenir à la liste des produits
    document.querySelector('a[href="#produits"]').click();
});

// Aperçu de l'image
document.getElementById('image').addEventListener('input', (e) => {
    const preview = document.getElementById('image-preview');
    const url = e.target.value;
    
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="Aperçu" onerror="this.style.display='none'; preview.innerHTML='<p>Image non disponible</p>';">`;
    } else {
        preview.innerHTML = '<p>Aperçu de l\'image apparaîtra ici</p>';
    }
});

// Éditer un produit (simplifié)
function editerProduit(id) {
    const produit = produitsAdmin.find(p => p.id === id);
    if (!produit) return;
    
    alert(`Édition du produit: ${produit.nom}\n\nÀ implémenter avec le backend complet.`);
    // Ouvrir un formulaire d'édition avec les données pré-remplies
}

// Supprimer un produit
function supprimerProduit(id) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
        produitsAdmin = produitsAdmin.filter(p => p.id !== id);
        chargerProduitsAdmin();
        
        // En production: appel API DELETE
        // fetch(`${API_URL}/produits/${id}`, {method: 'DELETE'});
    }
}

// Déconnexion
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Se déconnecter ?')) {
        // En production: effacer le token/session
        window.location.href = '../index.html';
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    chargerProduitsAdmin();
});
