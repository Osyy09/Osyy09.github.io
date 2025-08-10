function hesapla() {
    // HTML'den gerekli input elemanlarını alıyoruz
    const gecmisPiyasaDegeriInput = document.getElementById('gecmisPiyasaDegeri');
    const bugunkuArzInput = document.getElementById('bugunkuArz');
    const maliyetFiyatiInput = document.getElementById('maliyetFiyati');
    const sonucAlani = document.getElementById('sonucAlani');

    // Input değerlerini alıp sayıya çeviriyoruz
    const gecmisPiyasaDegeri = parseFloat(gecmisPiyasaDegeriInput.value);
    const bugunkuArz = parseFloat(bugunkuArzInput.value);
    const maliyetFiyati = parseFloat(maliyetFiyatiInput.value);

    // Zorunlu alanların doldurulup doldurulmadığını kontrol etme
    if (isNaN(gecmisPiyasaDegeri) || isNaN(bugunkuArz) || gecmisPiyasaDegeri <= 0 || bugunkuArz <= 0) {
        sonucAlani.innerHTML = "<p style='color: #FF5252; text-align: center;'>Lütfen gerekli alanları doğru şekilde doldurun!</p>";
        return; // Fonksiyonu durdur
    }

    // Hesaplamalar
    const potansiyelFiyat = gecmisPiyasaDegeri / bugunkuArz;

    let sonucHTML = `
        <p><strong>Potansiyel Fiyat:</strong> ${potansiyelFiyat.toFixed(4)} USD</p>
    `;

    // Maliyet fiyatı girilmişse X (kat) hesaplamasını yapma
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

    // Sonuçları HTML sayfasına yazdırma
    sonucAlani.innerHTML = sonucHTML;
}
