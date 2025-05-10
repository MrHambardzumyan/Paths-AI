// Local Storage
const already_played = localStorage.getItem('already_played') || false;

// Onload
document.addEventListener('DOMContentLoaded', () => {
    // If never played before
    if(!already_played) {
        const continueButton = document.querySelector('#continue');
        continueButton.disabled = true;
    }

    // Preloading previous values
    const tokens = document.querySelector('#max-tokens');
    tokens.value = localStorage.getItem('max_tokens') || 4096;

    const tokensLabel = document.querySelector('#max-tokens-label');
    tokensLabel.textContent = tokens.value;

    const temperature = document.querySelector('#temperature');
    temperature.value = localStorage.getItem('temperature') || 0.7;

    const temperatureLabel = document.querySelector('#temperature-label');
    temperatureLabel.textContent = temperature.value;

    const model = document.querySelector('#image_model');
    model.value = localStorage.getItem('image_model') || "flux";
})

// Functions
function start() {
    if(already_played) {
        const deleteData = confirm("You have already played before. Are you sure you want to restart?\n\nNOTE: THIS WILL DELETE ALL DATA! NONE-RECOVERABLE!");
        if(deleteData) {
            const image_model = localStorage.getItem('image_model') || 'flux';
            const temperature = localStorage.getItem('temperature') || 0.7;
            const max_tokens = localStorage.getItem('max_tokens') || 4092;

            localStorage.clear();

            localStorage.setItem('image_model', image_model);
            localStorage.setItem('temperature', temperature);
            localStorage.setItem('max_tokens', max_tokens);
        } else {
            return;
        }
    }
    
    window.location.href = "../html/start.html"
}

function cont() {
    window.location.href = '../html/paths.html';
}

function showSettings() {
    const settings = document.querySelector('#settings');
    settings.show();
}

function tokensChange() {
    const tokens = document.querySelector('#max-tokens').value;
    const tokensLabel = document.querySelector('#max-tokens-label');
    tokensLabel.textContent = tokens;

    localStorage.setItem('max_tokens', tokens);
}

function temperatureChange() {
    const temperature = document.querySelector('#temperature').value;
    const temperatureLabel = document.querySelector('#temperature-label');
    temperatureLabel.textContent = temperature;

    localStorage.setItem('temperature', temperature);
}

function resetConfigToDefault() {
    const tokens = document.querySelector('#max-tokens');
    const tokensLabel = document.querySelector('#max-tokens-label');
    tokens.value = 4092;
    tokensLabel.textContent = '4092';
    
    const temperature = document.querySelector('#temperature');
    const temperatureLabel = document.querySelector('#temperature-label');
    temperature.value = 0.7;
    temperatureLabel.textContent = '0.7';

    localStorage.setItem('max_tokens', 4092);
    localStorage.setItem('temperature', 0.7);
}

function closeSettings() {
    const settings = document.querySelector('#settings');
    settings.close();
}

function saveImageModel() {
    const model = document.querySelector('#image_model');
    localStorage.setItem('image_model', model.value);
}