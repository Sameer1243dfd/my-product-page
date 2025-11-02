document.addEventListener('DOMContentLoaded', function() {
    // --- STEP 1: EDIT THIS LIST WITH YOUR REAL, SERVICEABLE PIN CODES ---
    const serviceablePinCodes = ["400001", "400002", "110001", "110021", "560001"]; 

    // --- STEP 2: MAKE SURE THIS GOOGLE SHEET URL IS YOUR FINAL, CORRECT ONE ---
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCBq0sGvaMLJI-dylG7325ZFZ4cx6zC0ud4hrbIAbflYy4J7I5wpO_sDkIvmu1cziVbjyM5u_Nk5Yv/pub?output=csv';
    
    // --- Getting HTML containers ---
    const productInfoContainer = document.getElementById('product-info-container');
    const pincodeContainer = document.getElementById('pincode-section-container');
    const storesContainer = document.getElementById('stores-container');

    const urlParams = new URLSearchParams(window.location.search);
    const productIDFromURL = urlParams.get('product');

    if (!productIDFromURL) {
        productInfoContainer.innerHTML = '<h1>Product Not Found</h1><p>Please use a valid product link.</p>';
        return; // Stop the script if no product ID is in the URL
    }

    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvText => {
            const allProducts = csvToObjects(csvText);
            const product = allProducts.find(p => p.productID === productIDFromURL);

            if (product) {
                // --- If we found the product, build the page ---
                
                // 1. Render the main image and title
                productInfoContainer.innerHTML = `
                    <div class="product-header">
                        <img src="${product.imageURL}" alt="${product.productName}">
                        <h1>${product.productName}</h1>
                    </div>
                `;

                // 2. Prepare the store data
                const marketplaces = [
                    { name: 'Amazon', link: product.amazonLink, price: parseFloat(product.amazonPrice), type: 'standard' },
                    { name: 'Flipkart', link: product.flipkartLink, price: parseFloat(product.flipkartPrice), type: 'standard' },
                    { name: 'Zepto', link: product.zeptoLink, price: parseFloat(product.zeptoPrice), type: 'instant' },
                    { name: 'Blinkit', link: product.blinkitLink, price: parseFloat(product.blinkitPrice), type: 'instant' }
                ].filter(store => store.link && !isNaN(store.price));

                const standardStores = marketplaces.filter(s => s.type === 'standard');
                const instantStores = marketplaces.filter(s => s.type === 'instant');

                // 3. Render the Pincode checker IF there are instant stores
                if (instantStores.length > 0) {
                    pincodeContainer.innerHTML = `
                        <div class="pincode-checker">
                            <div class="header">Check for Instant Delivery</div>
                            <div class="pincode-input-group">
                                <input type="text" id="pincode-input" placeholder="Enter your pin code" maxlength="6">
                                <button id="pincode-check-btn">Check</button>
                            </div>
                            <div id="instant-delivery-options"></div>
                        </div>
                    `;
                    // Make the button work
                    document.getElementById('pincode-check-btn').addEventListener('click', function() {
                        const enteredPinCode = document.getElementById('pincode-input').value;
                        const optionsContainer = document.getElementById('instant-delivery-options');
                        if (serviceablePinCodes.includes(enteredPinCode)) {
                            optionsContainer.innerHTML = instantStores.map(store => createStoreLink(store, false)).join('');
                        } else {
                            optionsContainer.innerHTML = '<p class="availability-message">Sorry, instant delivery is not available here.</p>';
                        }
                    });
                }

                // 4. Render the standard stores list
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
                productInfoContainer.innerHTML = '<h1>Product Not Found</h1><p>The product ID in the link is invalid.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            productInfoContainer.innerHTML = '<h1>Error</h1><p>Could not load product data.</p>';
        });
});

function createStoreLink(store, isBestPrice) {
    const bestPriceBadge = isBestPrice ? '<span class="best-price-badge">BEST PRICE</span>' : '';
    const bestPriceClass = isBestPrice ? 'best-price' : '';
    return `
        <div class="store-link ${bestPriceClass}">
            <span class="store-name">${store.name} ${bestPriceBadge}</span>
            <span class="price">₹${store.price.toLocaleString('en-IN')}</span>
            <a href="${store.link}" target="_blank" class="buy-button">Buy Now →</a>
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