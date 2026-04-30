// ========================================
// CalCount - Script JavaScript Complet
// ========================================

// 🗄️ GESTION DU STOCKAGE

function chargerAliments() {
    const aliments = localStorage.getItem('aliments');
    return aliments ? JSON.parse(aliments) : [];
}

function sauvegarderAliments(aliments) {
    localStorage.setItem('aliments', JSON.stringify(aliments));
}

function chargerRepasParCategorie() {
    const aujourdhui = new Date().toDateString();
    const cle = `repas_${aujourdhui}`;
    const repas = localStorage.getItem(cle);
    return repas ? JSON.parse(repas) : {
        Breakfast: [],
        Lunch: [],
        Snacks: [],
        Dinner: []
    };
}

function sauvegarderRepasParCategorie(repas) {
    const aujourdhui = new Date().toDateString();
    const cle = `repas_${aujourdhui}`;
    localStorage.setItem(cle, JSON.stringify(repas));
}

// 📑 GESTION DES ONGLETS

function changerOnglet(onglet) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activer l'onglet sélectionné
    event.target.classList.add('active');
    document.getElementById('tab-' + onglet).classList.add('active');
}

// 🥗 GESTION DES ALIMENTS

function ajouterAliment() {
    const nom = document.getElementById('nom-aliment').value.trim();
    const calories = parseFloat(document.getElementById('calories-aliment').value);
    const proteines = parseFloat(document.getElementById('proteines-aliment').value);
    const glucides = parseFloat(document.getElementById('glucides-aliment').value);
    const lipides = parseFloat(document.getElementById('lipides-aliment').value);

    if (!nom || isNaN(calories) || isNaN(proteines) || isNaN(glucides) || isNaN(lipides)) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    const aliment = {
        id: Date.now(),
        nom: nom,
        calories: calories,
        proteines: proteines,
        glucides: glucides,
        lipides: lipides
    };

    let aliments = chargerAliments();
    aliments.push(aliment);
    sauvegarderAliments(aliments);

    // Réinitialiser le formulaire
    document.getElementById('nom-aliment').value = '';
    document.getElementById('calories-aliment').value = '';
    document.getElementById('proteines-aliment').value = '';
    document.getElementById('glucides-aliment').value = '';
    document.getElementById('lipides-aliment').value = '';

    afficherAliments();
    mettreAJourSelectAliments();
}

function supprimerAliment(id) {
    if (confirm('Supprimer cet aliment ?')) {
        let aliments = chargerAliments();
        aliments = aliments.filter(a => a.id !== id);
        sauvegarderAliments(aliments);
        afficherAliments();
        mettreAJourSelectAliments();
    }
}

function afficherAliments() {
    const aliments = chargerAliments();
    const liste = document.getElementById('liste-aliments');

    if (aliments.length === 0) {
        liste.innerHTML = '<div class="empty-state"><p>Aucun aliment enregistré</p></div>';
        return;
    }

    liste.innerHTML = aliments.map(aliment => `
        <div class="item">
            <div class="item-header">
                <div class="item-nom">${aliment.nom}</div>
                <button class="btn-delete" onclick="supprimerAliment(${aliment.id})">🗑️</button>
            </div>
            <div style="font-size: 0.85em; color: #666; margin-bottom: 10px;">
                Pour 100g :
            </div>
            <div class="item-macros">
                <div class="macro">
                    <div class="macro-label">Calories</div>
                    <div class="macro-value">${aliment.calories}</div>
                </div>
                <div class="macro">
                    <div class="macro-label">Protéines</div>
                    <div class="macro-value">${aliment.proteines}g</div>
                </div>
                <div class="macro">
                    <div class="macro-label">Glucides</div>
                    <div class="macro-value">${aliment.glucides}g</div>
                </div>
                <div class="macro">
                    <div class="macro-label">Lipides</div>
                    <div class="macro-value">${aliment.lipides}g</div>
                </div>
            </div>
        </div>
    `).join('');
}

function mettreAJourSelectAliments() {
    const aliments = chargerAliments();
    const select = document.getElementById('select-aliment');
    
    if (select) {
        select.innerHTML = '<option value="">Sélectionner...</option>' + 
            aliments.map(aliment => 
                `<option value="${aliment.id}">${aliment.nom}</option>`
            ).join('');
    }
}

