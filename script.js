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
    const valeur = objectif ? parseFloat(objectif) : 2600;
    return Number.isFinite(valeur) && valeur > 0 ? valeur : 2600;
}

function mettreAJourBarreCalories(totalCalories) {
    const objectifCalories = chargerObjectifCalories();
    const progression = Math.min((totalCalories / objectifCalories) * 100, 100);
    
    const currentElement = document.getElementById('calorie-current');
    const goalElement = document.getElementById('calorie-goal');
    
    if (currentElement) {
        currentElement.textContent = Math.round(totalCalories);
    }
    
    if (goalElement) {
        goalElement.textContent = Math.round(objectifCalories);
    }
    
    const circle = document.getElementById('calorie-circle-progress');
    
    if (circle) {
        const radius = 85;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progression / 100) * circumference;
        
        circle.style.strokeDashoffset = offset;
        
        if (progression >= 100) {
            circle.setAttribute('stroke', 'url(#gradient-danger)');
            circle.style.filter = 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.4))';
            circle.classList.add('complete');
        } else if (progression >= 80) {
            circle.setAttribute('stroke', 'url(#gradient-warning)');
            circle.style.filter = 'drop-shadow(0 0 8px rgba(255, 149, 0, 0.4))';
            circle.classList.remove('complete');
        } else {
            circle.setAttribute('stroke', 'url(#gradient-calories)');
            circle.style.filter = 'drop-shadow(0 0 8px rgba(52, 199, 89, 0.3))';
            circle.classList.remove('complete');
        }
    }
}

function chargerObjectifsMacros() {
    const proteines = localStorage.getItem('objectif_proteines');
    const glucides = localStorage.getItem('objectif_glucides');
    const lipides = localStorage.getItem('objectif_lipides');
    
    return {
        proteines: proteines ? parseFloat(proteines) : 100,
        glucides: glucides ? parseFloat(glucides) : 240,
        lipides: lipides ? parseFloat(lipides) : 50
    };
}

function mettreAJourBarreMacro(type, valeurActuelle, objectif) {
    const progression = Math.min((valeurActuelle / objectif) * 100, 100);
    
    const texte = document.getElementById(`${type}-progress-text`);
    const barre = document.getElementById(`${type}-progress-fill`);
    
    if (texte) {
        texte.textContent = `${valeurActuelle.toFixed(0)} / ${objectif.toFixed(0)} g`;
    }
    
    if (barre) {
        barre.style.width = `${progression}%`;
        
        let couleur;
        switch(type) {
            case 'proteines':
                couleur = 'linear-gradient(90deg, #ff6b6b 0%, #ff8787 100%)';
                break;
            case 'glucides':
                couleur = 'linear-gradient(90deg, #4dabf7 0%, #74c0fc 100%)';
                break;
            case 'lipides':
                couleur = 'linear-gradient(90deg, #ffd43b 0%, #ffe066 100%)';
                break;
        }
        
        if (progression >= 100) {
            barre.style.background = 'linear-gradient(90deg, #ff3b30 0%, #ff453a 100%)';
        } else if (progression >= 90) {
            barre.style.background = 'linear-gradient(90deg, #ff9500 0%, #ff9f0a 100%)';
        } else {
            barre.style.background = couleur;
        }
        
        barre.style.boxShadow = `inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 0 0 1px ${getCouleurOmbre(type)}`;
    }
}

function getCouleurOmbre(type) {
    switch(type) {
        case 'proteines':
            return 'rgba(255, 107, 107, 0.1)';
        case 'glucides':
            return 'rgba(77, 171, 247, 0.1)';
        case 'lipides':
            return 'rgba(255, 212, 59, 0.1)';
        default:
            return 'rgba(0, 0, 0, 0.1)';
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
    
    const objectifsMacros = chargerObjectifsMacros();
    mettreAJourBarreMacro('proteines', totalProteines, objectifsMacros.proteines);
    mettreAJourBarreMacro('glucides', totalGlucides, objectifsMacros.glucides);
    mettreAJourBarreMacro('lipides', totalLipides, objectifsMacros.lipides);
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
