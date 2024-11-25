document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('http://localhost:3000/api/news', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        loadProducts(); 
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при добавлении новости: ' + error.message);
    });
});


async function loadProducts() {
    const response = await fetch('http://localhost:3000/api/news');
    const products = await response.json();
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
        <div style="width: 500px; height: 400px; background-color: black; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid rgb(247, 247, 247); border-radius: 10px;">
            <h3 style="color: white;">${product.name}</h3>
            <p style="color: white;"> ${product.description}</p>
            <img src="/backend/img/${product.image}" alt="${product.name}" style="width: 230px; height: 280px; background-color: white;">
        </div>
        `;
        productListDiv.appendChild(productElement);
    });
}
loadProducts()
