const ws = new WebSocket('ws://localhost:3030');

document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로딩 시 상품 목록을 불러옵니다
    fetchProducts();
    fetchOrder();

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
                    <span>${product.name} - ${product.price}원</span>
                    <button class="delete-button" onclick="deleteProduct(${product.Id})">삭제</button>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
}

// 상품 추가 폼 제출 처리
function handleAddProduct(event) {
    event.preventDefault();

    // 폼에서 상품 이름과 가격을 추출
    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    const productImage = document.getElementById('product-image').value;

    // 서버에 상품 추가 요청을 보냄
    fetch('/add-product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: productName, price: productPrice, image: productImage })
    })
        .then(response => response.json())
        .then(data => {
            // 웹소켓을 통해 상품 추가 정보를 전송
            ws.send(JSON.stringify({ action: 'add', product: { name: productName, price: productPrice, image: productImage } }));

            // 상품 목록을 새로고침
            fetchProducts();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// 페이지 로드 시 상품 목록 로딩
document.addEventListener('DOMContentLoaded', fetchProducts);

// 상품 추가 폼에 이벤트 리스너 추가
document.getElementById('product-list').addEventListener('submit', handleAddProduct);


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

//주문관리
function fetchOrder() {
    fetch('/order')
        .then(response => response.json())
        .then(products => {
            const ordersList = document.getElementById('orderDetails');
            ordersList.innerHTML = products.map(orders => `
                <div class="order-Details">
                <span class="order-name" data-order-id="${orders.Id}">${orders.name}</span>
                <button class="delete-button" onclick="deleteOrder(${orders.Id})">삭제</button>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async function (e) {
        if (e.target.matches('span.order-name')) {
            var orderId = e.target.getAttribute('data-order-id'); // Ensure your <span> has a 'data-order-id' attribute
            var modal = document.getElementById('myModal');
            var modalText = document.getElementById('modalText');
            modal.style.display = "block";

            try {
                const response = await fetch(`/order/${orderId}`);
                if (!response.ok) throw new Error('Network response was not ok.');
                const orderDetails = await response.json();

                // Constructing the modal text content from the order details
                modalText.textContent = `상품명: ${orderDetails.product}, 성함: ${orderDetails.name}, 전화번호: ${orderDetails.phoneNumber}, 주소: ${orderDetails.Address}`;
            } catch (error) {
                console.error('Fetch error:', error);
                modalText.textContent = 'Failed to load order details.';
            }
        }
    });
});

// 주문
function deleteOrder(orderId) {
    fetch(`/order/${orderId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                window.location.reload(); // 상품 목록을 새로고침합니다
            } else {
                console.error('Error deleting product');
            }
        })
        .catch(error => console.error('Error:', error));
}


// 모달 닫기 버튼
document.querySelector('.close').addEventListener('click', function () {
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
    // 모달 콘텐츠를 여기서 숨기는 코드를 추가할 필요가 없습니다.
    // modal.querySelector('#modalText').textContent = ''; // 이 줄을 제거하세요.
});