// 🍽️ GESTION DES REPAS PAR CATÉGORIE

let alimentsTemporaires = [];
let categorieRepasActuelle = '';
let iconeRepasActuelle = '';

function ouvrirModalRepas(categorie, icone) {
    categorieRepasActuelle = categorie;
    iconeRepasActuelle = icone;
    
    document.getElementById('modal-titre').textContent = `${icone} ${categorie}`;
    document.getElementById('modal-repas').classList.add('active');
    
    alimentsTemporaires = [];
    afficherAlimentsTemporairesModal();
    mettreAJourSelectAlimentsModal();
    
    // Focus sur le select
    setTimeout(() => {
        document.getElementById('select-aliment-modal').focus();
    }, 100);
}

function fermerModalRepas() {
    // Sauvegarder automatiquement avant de fermer
    if (alimentsTemporaires.length > 0) {
        sauvegarderRepasModal();
    }
    
    document.getElementById('modal-repas').classList.remove('active');
    alimentsTemporaires = [];
    document.getElementById('select-aliment-modal').value = '';
    document.getElementById('quantite-aliment-modal').value = '';
}

function mettreAJourSelectAlimentsModal() {
    const aliments = chargerAliments();
    const select = document.getElementById('select-aliment-modal');
    
    select.innerHTML = '<option value="">Sélectionner...</option>' + 
        aliments.map(aliment => 
            `<option value="${aliment.id}">${aliment.nom}</option>`
        ).join('');
}

function ajouterAlimentAuRepasModal() {
    const alimentId = parseInt(document.getElementById('select-aliment-modal').value);
    const quantiteInput = document.getElementById('quantite-aliment-modal');
    const quantite = parseFloat(quantiteInput.value) || 100; // Par défaut 100g

    if (!alimentId) {
        return; // Ne rien faire si aucun aliment n'est sélectionné
    }

    const aliments = chargerAliments();
    const aliment = aliments.find(a => a.id === alimentId);

    if (!aliment) return;

    const ratio = quantite / 100;
    const nouvelAliment = {
        id: Date.now(),
        alimentId: aliment.id,
        nom: aliment.nom,
        quantite: quantite,
        calories: aliment.calories * ratio,
        proteines: aliment.proteines * ratio,
        glucides: aliment.glucides * ratio,
        lipides: aliment.lipides * ratio
    };

    alimentsTemporaires.push(nouvelAliment);

    // Sauvegarder immédiatement dans la catégorie
    sauvegarderAlimentDansCategorie(nouvelAliment);

    afficherAlimentsTemporairesModal();
    
    // Réinitialiser les champs
    document.getElementById('select-aliment-modal').value = '';
    document.getElementById('quantite-aliment-modal').value = '';
    
    // Refocus sur le select pour ajouter un autre aliment
    document.getElementById('select-aliment-modal').focus();
}

function sauvegarderAlimentDansCategorie(aliment) {
    // Charger les repas existants
    let repasParCategorie = chargerRepasParCategorie();
    
    // Initialiser la catégorie si elle n'existe pas
    if (!repasParCategorie[categorieRepasActuelle]) {
        repasParCategorie[categorieRepasActuelle] = [];
    }

    // Ajouter l'aliment à la catégorie
    repasParCategorie[categorieRepasActuelle].push({
        ...aliment,
        date: new Date().toISOString()
    });

    // Sauvegarder
    sauvegarderRepasParCategorie(repasParCategorie);
    
    // Mettre à jour l'affichage
    afficherTousLesRepas();
    calculerTotaux();
}

