document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로딩 시 상품 목록을 불러옵니다
    fetchProducts();

    // 새 상품 추가 처리
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.addEventListener('submit', handleAddProduct);
});

// 상품 목록 불러오기 및 표시
function fetchProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('product-list');
            productList.innerHTML = products.map(product => `
                <div class="product-item">
                    <span>${product.name} - $${product.price}</span>
                    <button onclick="deleteProduct(${product.Id})">Delete</button>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
}

// 상품 추가 폼 제출 처리
function handleAddProduct(event) {
    event.preventDefault();
    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    fetch('/add-product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: productName, price: productPrice })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            fetchProducts(); // 상품 목록을 새로고침합니다
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// 상품 삭제
function deleteProduct(productId) {
    fetch(`/api/products/${productId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                fetchProducts(); // 상품 목록을 새로고침합니다
            } else {
                console.error('Error deleting product');
            }
        })
        .catch(error => console.error('Error:', error));
}
