const COINGECKO_API_KEY = "CG-sjJENydyWF9EFMnaQfoKAG9Y"; 

const coinVerileri = {
    'bitcoin': { id: 'bitcoin', athMarketCaps: { '2021 Rallisi': 1275000000000 } },
    'ethereum': { id: 'ethereum', athMarketCaps: { '2021 Rallisi': 540000000000 } },
    'solana': { id: 'solana', athMarketCaps: { '2021 Rallisi': 77000000000 } },
    'cardano': { id: 'cardano', athMarketCaps: { '2021 Rallisi': 94000000000, '2018 Rallisi': 20000000000 } },
    'dogecoin': { id: 'dogecoin', athMarketCaps: { '2021 Rallisi': 88000000000 } }
};

let secilenCoinId = '';

document.addEventListener('DOMContentLoaded', () => {
    const coinSelect = document.getElementById('coinSelect');
    for (const key in coinVerileri) {
        if (coinVerileri.hasOwnProperty(key)) {
            const option = document.createElement('option');
            option.value = key;
            option.text = key.charAt(0).toUpperCase() + key.slice(1);
            coinSelect.appendChild(option);
        }
    }
});

function coinSecildi() {
    secilenCoinId = document.getElementById('coinSelect').value;
    const ralliVerileriDiv = document.getElementById('ralliVerileri');
    const ralliSelect = document.getElementById('ralliSelect');
    const sonucAlani = document.getElementById('sonucAlani');
    const bilgiAlani = document.getElementById('bilgiAlani');

    sonucAlani.innerHTML = '';
    ralliSelect.innerHTML = '';
    
    if (secilenCoinId === "") {
        ralliVerileriDiv.style.display = 'none';
        bilgiAlani.style.display = 'none';
        return;
    }

    const coin = coinVerileri[secilenCoinId];
    for (const ralliDonemi in coin.athMarketCaps) {
        const option = document.createElement('option');
        option.value = coin.athMarketCaps[ralliDonemi];
        option.text = `${ralliDonemi}: ${formatSayi(coin.athMarketCaps[ralliDonemi])} USD`;
        ralliSelect.appendChild(option);
    }

    ralliVerileriDiv.style.display = 'block';
    bilgiAlani.style.display = 'block';
    getBugunkuArz(secilenCoinId);
}

async function getBugunkuArz(coinId) {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'x-cg-demo-api-key': COINGECKO_API_KEY
            }
        });
        if (!response.ok) {
            throw new Error('API isteği başarısız oldu!');
        }
        const data = await response.json();
        
        const bugunkuArz = data.market_data.circulating_supply;
        document.getElementById('bugunkuArz').textContent = formatSayi(bugunkuArz);
    } catch (error) {
        document.getElementById('bugunkuArz').textContent = 'Veri çekilemedi';
        console.error(error);
    }
}

function hesapla() {
    const ralliPiyasaDegeri = parseFloat(document.getElementById('ralliSelect').value);
    const bugunkuArzText = document.getElementById('bugunkuArz').textContent.replace(/,/g, '');
    let bugunkuArz;

    if (bugunkuArzText.includes('Trilyon')) {
        bugunkuArz = parseFloat(bugunkuArzText) * 1e12;
    } else if (bugunkuArzText.includes('Milyar')) {
        bugunkuArz = parseFloat(bugunkuArzText) * 1e9;
    } else if (bugunkuArzText.includes('Milyon')) {
        bugunkuArz = parseFloat(bugunkuArzText) * 1e6;
    } else {
        bugunkuArz = parseFloat(bugunkuArzText);
    }

    const maliyetFiyati = parseFloat(document.getElementById('maliyetFiyati').value);
    const sonucAlani = document.getElementById('sonucAlani');

    if (isNaN(ralliPiyasaDegeri) || isNaN(bugunkuArz) || ralliPiyasaDegeri <= 0 || bugunkuArz <= 0) {
        sonucAlani.innerHTML = "<p style='color: #FF5252; text-align: center;'>Lütfen bir coin ve ralli dönemi seçin!</p>";
        return;
    }
    
    const potansiyelFiyat = ralliPiyasaDegeri / bugunkuArz;

    let sonucHTML = `
        <p><strong>Potansiyel Fiyat:</strong> ${potansiyelFiyat.toFixed(4)} USD</p>
    `;

    if (!isNaN(maliyetFiyati) && maliyetFiyati > 0) {
        const potansiyelKat = potansiyelFiyat / maliyetFiyati;
        sonucHTML += `
            <p><strong>Potansiyel Getiri:</strong> ${potansiyelKat.toFixed(2)}x</p>
        `;
    } else {
        sonucHTML += `
            <p style="color: #666; font-size: 0.9em;">Maliyet fiyatı girerseniz, potansiyel getirinizi (x) hesaplayabiliriz.</p>
        `;
    }
    
    sonucAlani.innerHTML = sonucHTML;
}

function formatSayi(sayi) {
    if (sayi >= 1e12) {
        return (sayi / 1e12).toFixed(2) + ' Trilyon';
    }
    if (sayi >= 1e9) {
        return (sayi / 1e9).toFixed(2) + ' Milyar';
    }
    if (sayi >= 1e6) {
        return (sayi / 1e6).toFixed(2) + ' Milyon';
    }
    return sayi.toFixed(0);
}
