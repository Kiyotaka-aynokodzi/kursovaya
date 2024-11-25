document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('http://localhost:3000/api/products', {
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
        alert('Ошибка при добавлении продукта: ' + error.message);
    });
});

let selectedProducts = [];
    let itemCount = 0;

    async function loadProducts() {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();
        const productListDiv = document.getElementById('product-list');
        productListDiv.innerHTML = '';

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `  
                <h3 style="color: white;">${product.name}</h3>
                <p style="color: white;">Цена: ${product.price}₽</p>
                <img src="/backend/img/${product.image}" alt="${product.name}" style="width: 150px; height: 170px; background-color: black; padding-bottom: 20px;">
                <button class="buy-button" data-name="${product.name}" data-price="${product.price}">Купить</button>
            `;
            productListDiv.appendChild(productElement);
        });

        const buyButtons = document.querySelectorAll('.buy-button');
        buyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productName = e.target.getAttribute('data-name');
                const productPrice = e.target.getAttribute('data-price');
                selectedProducts.push({ name: productName, price: productPrice });
                itemCount++;
            });
        });
    }
loadProducts()


document.getElementById('searchButton').addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput').value;
    
    fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: searchInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Результаты поиска:', data.results);
        displayProducts(data.results); // Отображение результатов поиска
    })
    .catch((error) => {
        console.error('Ошибка:', error);
    });
});

function displayProducts(products) {
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <h3 style="color: black;">${product.name}</h3>
            <p style="color: black;">Цена: ${product.price}₽</p>
            <img src="/backend/img/${product.image}" alt="${product.name}" style="width: 100px; background-color: white;">
            <button id="banan" type="submit">купить</button>
        `;
        productListDiv.appendChild(productElement);
    });

    const buyButton = document.getElementById('banan');
const itemCountElement = document.getElementById('itemCount');

buyButton.addEventListener('click', () => {
    itemCount++;
    itemCountElement.textContent = itemCount;
});

}
// Открытие модального окна при нажатии на кнопку "Корзина".
document.getElementById('open-cart').addEventListener('click', () => {
    const cartItemsDiv = document.getElementById('cart-items');
    cartItemsDiv.innerHTML = '';
    selectedProducts.forEach(product => {
        cartItemsDiv.innerHTML += `<p>${product.name} - ${product.price}₽</p>`;
    });

    // Восстановление кнопки "Заказать" каждый раз при открытии модального окна.
    document.getElementById('order-button').style.display = 'block';
    document.getElementById('order-form').style.display = 'none'; // Скрываем форму для оформления заказа.

    // Показываем модальное окно.
    document.getElementById('myModal').style.display = 'block';
});

// Закрытие модального окна при нажатии на элемент с классом 'close'.
document.querySelector('.close').onclick = function() {
    document.getElementById('myModal').style.display = 'none';
}

// Закрытие модального окна при нажатии на само модальное окно (если это необходимо).
document.getElementById('myModal').addEventListener('click', (event) => {
    if (event.target === document.getElementById('myModal')) {
        document.getElementById('myModal').style.display = 'none';
    }
});

// Обработчик для кнопки заказа.
document.getElementById('order-button').addEventListener('click', () => {
    // Скрываем кнопку Заказа
    document.getElementById('order-button').style.display = 'none';
    
    // Показ формы для оформления заказа
    document.getElementById('order-form').style.display = 'block';
});

// Обработчик для кнопки оплаты.
document.getElementById('pay-button').addEventListener('click', () => {
    // Обработка данных из формы
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    
    // Здесь можно добавить код для обработки оплаты и отправки данных на сервер.
    console.log(`Имя: ${name}, Адрес: ${address}, Телефон: ${phone}`);
    
    // Скрываем форму после завершения платежа
    document.getElementById('order-form').style.display = 'none';
    document.getElementById('myModal').style.display = 'none'; // Закрываем модальное окно по завершению.
});





