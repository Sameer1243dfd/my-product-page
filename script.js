document.addEventListener('DOMContentLoaded', function() {
    // This is your CORRECT Google Sheet URL.
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCBq0sGvaMLJI-dylG7325ZFZ4cx6zC0ud4hrbIAbflYy4J7I5wpO_sDkIvmu1cziVbjyM5u_Nk5Yv/pub?output=csv';
    const productContainer = document.getElementById('product-list-container');

    // This part reads the "secret message" from the link, like ?product=FG0001458
    const urlParams = new URLSearchParams(window.location.search);
    const productIDFromURL = urlParams.get('product');

    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvText => {
            productContainer.innerHTML = ''; // Clear the "Loading..." message
            const allProducts = csvToObjects(csvText);

            // This is the new, smart logic
            if (productIDFromURL) {
                // If the link has a product ID, find the ONE matching product
                const matchedProduct = allProducts.find(p => p.productID === productIDFromURL);
                if (matchedProduct) {
                    // If we found the product, show only that one
                    renderProductCard(matchedProduct, productContainer);
                } else {
                    // If the product ID in the link is wrong, show an error
                    productContainer.innerHTML = '<h2>Sorry, product not found!</h2><p>Please check the link and try again.</p>';
                }
            } else {
                // If the link has NO product ID, show ALL the products
                allProducts.forEach(product => {
                    renderProductCard(product, productContainer);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
            productContainer.innerHTML = '<p>Sorry, we could not load our products right now.</p>';
        });
});

// This function builds the HTML for a single product card
function renderProductCard(product, container) {
    const productCard = document.createElement('div');
    productCard.style.border = '1px solid #eee';
    productCard.style.borderRadius = '8px';
    productCard.style.padding = '24px';
    productCard.style.marginBottom = '24px';
    productCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    productCard.style.maxWidth = '600px';
    productCard.style.margin = '24px auto';


    let innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <img src="${product.imageURL}" alt="${product.productName}" style="max-width:120px; margin-right: 24px;">
            <div>
                <h2 style="margin: 0; font-size: 1.8em; line-height: 1.2;">${product.productName}</h2>
                <p style="margin: 4px 0 0 0; color: #555;">${product.description}</p>
            </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 1.1em;">`;
    
    // This part includes ALL your stores from your Google Sheet
    if (product.amazonLink && product.amazonPrice) {
        innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 12px 8px;">Amazon</td><td style="padding: 12px 8px;">₹${product.amazonPrice}</td><td style="padding: 12px 8px; text-align: right;"><a href="${product.amazonLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
    }
    if (product.amazonnowLink && product.amazonnowPrice) {
        innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 12px 8px;">Amazon Now</td><td style="padding: 12px 8px;">₹${product.amazonnowPrice}</td><td style="padding: 12px 8px; text-align: right;"><a href="${product.amazonnowLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
    }
    if (product.flipkartLink && product.flipkartPrice) {
        innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 12px 8px;">Flipkart</td><td style="padding: 12px 8px;">₹${product.flipkartPrice}</td><td style="padding: 12px 8px; text-align: right;"><a href="${product.flipkartLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
    }
    if (product.zomatoLink && product.zomatoPrice) {
        innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 12px 8px;">Zomato</td><td style="padding: 12px 8px;">₹${product.zomatoPrice}</td><td style="padding: 12px 8px; text-align: right;"><a href="${product.zomatoLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
    }
    if (product.zeptoLink && product.zeptoPrice) {
        innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 12px 8px;">Zepto</td><td style="padding: 12px 8px;">₹${product.zeptoPrice}</td><td style="padding: 12px 8px; text-align: right;"><a href="${product.zeptoLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
    }
    if (product.swiggyLink && product.swiggyPrice) {
        innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 12px 8px;">Swiggy</td><td style="padding: 12px 8px;">₹${product.swiggyPrice}</td><td style="padding: 12px 8px; text-align: right;"><a href="${product.swiggyLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
    }
    if (product.blinkitLink && product.blinkitPrice) {
        innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 12px 8px;">Blinkit</td><td style="padding: 12px 8px;">₹${product.blinkitPrice}</td><td style="padding: 12px 8px; text-align: right;"><a href="${product.blinkitLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
    }

    innerHTML += '</table>';
    productCard.innerHTML = innerHTML;
    container.appendChild(productCard);
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