function afficherAlimentsTemporairesModal() {
    const container = document.getElementById('aliments-repas-modal');
    
    if (alimentsTemporaires.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 20px;"><p style="font-size: 0.9em; color: #86868b;">Sélectionnez un aliment pour commencer</p></div>';
        return;
    }

    const totaux = {
        calories: alimentsTemporaires.reduce((sum, a) => sum + a.calories, 0),
        proteines: alimentsTemporaires.reduce((sum, a) => sum + a.proteines, 0),
        glucides: alimentsTemporaires.reduce((sum, a) => sum + a.glucides, 0),
        lipides: alimentsTemporaires.reduce((sum, a) => sum + a.lipides, 0)
    };

    container.innerHTML = `
        <div style="margin-bottom: 15px; padding: 15px; background: #f5f5f7; border-radius: 10px;">
            <strong style="font-size: 0.95em; color: #1d1d1f;">Aliments ajoutés :</strong>
            ${alimentsTemporaires.map((aliment, index) => `
                <div class="repas-aliment-item" style="margin-top: 8px;">
                    <span style="color: #1d1d1f;">${aliment.nom} (${aliment.quantite}g)</span>
                    <button class="btn-delete" onclick="retirerAlimentTemporaireModal(${index})" style="padding: 5px 10px; font-size: 0.8em; width: auto;">✕</button>
                </div>
            `).join('')}
            
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #d2d2d7; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 0.85em;">
                <div style="text-align: center;">
                    <div style="color: #86868b; font-size: 0.8em;">Cal</div>
                    <div style="font-weight: 600; color: #1d1d1f;">${totaux.calories.toFixed(0)}</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #86868b; font-size: 0.8em;">P</div>
                    <div style="font-weight: 600; color: #1d1d1f;">${totaux.proteines.toFixed(1)}g</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #86868b; font-size: 0.8em;">G</div>
                    <div style="font-weight: 600; color: #1d1d1f;">${totaux.glucides.toFixed(1)}g</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #86868b; font-size: 0.8em;">L</div>
                    <div style="font-weight: 600; color: #1d1d1f;">${totaux.lipides.toFixed(1)}g</div>
                </div>
            </div>
        </div>
    `;
}

function retirerAlimentTemporaireModal(index) {
    const alimentSupprime = alimentsTemporaires[index];
    
    // Retirer de la liste temporaire
    alimentsTemporaires.splice(index, 1);
    
    // Retirer aussi de la catégorie sauvegardée
    let repasParCategorie = chargerRepasParCategorie();
    if (repasParCategorie[categorieRepasActuelle]) {
        repasParCategorie[categorieRepasActuelle] = repasParCategorie[categorieRepasActuelle].filter(
            a => a.id !== alimentSupprime.id
        );
        sauvegarderRepasParCategorie(repasParCategorie);
    }
    
    afficherAlimentsTemporairesModal();
    afficherTousLesRepas();
    calculerTotaux();
}

function sauvegarderRepasModal() {
    // Cette fonction est maintenant appelée uniquement à la fermeture
    // Les aliments sont déjà sauvegardés individuellement
    alimentsTemporaires = [];
}

function supprimerAlimentRepas(categorie, alimentId) {
    if (confirm('Supprimer cet aliment ?')) {
        let repasParCategorie = chargerRepasParCategorie();
        repasParCategorie[categorie] = repasParCategorie[categorie].filter(a => a.id !== alimentId);
        sauvegarderRepasParCategorie(repasParCategorie);
        afficherTousLesRepas();
        calculerTotaux();
    }
}

function afficherTousLesRepas() {
    const repasParCategorie = chargerRepasParCategorie();
    const categories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    
    categories.forEach(categorie => {
        afficherRepasCategorie(categorie, repasParCategorie[categorie] || []);
    });
}

