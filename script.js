// Hesaplayıcı için sabit veriler ve API anahtarı
const COINGECKO_API_KEY = "CG-sjJENydyWF9EFMnaQfoKAG9Y";
const predefinedCoinData = {
    'bitcoin': { id: 'bitcoin', athMarketCaps: { '2021 Rallisi': 1275000000000 } },
    'ethereum': { id: 'ethereum', athMarketCaps: { '2021 Rallisi': 540000000000 } },
    'solana': { id: 'solana', athMarketCaps: { '2021 Rallisi': 77000000000 } },
    'cardano': { id: 'cardano', athMarketCaps: { '2021 Rallisi': 94000000000, '2018 Rallisi': 20000000000 } },
    'dogecoin': { id: 'dogecoin', athMarketCaps: { '2021 Rallisi': 88000000000 } }
};
let allCoinData = {};
let secilenCoinId = '';

// Sayfa yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    loadApiKeys();
    loadCoinButtons();
    loadManualCoins();
    initCalculatorCoins();
});

/* Coin Watcher Fonksiyonları */
function loadApiKeys() {
    const savedEtherscanKey = localStorage.getItem('ETHERSCAN_API_KEY');
    if (savedEtherscanKey) {
        document.getElementById('etherscanApiKey').value = savedEtherscanKey;
    }

    const savedMobulaKey = localStorage.getItem('MOBULA_API_KEY');
    if (savedMobulaKey) {
        document.getElementById('mobulaApiKey').value = savedMobulaKey;
    }
}

function saveApiKeys() {
    const etherscanKey = document.getElementById('etherscanApiKey').value;
    const mobulaKey = document.getElementById('mobulaApiKey').value;

    if (etherscanKey) {
        localStorage.setItem('ETHERSCAN_API_KEY', etherscanKey);
    } else {
        localStorage.removeItem('ETHERSCAN_API_KEY');
    }

    if (mobulaKey) {
        localStorage.setItem('MOBULA_API_KEY', mobulaKey);
    } else {
        localStorage.removeItem('MOBULA_API_KEY');
    }

    alert('API Anahtarları başarıyla kaydedildi!');
}

function createCoinInputs() {
    const numberOfCoins = document.getElementById('numberOfCoins').value;
    const container = document.getElementById('coinInputsContainer');
    const saveButton = document.getElementById('saveCoinsBtn');
    container.innerHTML = '';
    
    if (numberOfCoins > 0 && numberOfCoins <= 10) {
        for (let i = 1; i <= numberOfCoins; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'coin-input-group';
            inputGroup.innerHTML = `
                <h3>Koin ${i}</h3>
                <div class="input-group">
                    <label>Koin Adı:</label>
                    <input type="text" id="coinName${i}" placeholder="Koin Adı (Örn: BTC)">
                </div>
                <div class="input-group">
                    <label>Sözleşme Adresi:</label>
                    <input type="text" id="contractAddress${i}" placeholder="Sözleşme Adresi">
                </div>
            `;
            container.appendChild(inputGroup);
        }
        saveButton.style.display = 'block';
        document.getElementById('stopTrackingBtn').style.display = 'none';
    } else {
        alert("Lütfen 1 ile 10 arasında bir sayı girin.");
        saveButton.style.display = 'none';
    }
}

function saveCoinConfigs() {
    const numberOfCoins = document.getElementById('numberOfCoins').value;
    const coinConfigs = [];

    for (let i = 1; i <= numberOfCoins; i++) {
        const coinName = document.getElementById(`coinName${i}`).value;
        const contractAddress = document.getElementById(`contractAddress${i}`).value;

        if (coinName && contractAddress) {
            coinConfigs.push({
                name: coinName,
                contractAddress: contractAddress
            });
        } else {
            alert('Lütfen tüm koin bilgilerini doldurun.');
            return;
        }
    }
    
    localStorage.setItem('COIN_CONFIGS', JSON.stringify(coinConfigs));
    alert('Koin ayarları başarıyla kaydedildi ve takip başlatıldı!');
    loadCoinButtons();
    document.getElementById('saveCoinsBtn').style.display = 'none';
    document.getElementById('stopTrackingBtn').style.display = 'block';
}

function loadCoinButtons() {
    const coinButtonsContainer = document.getElementById('coinButtonsContainer');
    coinButtonsContainer.innerHTML = '';
    const coinConfigs = JSON.parse(localStorage.getItem('COIN_CONFIGS'));

    if (coinConfigs) {
        coinConfigs.forEach(config => {
            const button = document.createElement('button');
            button.className = 'coin-button';
            button.textContent = config.name;
            button.onclick = () => openCoinDetail(config.contractAddress, config.name);
            coinButtonsContainer.appendChild(button);
        });
        document.getElementById('stopTrackingBtn').style.display = 'block';
    }
}

function stopTracking() {
    localStorage.removeItem('COIN_CONFIGS');
    alert("Koin takibi durduruldu.");
    document.getElementById('coinInputsContainer').innerHTML = '';
    document.getElementById('coinButtonsContainer').innerHTML = '';
    document.getElementById('stopTrackingBtn').style.display = 'none';
    document.getElementById('saveCoinsBtn').style.display = 'none';
    document.getElementById('numberOfCoins').value = '';
}

