const API_KEY = "5d4fba854e4a3cadf9fe235c";   // ←←← REEMPLAZA ESTO con tu clave real de ExchangeRate-API

const BASE_URL = 'https://v6.exchangerate-api.com/v6';
const BASE_CURRENCY = 'DOP';

const CURRENCIES = [
    { code: 'USD', name: 'Dólar EE.UU.', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
    { code: 'JPY', name: 'Yen Japonés', flag: '🇯🇵' },
    { code: 'CNY', name: 'Yuan Chino', flag: '🇨🇳' },
    { code: 'CAD', name: 'Dólar Canadiense', flag: '🇨🇦' },
    { code: 'AUD', name: 'Dólar Australiano', flag: '🇦🇺' },
    { code: 'CHF', name: 'Franco Suizo', flag: '🇨🇭' },
    { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' },
    { code: 'BRL', name: 'Real Brasileño', flag: '🇧🇷' },
    { code: 'INR', name: 'Rupia India', flag: '🇮🇳' },
    { code: 'RUB', name: 'Rublo Ruso', flag: '🇷🇺' }
];

// Datos históricos simulados para los gráficos (últimos 6 meses)
const HISTORICAL_DATA = {
    USD: [58.2, 58.8, 59.1, 59.5, 59.9, 60.3],
    EUR: [63.1, 63.8, 64.4, 64.9, 65.2, 64.8],
    GBP: [74.5, 75.1, 74.8, 75.6, 76.2, 75.9],
    JPY: [0.39, 0.40, 0.395, 0.405, 0.41, 0.408],
    CNY: [8.15, 8.22, 8.18, 8.25, 8.30, 8.28],
    CAD: [43.8, 44.2, 44.5, 44.9, 45.1, 44.7],
    AUD: [39.5, 39.9, 40.2, 40.6, 40.8, 40.4],
    CHF: [66.2, 66.8, 67.1, 67.5, 67.9, 67.6],
    MXN: [3.05, 3.08, 3.12, 3.15, 3.18, 3.14],
    BRL: [10.8, 10.95, 11.1, 11.25, 11.4, 11.3],
    INR: [0.71, 0.715, 0.72, 0.725, 0.73, 0.728],
    RUB: [0.65, 0.66, 0.655, 0.67, 0.68, 0.675]
};

let ratesData = {};
let charts = [];

// Renderizar todas las tarjetas
function renderCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    CURRENCIES.forEach((currency, index) => {
        const rateDOP = ratesData[currency.code] ? (1 / ratesData[currency.code]).toFixed(2) : '—';
        
        const cardHTML = `
        <div class="col">
            <div class="card h-100">
                <div class="card-body text-center p-4">
                    <div class="d-flex justify-content-center align-items-center mb-3">
                        <div style="font-size: 3.5rem;">${currency.flag}</div>
                    </div>
                    <h5 class="fw-bold mb-1">${currency.code}</h5>
                    <p class="text-light-50 small">${currency.name}</p>
                    
                    <div class="rate-text my-3">1 ${currency.code} = <span id="rate-${currency.code}">${rateDOP}</span> DOP</div>
                    
                    <div class="converted-value text-green fw-bold fs-5 mb-4" id="converted-${currency.code}">
                        1000 DOP = <span class="text-light">—</span> ${currency.code}
                    </div>
                    
                    <div id="chart-${currency.code}" style="height: 140px;"></div>
                </div>
            </div>
        </div>`;
        
        container.innerHTML += cardHTML;
    });

    // Crear gráficos después de insertar las tarjetas
    setTimeout(createAllCharts, 400);
}

// Crear gráficos con ApexCharts
function createAllCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];

    CURRENCIES.forEach(currency => {
        const options = {
            chart: {
                type: 'line',
                height: 140,
                toolbar: { show: false },
                sparkline: { enabled: true }
            },
            series: [{
                name: currency.code,
                data: HISTORICAL_DATA[currency.code] || [1, 1.1, 1.05, 1.2, 1.15, 1.3]
            }],
            xaxis: {
                categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                labels: { style: { colors: '#888' } }
            },
            yaxis: {
                labels: { style: { colors: '#0ff' } }
            },
            stroke: {
                curve: 'smooth',
                width: 3,
                colors: ['#00f0ff']
            },
            grid: { show: false },
            tooltip: { theme: 'dark' }
        };

        const chartElement = document.querySelector(`#chart-${currency.code}`);
        if (chartElement) {
            const chart = new ApexCharts(chartElement, options);
            chart.render();
            charts.push(chart);
        }
    });
}

// Actualizar los valores convertidos en todas las tarjetas
function updateConvertedValues(amount) {
    CURRENCIES.forEach(currency => {
        if (!ratesData[currency.code]) return;
        const rateToDOP = 1 / ratesData[currency.code]; // 1 moneda extranjera = X DOP
        const converted = (amount / rateToDOP).toFixed(2);
        
        const element = document.getElementById(`converted-${currency.code}`);
        if (element) {
            element.innerHTML = `${amount} DOP = <span class="text-light">${converted}</span> ${currency.code}`;
        }
    });
}

// Obtener tasas de cambio desde la API
async function fetchRates() {
    if (!API_KEY || API_KEY === "PON_TU_API_KEY_AQUI") {
        alert('❌ Por favor, reemplaza "PON_TU_API_KEY_AQUI" con tu clave real de ExchangeRate-API en main.js');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${BASE_CURRENCY}`);
        const data = await response.json();

        if (data.result === 'success') {
            ratesData = data.conversion_rates;
            renderCards();
            // Actualizar con el monto inicial
            const initialAmount = parseFloat(document.getElementById('amount-input').value) || 1000;
            updateConvertedValues(initialAmount);
        } else {
            throw new Error(data['error-type'] || 'Error en la API');
        }
    } catch (error) {
        console.error(error);
        alert('Error al cargar las tasas de cambio. Verifica tu API Key y tu conexión a internet.');
    }
}

// Mostrar modal de perfil
function showProfileModal() {
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
}

// Renderizar Tech Stack en el modal
function renderTechStack() {
    const container = document.getElementById('tech-stack');
    if (!container) return;

    const techs = [
        'React', 'Vue', 'Laravel', 'Python', '.NET', 'SQL', 
        'Power BI', 'Gemini', 'ChatGPT', 'Claude', 'Grok', 
        'DeepSeek', 'Mistral', 'Copilot'
    ];

    let html = '';
    techs.forEach(tech => {
        html += `<div class="tech-badge">${tech}</div>`;
    });
    container.innerHTML = html;
}

// Inicialización de la aplicación
window.onload = () => {
    console.log('%c✅ Finanzas DOP Cyber cargada correctamente', 'color: #00f0ff; font-weight: bold;');
    
    renderTechStack();
    fetchRates();

    // Listener para el calculador maestro
    const amountInput = document.getElementById('amount-input');
    amountInput.addEventListener('input', () => {
        const amount = parseFloat(amountInput.value) || 0;
        updateConvertedValues(amount);
    });
};