function afficherRepasCategorie(categorie, aliments) {
    const containerId = `repas-${categorie.toLowerCase()}`;
    const countId = `count-${categorie.toLowerCase()}`;
    const container = document.getElementById(containerId);
    const countElement = document.getElementById(countId);
    
    // Mettre à jour le compteur
    const nbAliments = aliments.length;
    countElement.textContent = `${nbAliments} aliment${nbAliments > 1 ? 's' : ''}`;
    
    if (aliments.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Calculer les totaux de la catégorie
    const totaux = {
        calories: aliments.reduce((sum, a) => sum + a.calories, 0),
        proteines: aliments.reduce((sum, a) => sum + a.proteines, 0),
        glucides: aliments.reduce((sum, a) => sum + a.glucides, 0),
        lipides: aliments.reduce((sum, a) => sum + a.lipides, 0)
    };

    container.innerHTML = `
        ${aliments.map(aliment => `
            <div class="meal-item">
                <div class="meal-item-info">
                    <div class="meal-item-name">${aliment.nom}</div>
                    <div class="meal-item-quantity">${aliment.quantite}g</div>
                </div>
                <div class="meal-item-macros">
                    <div class="meal-item-macro">
                        <div class="meal-item-macro-label">Cal</div>
                        <div class="meal-item-macro-value">${aliment.calories.toFixed(0)}</div>
                    </div>
                    <div class="meal-item-macro">
                        <div class="meal-item-macro-label">P</div>
                        <div class="meal-item-macro-value">${aliment.proteines.toFixed(1)}g</div>
                    </div>
                    <div class="meal-item-macro">
                        <div class="meal-item-macro-label">G</div>
                        <div class="meal-item-macro-value">${aliment.glucides.toFixed(1)}g</div>
                    </div>
                    <div class="meal-item-macro">
                        <div class="meal-item-macro-label">L</div>
                        <div class="meal-item-macro-value">${aliment.lipides.toFixed(1)}g</div>
                    </div>
                </div>
                <button class="btn-delete" onclick="supprimerAlimentRepas('${categorie}', ${aliment.id})">🗑️</button>
            </div>
        `).join('')}
        
        <div class="meal-totals">
            <div class="meal-total-item">
                <div class="meal-total-label">Calories</div>
                <div class="meal-total-value">${totaux.calories.toFixed(0)}</div>
            </div>
            <div class="meal-total-item">
                <div class="meal-total-label">Protéines</div>
                <div class="meal-total-value">${totaux.proteines.toFixed(1)}g</div>
            </div>
            <div class="meal-total-item">
                <div class="meal-total-label">Glucides</div>
                <div class="meal-total-value">${totaux.glucides.toFixed(1)}g</div>
            </div>
            <div class="meal-total-item">
                <div class="meal-total-label">Lipides</div>
                <div class="meal-total-value">${totaux.lipides.toFixed(1)}g</div>
            </div>
        </div>
    `;
}

function calculerTotaux() {
    const repasParCategorie = chargerRepasParCategorie();
    
    let totalCalories = 0;
    let totalProteines = 0;
    let totalGlucides = 0;
    let totalLipides = 0;

    Object.values(repasParCategorie).forEach(aliments => {
        aliments.forEach(aliment => {
            totalCalories += aliment.calories;
            totalProteines += aliment.proteines;
            totalGlucides += aliment.glucides;
            totalLipides += aliment.lipides;
        });
    });

    document.getElementById('total-calories').textContent = totalCalories.toFixed(0);
    document.getElementById('total-proteines').textContent = totalProteines.toFixed(1);
    document.getElementById('total-glucides').textContent = totalGlucides.toFixed(1);
    document.getElementById('total-lipides').textContent = totalLipides.toFixed(1);
}

// 🔄 Charger les aliments depuis data.json au premier lancement

async function chargerAlimentsDepuisJSON() {
    // Vérifier si des aliments existent déjà
    const alimentsExistants = chargerAliments();
    
    if (alimentsExistants.length > 0) {
        console.log('✅ Aliments déjà chargés');
        return;
    }

    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error('Fichier data.json introuvable');
        }
        
        const data = await response.json();
        
        // Sauvegarder dans LocalStorage
        sauvegarderAliments(data.aliments);
        
        console.log('✅ Aliments chargés depuis data.json');
        afficherAliments();
        mettreAJourSelectAliments();
    } catch (error) {
        console.error('❌ Erreur de chargement:', error);
        console.log('ℹ️ Assurez-vous que data.json est dans le même dossier que index.html');
    }
}

// Fermer la modal en cliquant en dehors
window.onclick = function(event) {
    const modal = document.getElementById('modal-repas');
    if (event.target === modal) {
        fermerModalRepas();
    }
}

// 🚀 INITIALISATION

window.onload = async function() {
    await chargerAlimentsDepuisJSON();
    afficherAliments();
    mettreAJourSelectAliments();
    afficherTousLesRepas();
    calculerTotaux();
};