function openCoinDetail(contractAddress, coinName) {
    const etherscanApiKey = localStorage.getItem('ETHERSCAN_API_KEY');
    if (!etherscanApiKey) {
        alert("Lütfen önce Etherscan API anahtarını kaydedin.");
        return;
    }

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${coinName} İşlemleri</title>
            <link rel="stylesheet" href="style.css">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body class="detail-body">
            <div class="card detail-card">
                <h1>${coinName} İşlemleri</h1>
                <div id="transactionsList">
                    <p>İşlemler yükleniyor...</p>
                </div>
            </div>
            <script>
                async function fetchTransactions() {
                    const transactionsDiv = document.getElementById('transactionsList');
                    const url = \`https://api.etherscan.io/api?module=account&action=tokentx&address=${contractAddress}&apikey=${etherscanApiKey}\`;
                    
                    try {
                        const response = await fetch(url);
                        const data = await response.json();
                        transactionsDiv.innerHTML = '';

                        if (data.status === "1" && data.result && data.result.length > 0) {
                            data.result.forEach(tx => {
                                const transactionInfo = document.createElement('div');
                                transactionInfo.className = 'transaction-item';
                                const valueInToken = tx.value / Math.pow(10, tx.tokenDecimal);
                                const date = new Date(tx.timeStamp * 1000);
                                const formattedDate = date.toLocaleString();
                                
                                transactionInfo.innerHTML = \`
                                    <p><strong>İşlem Adresi:</strong> <a href="https://etherscan.io/tx/\${tx.hash}" target="_blank">\${tx.hash.substring(0, 10)}...</a></p>
                                    <p><strong>Gönderen:</strong> \${tx.from.substring(0, 10)}...</p>
                                    <p><strong>Alıcı:</strong> \${tx.to.substring(0, 10)}...</p>
                                    <p><strong>Miktar:</strong> \${valueInToken} \${tx.tokenSymbol}</p>
                                    <p><strong>Tarih:</strong> \${formattedDate}</p>
                                \`;
                                transactionsDiv.appendChild(transactionInfo);
                            });
                        } else {
                            transactionsDiv.innerHTML = '<p class="error-message">İşlem bulunamadı veya bir hata oluştu.</p>';
                        }
                    } catch (error) {
                        transactionsDiv.innerHTML = \`<p class="error-message">Bir hata oluştu: \${error.message}</p>\`;
                    }
                }
                fetchTransactions();
            </script>
        </body>
        </html>
    `);
}


/* Kripto Hesaplayıcı Fonksiyonları */

function loadManualCoins() {
    const manualCoinsJson = localStorage.getItem('MANUAL_COINS');
    const manualCoins = manualCoinsJson ? JSON.parse(manualCoinsJson) : {};
    allCoinData = { ...predefinedCoinData, ...manualCoins };
}

function saveManualCoins(manualCoins) {
    localStorage.setItem('MANUAL_COINS', JSON.stringify(manualCoins));
    loadManualCoins();
    initCalculatorCoins();
}

function addManualCoin() {
    const coinName = document.getElementById('manualCoinName').value.trim();
    const rallyYear = document.getElementById('manualRallyYear').value.trim();
    const athMarketCap = parseFloat(document.getElementById('manualAthMarketCap').value);

    if (!coinName || !rallyYear || isNaN(athMarketCap) || athMarketCap <= 0) {
        alert("Lütfen tüm alanları geçerli değerlerle doldurun.");
        return;
    }

    const manualCoinsJson = localStorage.getItem('MANUAL_COINS');
    const manualCoins = manualCoinsJson ? JSON.parse(manualCoinsJson) : {};

    const coinId = coinName.toLowerCase();
    
    // Check for duplicates
    if (manualCoins[coinId] && manualCoins[coinId].athMarketCaps[rallyYear] === athMarketCap) {
        alert("Bu coin ve ralli dönemi zaten kaydedilmiş.");
        return;
    }

    if (!manualCoins[coinId]) {
        manualCoins[coinId] = {
            id: coinId,
            athMarketCaps: {}
        };
    }
    
    manualCoins[coinId].athMarketCaps[rallyYear] = athMarketCap;
    
    saveManualCoins(manualCoins);
    alert(`"${coinName}" başarıyla eklendi!`);
    
    // Clear input fields
    document.getElementById('manualCoinName').value = '';
    document.getElementById('manualRallyYear').value = '';
    document.getElementById('manualAthMarketCap').value = '';
}

function initCalculatorCoins() {
    const coinSelect = document.getElementById('coinSelect');
    coinSelect.innerHTML = '<option value="">Lütfen bir coin seçin...</option>';
    for (const key in allCoinData) {
        if (allCoinData.hasOwnProperty(key)) {
            const option = document.createElement('option');
            option.value = key;
            option.text = key.charAt(0).toUpperCase() + key.slice(1);
            coinSelect.appendChild(option);
        }
    }
}

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

    const coin = allCoinData[secilenCoinId];
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
        sonucAlani.innerHTML = "<p class='error-message'>Lütfen bir coin ve ralli dönemi seçin!</p>";
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
            <p class="secondary-text">Maliyet fiyatı girerseniz, potansiyel getirinizi (x) hesaplayabiliriz.</p>
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
