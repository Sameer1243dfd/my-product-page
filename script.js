document.addEventListener('DOMContentLoaded', function() {
    // --- IMPORTANT: This is your list of serviceable pin codes. YOU MUST EDIT THIS! ---
    const serviceablePinCodes = ["400001", "400002", "110001", "110021", "560001", "560038"]; // Add your pin codes here

    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCBq0sGvaMLJI-dylG7325ZFZ4cx6zC0ud4hrbIAbflYy4J7I5wpO_sDkIvmu1cziVbjyM5u_Nk5Yv/pub?output=csv';
    const productContainer = document.getElementById('product-container');

    const urlParams = new URLSearchParams(window.location.search);
    const productIDFromURL = urlParams.get('product');

    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvText => {
            const allProducts = csvToObjects(csvText);
            if (productIDFromURL) {
                const product = allProducts.find(p => p.productID === productIDFromURL);
                if (product) {
                    renderProductPage(product, productContainer, serviceablePinCodes);
                } else {
                    renderError(productContainer);
                }
            } else {
                renderError(productContainer);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            productContainer.innerHTML = '<p>Sorry, an error occurred.</p>';
        });
});

function renderProductPage(product, container, serviceablePinCodes) {
    // --- Store all available marketplaces in an array ---
    const marketplaces = [
        { name: 'Amazon', link: product.amazonLink, price: parseFloat(product.amazonPrice), type: 'standard', logo: 'YOUR_AMAZON_LOGO_URL' },
        { name: 'Flipkart', link: product.flipkartLink, price: parseFloat(product.flipkartPrice), type: 'standard', logo: 'YOUR_FLIPKART_LOGO_URL' },
        { name: 'Zepto', link: product.zeptoLink, price: parseFloat(product.zeptoPrice), type: 'instant', logo: 'YOUR_ZEPTO_LOGO_URL' },
        { name: 'Blinkit', link: product.blinkitLink, price: parseFloat(product.blinkitPrice), type: 'instant', logo: 'YOUR_BLINKIT_LOGO_URL' }
    ].filter(store => store.link && !isNaN(store.price));

    const standardStores = marketplaces.filter(s => s.type === 'standard');
    const instantStores = marketplaces.filter(s => s.type === 'instant');
    
    let bestPrice = Infinity;
    if(standardStores.length > 0) {
       bestPrice = Math.min(...standardStores.map(s => s.price));
    }

    // --- Build the static HTML parts of the page ---
    let innerHTML = `
        <div class="product-info">
            <h1>${product.productName}</h1>
            <p>${product.description}</p>
        </div>
        <div class="star-rating">
            <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div>
            Rated ${product.starRating} / 5 by 1,200+ happy customers.
        </div>
    `;

    // --- Add the NEW Pincode Checker HTML ---
    if (instantStores.length > 0) {
        innerHTML += `
            <div class="pincode-checker">
                <div class="header">Instant Delivery Available!</div>
                <div class="sub-header">Check if we deliver to your area in minutes.</div>
                <div class="pincode-input-group">
                    <input type="text" id="pincode-input" placeholder="Enter your 6-digit pin code" maxlength="6">
                    <button id="pincode-check-btn">Check</button>
                </div>
                <div id="instant-delivery-options"></div>
            </div>
        `;
    }

    // --- Add the standard delivery section ---
    if (standardStores.length > 0) {
        innerHTML += `
            <div class="delivery-section">
                <h2>Also available on:</h2>
                ${standardStores.map(store => createStoreLink(store, store.price === bestPrice)).join('')}
            </div>
        `;
    }
    
    container.innerHTML = innerHTML;

    // --- NOW, make the button work ---
    if (instantStores.length > 0) {
        const checkButton = document.getElementById('pincode-check-btn');
        const pincodeInput = document.getElementById('pincode-input');
        const optionsContainer = document.getElementById('instant-delivery-options');

        checkButton.addEventListener('click', function() {
            const enteredPinCode = pincodeInput.value;
            if (serviceablePinCodes.includes(enteredPinCode)) {
                // If pincode is valid, show the stores
                optionsContainer.innerHTML = instantStores.map(store => createStoreLink(store, false)).join('');
            } else {
                // If pincode is invalid, show a message
                optionsContainer.innerHTML = '<p class="availability-message">Sorry, instant delivery is not yet available for this pin code.</p>';
            }
        });
    }
}

// (The other functions like createStoreLink, renderError, csvToObjects remain the same as before)
function createStoreLink(store, isBestPrice) {
    const bestPriceClass = isBestPrice ? 'best-price' : '';
    return `
        <div class="store-link ${bestPriceClass}">
            <div class="store-info">
                <img src="${store.logo}" alt="${store.name} logo">
                <span class="store-name">${store.name} <span class="best-price-badge">BEST PRICE</span></span>
            </div>
            <div class="price">₹${store.price.toLocaleString('en-IN')}</div>
            <a href="${store.link}" target="_blank" class="buy-button">Buy Now →</a>
        </div>
    `;
}
function renderError(container) { container.innerHTML = `<div class="product-info"><h1>Product Not Found</h1><p>The link may be broken or the product may no longer be available.</p></div>`; }
function csvToObjects(csv) { const lines = csv.split('\n'); const headers = lines[0].split(',').map(h => h.trim()); const result = []; for (let i = 1; i < lines.length; i++) { if (lines[i]) { const obj = {}; const currentline = lines[i].split(','); for (let j = 0; j < headers.length; j++) { obj[headers[j]] = currentline[j] ? currentline[j].trim() : ''; } result.push(obj); } } return result; }