// Coin Watcher için gerekli değişkenler
const COINGECKO_API_KEY = "CG-sjJENydyWF9EFMnaQfoKAG9Y";
const coinVerileri = {
    'bitcoin': { id: 'bitcoin', athMarketCaps: { '2021 Rallisi': 1275000000000 } },
    'ethereum': { id: 'ethereum', athMarketCaps: { '2021 Rallisi': 540000000000 } },
    'solana': { id: 'solana', athMarketCaps: { '2021 Rallisi': 77000000000 } },
    'cardano': { id: 'cardano', athMarketCaps: { '2021 Rallisi': 94000000000, '2018 Rallisi': 20000000000 } },
    'dogecoin': { id: 'dogecoin', athMarketCaps: { '2021 Rallisi': 88000000000 } }
};
let secilenCoinId = '';

// Sayfa yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    // Coin Watcher bölümü için
    const savedApiKey = localStorage.getItem('ETHERSCAN_API_KEY');
    if (savedApiKey) {
        document.getElementById('etherscanApiKey').value = savedApiKey;
    }
    loadCoinButtons();

    // Hesaplayıcı bölümü için
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

/* Coin Watcher Fonksiyonları */

// API Anahtarını yerel depolama alanına kaydeder
function saveApiKeys() {
    const etherscanKey = document.getElementById('etherscanApiKey').value;
    if (etherscanKey) {
        localStorage.setItem('ETHERSCAN_API_KEY', etherscanKey);
        alert('API Anahtarı başarıyla kaydedildi!');
    } else {
        alert('Lütfen geçerli bir API anahtarı girin.');
    }
}

// Kullanıcının girdiği sayıya göre dinamik giriş alanları oluşturur
function createCoinInputs() {
    const numberOfCoins = document.getElementById('numberOfCoins').value;
    const container = document.getElementById('coinInputsContainer');
    const saveButton = document.getElementById('saveCoinsBtn');
    container.innerHTML = '';
    
    if (numberOfCoins > 0) {
        for (let i = 1; i <= numberOfCoins; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.innerHTML = `
                <h4>Koin ${i}</h4>
                <input type="text" id="coinName${i}" placeholder="Koin Adı (Örn: BTC)">
                <input type="text" id="contractAddress${i}" placeholder="Sözleşme Adresi">
            `;
            container.appendChild(inputGroup);
        }
        saveButton.style.display = 'block';
    } else {
        saveButton.style.display = 'none';
    }
}

// Oluşturulan coin ayarlarını yerel depolama alanına kaydeder
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
    alert('Koin ayarları başarıyla kaydedildi!');
    loadCoinButtons();
}

// Yerel depolama alanından kayıtlı coinler için düğmeler oluşturur
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
    }
}

// Yeni bir pencerede koinin işlemlerini gösterir
function openCoinDetail(contractAddress, coinName) {
    const newWindow = window.open('', '_blank');
    const etherscanApiKey = localStorage.getItem('ETHERSCAN_API_KEY');

    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${coinName} İşlemleri</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
            <div class="container">
                <h1>${coinName} İşlemleri</h1>
                <div id="transactionsList">
                    <p>Yükleniyor...</p>
                </div>
            </div>
            <script>
                async function fetchTransactions() {
                    const transactionsDiv = newWindow.document.getElementById('transactionsList');
                    const url = \`https://api.etherscan.io/api?module=account&action=tokentx&address=${contractAddress}&apikey=${etherscanApiKey}\`;
                    
                    try {
                        const response = await fetch(url);
                        const data = await response.json();

                        transactionsDiv.innerHTML = '';

                        if (data.status === "1" && data.result && data.result.length > 0) {
                            data.result.forEach(tx => {
                                const transactionInfo = newWindow.document.createElement('p');
                                const valueInToken = tx.value / Math.pow(10, tx.tokenDecimal);
                                const date = new Date(tx.timeStamp * 1000);
                                const formattedDate = date.toLocaleString();
                                
                                transactionInfo.innerHTML = \`
                                    <strong>From:</strong> \${tx.from}<br>
                                    <strong>To:</strong> \${tx.to}<br>
                                    <strong>Value:</strong> \${valueInToken} \${tx.tokenSymbol}<br>
                                    <strong>Date:</strong> \${formattedDate}
                                \`;
                                transactionsDiv.appendChild(transactionInfo);
                            });
                        } else {
                            transactionsDiv.innerHTML = '<p>İşlem bulunamadı veya bir hata oluştu.</p>';
                        }
                    } catch (error) {
                        transactionsDiv.innerHTML = \`<p>Bir hata oluştu: \${error.message}</p>\`;
                    }
                }
                fetchTransactions();
            </script>
        </body>
        </html>
    `);
}


/* Hesaplayıcı Fonksiyonları */

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
