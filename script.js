// API Anahtarını tarayıcının yerel depolama alanına kaydeder
function saveApiKeys() {
    const etherscanKey = document.getElementById('etherscanApiKey').value;
    if (etherscanKey) {
        localStorage.setItem('ETHERSCAN_API_KEY', etherscanKey);
        alert('API Anahtarı başarıyla kaydedildi!');
    } else {
        alert('Lütfen geçerli bir API anahtarı girin.');
    }
}

// API'den işlem verilerini çeker ve listeler
async function fetchTransactions() {
    const contractAddress = document.getElementById('contractAddress').value;
    const apiKey = localStorage.getItem('ETHERSCAN_API_KEY');

    const transactionsDiv = document.getElementById('transactionsList');
    transactionsDiv.innerHTML = '<p>Yükleniyor...</p>';

    if (!contractAddress || !apiKey) {
        transactionsDiv.innerHTML = '<p>Lütfen sözleşme adresini girin ve API anahtarını kaydedin.</p>';
        return;
    }

    const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${contractAddress}&apikey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        transactionsDiv.innerHTML = ''; // Önceki içeriği temizle

        if (data.status === "1" && data.result && data.result.length > 0) {
            data.result.forEach(tx => {
                const transactionInfo = document.createElement('p');
                const valueInToken = tx.value / Math.pow(10, tx.tokenDecimal); // Değer dönüşümü
                
                // Tarih dönüşümü
                const date = new Date(tx.timeStamp * 1000);
                const formattedDate = date.toLocaleString();

                transactionInfo.innerHTML = `
                    <strong>From:</strong> ${tx.from}<br>
                    <strong>To:</strong> ${tx.to}<br>
                    <strong>Value:</strong> ${valueInToken} ${tx.tokenSymbol}<br>
                    <strong>Date:</strong> ${formattedDate}
                `;
                transactionsDiv.appendChild(transactionInfo);
            });
        } else {
            transactionsDiv.innerHTML = '<p>İşlem bulunamadı veya bir hata oluştu.</p>';
        }

    } catch (error) {
        console.error('Hata:', error);
        transactionsDiv.innerHTML = `<p>Bir hata oluştu: ${error.message}</p>`;
    }
}

// Sayfa yüklendiğinde API anahtarını giriş alanına otomatik doldur
window.onload = function() {
    const savedApiKey = localStorage.getItem('ETHERSCAN_API_KEY');
    if (savedApiKey) {
        document.getElementById('etherscanApiKey').value = savedApiKey;
    }
};
