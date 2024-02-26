const ws = new WebSocket('ws://localhost:3030');

ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.action === 'add') {
        addProductToList(data.product);
    }
};

document.getElementById('submitOrder').addEventListener('click', function () {
    const formData = new FormData(document.getElementById('orderForm'));
    const data = Object.fromEntries(formData.entries());

    // 이름 검증
    const name = data.name;
    const nameRegex = /^[가-힣]{2,8}$/; // 2~8자리 한글 이름 검사
    if (!nameRegex.test(name)) {
        alert('이름은 2글자에서 8글자 사이의 한글이어야 합니다.');
        return; // 함수 종료
    }

    // 전화번호 검증
    const phoneNumber = data.phoneNumber;
    const phoneRegex = /^\d{11}$/; // 11자리 숫자 검사
    if (!phoneRegex.test(phoneNumber)) {
        alert('전화번호는 11자리 숫자여야 합니다.');
        return; // 함수 종료
    }

    // 모든 검사를 통과한 경우, 주문 요청 전송
    fetch('/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert('주문이 완료되었습니다. 입금시 발송인 성함가 동일한 계좌번호로 입금해주세요.');
            window.location.reload();
        })
        .catch(error => console.error('Error:', error));
});



document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로딩 시 상품 목록을 불러옵니다
    fetchProducts();

    function fetchProducts() {
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                const productList = document.getElementById('product-list');
                productList.innerHTML = products.map(product => `
                <div class="product-item bg-gray-300 rounded p-4 text-center" style="position: relative;">
                <img src="${product.image}" alt="${product.name}">
                <div class="position-absolute" style="bottom: 10px; left: 10px; padding: 5px;">${product.name} - ${product.price}원</div>
            </div>
                `).join('');
            })
            .catch(error => console.error('Error:', error));
    }
});

document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const selectElement = document.getElementById('product');
            data.forEach(product => {
                const option = document.createElement('option');
                option.textContent = product.name;
                selectElement.appendChild(option);
            });
        })
        .catch(error => console.error('상품 정보를 불러오는 중 오류 발생:', error));
});