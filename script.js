document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================
    // PASTE YOUR MAGIC KEY (THE GOOGLE SHEET URL) INSIDE THE QUOTES BELOW
    // ==========================================================
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCBq0sGvaMLJI-dylG7325ZFZ4cx6zC0ud4hrbIAbflYy4J7I5wpO_sDkIvmu1cziVbjyM5u_Nk5Yv/pub?output=csv';

    const productContainer = document.getElementById('product-list-container');

    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvText => {
            productContainer.innerHTML = '';
            const products = csvToObjects(csvText);

            // THIS IS THE NEW LINE FOR DEBUGGING
            console.log(products);

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.style.border = '1px solid #ccc';
                productCard.style.padding = '16px';
                productCard.style.marginBottom = '16px';

                let innerHTML = `
                    <img src="${product.imageURL}" alt="${product.productName}" style="max-width:150px; float:left; margin-right:15px;">
                    <h2>${product.productName}</h2>
                    <p>${product.description}</p>
                    <table style="width:100%;">`;
                
                if (product.amazonLink && product.amazonPrice) {
                    innerHTML += `<tr><td>Amazon</td><td>₹${product.amazonPrice}</td><td><a href="${product.amazonLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }
                if (product.flipkartLink && product.flipkartPrice) {
                    innerHTML += `<tr><td>Flipkart</td><td>₹${product.flipkartPrice}</td><td><a href="${product.flipkartLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }
                if (product.zeptoLink && product.zeptoPrice) {
                    innerHTML += `<tr><td>Zepto</td><td>₹${product.zeapoPrice}</td><td><a href="${product.zeptoLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }
                 if (product.blinkitLink && product.blinkitPrice) {
                    innerHTML += `<tr><td>Blinkit</td><td>₹${product.blinkitPrice}</td><td><a href="${product.blinkitLink}?utm_source=product_page" target="_blank">Buy Now</a></td></tr>`;
                }

                innerHTML += '</table><div style="clear:both;"></div>';
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