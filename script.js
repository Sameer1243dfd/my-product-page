document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================
    // YOUR GOOGLE SHEET URL (THIS IS CORRECT)
    // ==========================================================
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCBq0sGvaMLJI-dylG7325ZFZ4cx6zC0ud4hrbIAbflYy4J7I5wpO_sDkIvmu1cziVbjyM5u_Nk5Yv/pub?output=csv';

    const productContainer = document.getElementById('product-list-container');

    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvText => {
            productContainer.innerHTML = '';
            const products = csvToObjects(csvText);

            // We can remove the debugging line now
            // console.log(products); 

            products.forEach(product => {
                const productCard = document.createElement('div');
                // Added some better styling for the card
                productCard.style.border = '1px solid #eee';
                productCard.style.borderRadius = '8px';
                productCard.style.padding = '16px';
                productCard.style.marginBottom = '16px';
                productCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

                let innerHTML = `
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <img src="${product.imageURL}" alt="${product.productName}" style="max-width:100px; margin-right: 20px;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.2em;">${product.productName}</h2>
                            <p style="margin: 4px 0 0 0; color: #555;">${product.description}</p>
                        </div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">`;
                
                if (product.amazonLink && product.amazonPrice) {
                    innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 8px;">Amazon</td><td style="padding: 8px;">₹${product.amazonPrice}</td><td style="padding: 8px; text-align: right;"><a href="${product.amazonLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }
                if (product.flipkartLink && product.flipkartPrice) {
                    innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 8px;">Flipkart</td><td style="padding: 8px;">₹${product.flipkartPrice}</td><td style="padding: 8px; text-align: right;"><a href="${product.flipkartLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }
                if (product.zeptoLink && product.zeptoPrice) {
                    // --- THIS LINE IS NOW FIXED ---
                    innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 8px;">Zepto</td><td style="padding: 8px;">₹${product.zeptoPrice}</td><td style="padding: 8px; text-align: right;"><a href="${product.zeptoLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }
                 if (product.blinkitLink && product.blinkitPrice) {
                    // --- THIS LINE IS NOW FIXED ---
                    innerHTML += `<tr style="border-top: 1px solid #eee;"><td style="padding: 8px;">Blinkit</td><td style="padding: 8px;">₹${product.blinkitPrice}</td><td style="padding: 8px; text-align: right;"><a href="${product.blinkitLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }

                innerHTML += '</table>';
                productCard.innerHTML = innerHTML;
                productContainer.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
            productContainer.innerHTML = '<p>Sorry, we could not load our products right now.</p>';
        });
});

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