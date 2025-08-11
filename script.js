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

// Sayfa yüklendiğinde API anahtarlarını ve kayıtlı coinleri yükler
window.onload = function() {
    const savedApiKey = localStorage.getItem('ETHERSCAN_API_KEY');
    if (savedApiKey) {
        document.getElementById('etherscanApiKey').value = savedApiKey;
    }
    loadCoinButtons();
};
