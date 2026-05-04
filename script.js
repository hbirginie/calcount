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

function chargerObjectifCalories() {
    const objectif = localStorage.getItem('objectif_calories');
    const valeur = objectif ? parseFloat(objectif) : 3000;
    return Number.isFinite(valeur) && valeur > 0 ? valeur : 3000;
}

function mettreAJourBarreCalories(totalCalories) {
    const objectifCalories = chargerObjectifCalories();
    const progression = Math.min((totalCalories / objectifCalories) * 100, 100);
    
    const texte = document.getElementById('calorie-progress-text');
    const barre = document.getElementById('calorie-progress-fill');
    
    if (texte) {
        texte.textContent = `${totalCalories.toFixed(0)} / ${objectifCalories.toFixed(0)} kcal`;
    }
    
    if (barre) {
        barre.style.width = `${progression}%`;
        
        if (progression >= 100) {
            barre.style.background = 'linear-gradient(90deg, #ff3b30 0%, #ff453a 100%)';
        } else if (progression >= 80) {
            barre.style.background = 'linear-gradient(90deg, #ff9500 0%, #ff9f0a 100%)';
        } else {
            barre.style.background = 'linear-gradient(90deg, #34c759 0%, #30d158 100%)';
        }
    }
}

function mettreAJourCompteurs() {
    const repasParCategorie = chargerRepasParCategorie();
    
    Object.keys(repasParCategorie).forEach(categorie => {
        const nombreAliments = repasParCategorie[categorie].length;
        const categorieId = categorie.toLowerCase();
        const compteur = document.getElementById(`count-${categorieId}`);
        
        if (compteur) {
            compteur.textContent = `${nombreAliments} aliment${nombreAliments > 1 ? 's' : ''}`;
        }
    });
}

let categorieRepasActuelle = '';
let iconeRepasActuelle = '';
let alimentsTemporaires = [];

function ouvrirModalRepas(categorie, icone) {
    categorieRepasActuelle = categorie;
    iconeRepasActuelle = icone;
    
    document.getElementById('modal-titre').textContent = `${icone} ${categorie}`;
    document.getElementById('modal-repas').classList.add('active');
    
    const repasParCategorie = chargerRepasParCategorie();
    alimentsTemporaires = repasParCategorie[categorieRepasActuelle] || [];
    
    document.getElementById('select-aliment-modal').value = '';
    document.getElementById('quantite-aliment-modal').value = '';
    
    mettreAJourSelectAlimentsModal();
    afficherAlimentsModal();
    
    setTimeout(() => {
        document.getElementById('select-aliment-modal').focus();
    }, 100);
}

function fermerModalRepas() {
    document.getElementById('modal-repas').classList.remove('active');
    alimentsTemporaires = [];
    mettreAJourCompteurs();
}

function mettreAJourSelectAlimentsModal() {
    const aliments = chargerAliments();
    const select = document.getElementById('select-aliment-modal');
    
    select.innerHTML = '<option value="">Sélectionner un aliment...</option>' + 
        aliments.map(aliment => 
            `<option value="${aliment.id}">${aliment.nom}</option>`
        ).join('');
}

function ajouterAlimentAuRepasModal() {
    const alimentId = parseInt(document.getElementById('select-aliment-modal').value);
    const quantiteInput = document.getElementById('quantite-aliment-modal');
    const quantite = parseFloat(quantiteInput.value);

    if (!alimentId) {
        alert('⚠️ Veuillez sélectionner un aliment');
        document.getElementById('select-aliment-modal').focus();
        return;
    }

    if (!quantiteInput.value || isNaN(quantite) || quantite <= 0) {
        alert('⚠️ Veuillez entrer une quantité valide en grammes');
        quantiteInput.focus();
        return;
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
    
    let repasParCategorie = chargerRepasParCategorie();
    if (!repasParCategorie[categorieRepasActuelle]) {
        repasParCategorie[categorieRepasActuelle] = [];
    }
    repasParCategorie[categorieRepasActuelle].push({
        ...nouvelAliment,
        date: new Date().toISOString()
    });
    sauvegarderRepasParCategorie(repasParCategorie);
    
    afficherAlimentsModal();
    calculerTotaux();
    
    document.getElementById('select-aliment-modal').value = '';
    document.getElementById('quantite-aliment-modal').value = '';
    document.getElementById('select-aliment-modal').focus();
}

function afficherAlimentsModal() {
    const container = document.getElementById('aliments-modal-liste');
    
    if (alimentsTemporaires.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = alimentsTemporaires.map(aliment => `
        <div class="aliment-modal-item">
            <div class="aliment-modal-info">
                <div class="aliment-modal-nom">${aliment.nom}</div>
                <div class="aliment-modal-quantite">${aliment.quantite}g</div>
            </div>
            <button class="btn-delete-modal" onclick="supprimerAlimentModal(${aliment.id})">✕</button>
        </div>
    `).join('');
}

function supprimerAlimentModal(alimentId) {
    alimentsTemporaires = alimentsTemporaires.filter(a => a.id !== alimentId);
    
    let repasParCategorie = chargerRepasParCategorie();
    repasParCategorie[categorieRepasActuelle] = repasParCategorie[categorieRepasActuelle].filter(a => a.id !== alimentId);
    sauvegarderRepasParCategorie(repasParCategorie);
    
    afficherAlimentsModal();
    calculerTotaux();
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

    document.getElementById('total-proteines').textContent = totalProteines.toFixed(1);
    document.getElementById('total-glucides').textContent = totalGlucides.toFixed(1);
    document.getElementById('total-lipides').textContent = totalLipides.toFixed(1);
    
    mettreAJourBarreCalories(totalCalories);
}

async function chargerAlimentsDepuisJSON() {
    const alimentsExistants = chargerAliments();
    
    if (alimentsExistants.length > 0) {
        return;
    }

    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error('Fichier data.json introuvable');
        }
        
        const data = await response.json();
        sauvegarderAliments(data.aliments);
    } catch (error) {
        console.error('❌ Erreur de chargement:', error);
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('modal-repas');
    if (event.target === modal) {
        fermerModalRepas();
    }
}

window.onload = async function() {
    await chargerAlimentsDepuisJSON();
    calculerTotaux();
    mettreAJourCompteurs();
};
