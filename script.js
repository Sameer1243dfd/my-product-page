document.addEventListener('DOMContentLoaded', function() {
    // --- YOUR SERVICEABLE PIN CODES ---
    const serviceablePinCodes = ["400080"]; 

    // --- YOUR GOOGLE SHEET URL ---
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCBq0sGvaMLJI-dylG7325ZFZ4cx6zC0ud4hrbIAbflYy4J7I5wpO_sDkIvmu1cziVbjyM5u_Nk5Yv/pub?output=csv';
    
    const productInfoContainer = document.getElementById('product-info-container');
    const pincodeContainer = document.getElementById('pincode-section-container');
    const storesContainer = document.getElementById('stores-container');

    const urlParams = new URLSearchParams(window.location.search);
    const productIDFromURL = urlParams.get('product');

    if (!productIDFromURL) {
        productInfoContainer.innerHTML = '<h1>Product Not Found</h1><p>Please use a valid product link.</p>';
        return; 
    }

    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvText => {
            const allProducts = csvToObjects(csvText);
            const product = allProducts.find(p => p.productID === productIDFromURL);

            if (product) {
                productInfoContainer.innerHTML = `
                    <div class="product-header">
                        <img src="${product.imageURL}" alt="${product.productName}">
                        <h1>${product.productName}</h1>
                    </div>
                `;

                const marketplaces = [
                    { name: 'Amazon', link: product.amazonLink, price: parseFloat(product.amazonPrice), type: 'standard' },
                    { name: 'Flipkart', link: product.flipkartLink, price: parseFloat(product.flipkartPrice), type: 'standard' },
                    { name: 'Zepto', link: product.zeptoLink, price: parseFloat(product.zeptoPrice), type: 'instant' },
                    { name: 'Blinkit', link: product.blinkitLink, price: parseFloat(product.blinkitPrice), type: 'instant' }
                ].filter(store => store.link && !isNaN(store.price));

                const standardStores = marketplaces.filter(s => s.type === 'standard');
                const instantStores = marketplaces.filter(s => s.type === 'instant');

                if (instantStores.length > 0) {
                    pincodeContainer.innerHTML = `
                        <div class="pincode-checker">
                            <div class="header">Check for Instant Delivery</div>
                            <div class="pincode-input-group">
                                <input type="text" id="pincode-input" placeholder="Enter Pincode" maxlength="6">
                                <button id="pincode-check-btn">Check</button>
                            </div>
                            <div id="instant-delivery-options"></div>
                        </div>
                    `;
                    document.getElementById('pincode-check-btn').addEventListener('click', function() {
                        const enteredPinCode = document.getElementById('pincode-input').value;
                        const optionsContainer = document.getElementById('instant-delivery-options');
                        if (serviceablePinCodes.includes(enteredPinCode)) {
                            optionsContainer.innerHTML = instantStores.map(store => createStoreLink(store, false)).join('');
                        } else {
                            optionsContainer.innerHTML = '<p class="availability-message">Instant delivery not available here.</p>';
                        }
                    });
                }

                if (standardStores.length > 0) {
                    let bestPrice = Math.min(...standardStores.map(s => s.price));
                    storesContainer.innerHTML = `
                        <div class="stores-list">
                            <h2>Also available on:</h2>
                            ${standardStores.map(store => createStoreLink(store, store.price === bestPrice)).join('')}
                        </div>
                    `;
                }
            } else {
                productInfoContainer.innerHTML = '<h1>Product Not Found</h1>';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            productInfoContainer.innerHTML = '<h1>Error</h1>';
        });
});

function createStoreLink(store, isBestPrice) {
    // --- THIS IS THE LOGO DATABASE WITH YOUR CORRECTED DROPBOX LINKS ---
    const logos = {
        'amazon': 'https://www.dropbox.com/scl/fi/o2fycxwfcynwvswmae1hn/Amazon.png?rlkey=w22zgjc3t4eorbp9k2xaau8om&raw=1',
        'blinkit': 'https://www.dropbox.com/scl/fi/djkcf42owax1madv7wnif/Blinkit.png?rlkey=uotoh3i916axki7aa2hrubu8y&raw=1',
        'flipkart': 'https://www.dropbox.com/scl/fi/lmjhlgrfy7fb7p4oajcb7/Flipkart.png?rlkey=e59789wt1q3snvk8llnwryjmg&raw=1',
        'zepto': 'https://www.dropbox.com/scl/fi/63t2x65lt99qjwaudlwp0/Zepto.png?rlkey=jau6a9kfzea9iwdatv0rvta2t&raw=1'
    };
    
    const logoUrl = logos[store.name.toLowerCase()] || ''; 

    const bestPriceBadge = isBestPrice ? '<div class="best-price-badge">BEST PRICE</div>' : '';
    const bestPriceClass = isBestPrice ? 'best-price' : '';
    return `
        <div class="store-link ${bestPriceClass}">
            <div class="store-info">
                <img src="${logoUrl}" alt="${store.name} Logo" class="store-logo">
                <div class="store-details">
                    <span class="store-name">${store.name}</span>
                    ${bestPriceBadge}
                </div>
            </div>
            <div class="price-buy-section">
                <span class="price">₹${store.price.toLocaleString('en-IN')}</span>
                <a href="${store.link}" target="_blank" class="buy-button">Buy Now →</a>
            </div>
        </div>
    `;
}

function csvToObjects(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i]) {
            const obj = {};
            const currentline = lines[i].split(',');
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j] ? currentline[j].trim() : '';
            }
            result.push(obj);
        }
    }
    return result;
}