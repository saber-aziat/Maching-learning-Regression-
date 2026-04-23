document.addEventListener('DOMContentLoaded', () => {
    /* ========================================================
       TABS SWITCHING LOGIC
       ======================================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formSections = document.querySelectorAll('.form-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            formSections.forEach(s => s.classList.remove('active'));

            // Add active class to selected
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    /* ========================================================
       API CONFIGURATION
       ======================================================== */
    // Change this to match your FastAPI server address
    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Helper: Format currency
    const formatCurrency = (value) => {
        const formattedNumber = new Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: 0
        }).format(value);
        return `${formattedNumber.replace(/[\u202f\u00a0]/g, ' ')} DHs`;
    };

    /* ========================================================
       FORM 1: PRICE PREDICTION
       ======================================================== */
    const priceForm = document.getElementById('priceForm');
    const priceResult = document.getElementById('price-result');
    const priceValue = priceResult.querySelector('.result-value');
    const priceBtn = priceForm.querySelector('.submit-btn');

    priceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Setup UI for Loading
        const originalBtnText = priceBtn.innerHTML;
        priceBtn.innerHTML = '<span>Calcul en cours...</span> <i class="fa-solid fa-spinner loading-spinner"></i>';
        priceBtn.classList.add('loading');
        priceResult.classList.add('hidden');

        // Gather input values
        const data = {
            income: parseFloat(document.getElementById('p-income').value),
            age: parseFloat(document.getElementById('p-age').value),
            rooms: parseFloat(document.getElementById('p-rooms').value),
            bedrooms: parseFloat(document.getElementById('p-bedrooms').value),
            population: parseFloat(document.getElementById('p-population').value)
        };

        try {
            // Call FastAPI Backend
            const response = await fetch(`${API_BASE_URL}/predict-price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Erreur de communication avec le serveur FastAPI.');
            }

            const result = await response.json();
            
            // Assume the API returns {"price": 1500000} or similar structure
            let predictedPrice = result.price !== undefined ? result.price : result;
            
            // Format and display the price
            priceValue.textContent = formatCurrency(predictedPrice);
            
            // Reset text styling in case of previous errors
            priceValue.style.background = 'linear-gradient(135deg, #34d399, #059669)';
            priceValue.style.webkitBackgroundClip = 'text';
            priceValue.style.webkitTextFillColor = 'transparent';

        } catch (error) {
            console.error('Erreur API:', error);
            
            // Valeur par défaut de 0 en cas d'erreur
            priceValue.textContent = formatCurrency(0);
            
            // Réinitialiser les styles pour le texte par défaut
            priceValue.style.background = 'none';
            priceValue.style.webkitTextFillColor = 'var(--primary-color)';
            priceValue.style.color = 'var(--primary-color)';

        } finally {
            priceResult.classList.remove('hidden');
            priceBtn.innerHTML = originalBtnText;
            priceBtn.classList.remove('loading');
        }
    });

    /* ========================================================
       FORM 2: DEMAND PREDICTION
       ======================================================== */
    const demandForm = document.getElementById('demandForm');
const demandResult = document.getElementById('demand-result');
const demandMessage = demandResult.querySelector('.result-message');
const statusIndicator = demandResult.querySelector('.status-indicator');
const demandBtn = demandForm.querySelector('.submit-btn');

demandForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI Loading
    const originalBtnText = demandBtn.innerHTML;
    demandBtn.innerHTML = '<span>Analyse en cours...</span> <i class="fa-solid fa-spinner loading-spinner"></i>';
    demandBtn.classList.add('loading');

    demandResult.classList.add('hidden');

    // Récupération des valeurs
    const data = {
        income: parseFloat(document.getElementById('d-income').value),
        age: parseFloat(document.getElementById('d-age').value),
        rooms: parseFloat(document.getElementById('d-rooms').value),
        bedrooms: parseFloat(document.getElementById('d-bedrooms').value),
        population: parseFloat(document.getElementById('d-population').value),
        price: parseFloat(document.getElementById('d-price').value)
    };

    try {
        // (Optionnel) appel API futur
        // const response = await fetch("http://localhost:8000/predict", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify(data)
        // });
        // const result = await response.json();

        // ici on simule une logique simple
        showDemandResult(data);

    } catch (error) {
        console.error(error);
    }

    // reset button
    demandBtn.innerHTML = originalBtnText;
    demandBtn.classList.remove('loading');
});


// ✅ Helper function CORRIGÉE
function showDemandResult(data) {
    demandResult.classList.remove('hidden');

    if (data.price < 1000000) {
        demandResult.classList.add('demand-success');
        demandResult.classList.remove('demand-fail');

        statusIndicator.innerHTML = '<i class="fa-solid fa-check" style="color: white; font-size: 16px;"></i>';
        demandMessage.textContent = 'Bon prix par rapport aux caractéristiques';
    } else {
        demandResult.classList.add('demand-fail');
        demandResult.classList.remove('demand-success');

        statusIndicator.innerHTML = '<i class="fa-solid fa-xmark" style="color: white; font-size: 16px;"></i>';
        demandMessage.textContent = 'Prix non adapté aux caractéristiques';
    }
}
});
