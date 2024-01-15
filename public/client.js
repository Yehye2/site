document.getElementById('userInfoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // 입력된 데이터 가져오기
    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var account = document.getElementById('account').value.trim();
    var room = document.getElementById('room').value.trim();
    var relationship = document.getElementById('relationship').value.trim();

    // 이름과 전화번호가 비어있는지 검사
    if (name === '' || phone === '') {
        alert('이름과 전화번호는 필수 입력 사항입니다.');
        return; // 중요: 빈 필드가 있으면 여기서 함수 실행을 중단합니다.
    }

    // 서버에 데이터 보내기
    fetch('/saveUserData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, account, room, relationship }) // room 번호 포함
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);  // 서버로부터 받은 메시지를 알림으로 표시
            window.location.reload();  // 알림 확인 후 페이지 새로고침
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

function fetchUserData(room) {
    fetch(`/getUserData?room=${room}`)
        .then(response => response.json())
        .then(responseData => {
            var display = document.getElementById('userInfoDisplay');

            // 서버 응답의 'status'를 확인하고 'data' 배열 처리
            if (responseData.status === 'success' && Array.isArray(responseData.data)) {
                var table = '<table>';
                table += '<tr><th>이름</th><th>전화번호</th><th>계좌번호</th><th>호실</th><th>가족관계</th><th>문자발송</th><th>삭제</th><th>정보</th></tr>';
                responseData.data.forEach(function (user) {
                    table += '<tr>';
                    table += '<td>' + user.name + '</td>';
                    table += '<td>' + user.phone + '</td>';
                    table += '<td>' + user.account + '</td>';
                    table += '<td>' + user.room + '</td>';
                    table += '<td>' + user.relationship + '</td>';
                    table += '<td><button class="send-sms-button" data-phone="' + user.phone + '" data-userId="' + user.Id + '">문자 발송</button>';
                    table += '<td> <button onclick="deleteUserData(' + user.Id + ')">삭제</button></td>';
                    table += '<td><button onclick="showObituaryInfoModal(' + user.Id + ')">정보</button></td>';
                    table += '<td><button onclick="obituaryButton(' + user.Id + ')">부고장</button></td>';
                    table += '</tr>';
                });
                table += '</table>';
                display.innerHTML = table;
            } else {
                // 성공적인 'status'가 아니거나 'data'가 배열이 아닌 경우
                display.innerHTML = '사용자 데이터를 불러오는 데 실패했습니다.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function obituaryButton(userId) {
    window.location.href = 'obituary notice.html?userId=' + userId;
}

// room 번호별 버튼 클릭 이벤트 처리
document.querySelectorAll('.room-button').forEach(button => {
    button.addEventListener('click', function () {
        var room = this.getAttribute('data-room');
        fetchUserData(room);
    });
});

document.getElementById('userInfoDisplay').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('send-sms-button')) {
        var phoneNumber = e.target.getAttribute('data-phone');
        var userId = e.target.getAttribute('data-userId');
        sendMessage(phoneNumber, userId);
    }
});

function sendMessage(phoneNumber, userId) {
    var message = "http://192.168.219.110:5500/public/obituary%20notice.html?userId=" + userId; // 보낼 메시지 내용

    axios.post('/send-sms', { to: phoneNumber, text: message })
        .then(response => {
            if (response.data.status === 'success') {
                alert('문자가 발송되었습니다.');
            } else {
                alert('문자 발송 실패');
            }
        })
        .catch(error => {
            console.error(error);
            alert('문자 발송 중 오류가 발생했습니다.');
        });
}

function deleteUserData(userId) {
    axios.post('/delete-user', { id: userId })
        .then(response => {
            alert('사용자 데이터가 삭제되었습니다.');
            window.location.reload();
            // 여기에 페이지 새로고침 또는 사용자 목록 갱신 로직 추가
        })
        .catch(error => {
            console.error('Error:', error);
            alert('오류가 발생했습니다.');
        });
}

document.getElementById('closeObituaryInfoModal').addEventListener('click', function () {
    document.getElementById('obituaryInfoModal').style.display = 'none';
});

//I want to mark the date only for the year, month, and day.
function showObituaryInfoModal(userId) {
    fetch(`/getObituaryInfo?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            const nameInput = document.getElementById('obituaryName');
            const dateInput = document.getElementById('obituaryDateInput'); // 날짜 입력 필드
            const dateText = document.getElementById('obituaryDateText'); // 날짜 텍스트 필드
            const userIdInput = document.getElementById('obituaryUserId');
            const modal = document.getElementById('obituaryInfoModal');

            if (data.status === 'success') {
                nameInput.value = data.obituary.name;
                dateInput.value = data.obituary.date; // 날짜 입력 필드에 날짜 설정
                const date = new Date(data.obituary.date);
                const year = date.getFullYear(); // Extract the year from the date
                const month = date.getMonth() + 1; // Extract the month from the date (months are zero-based)
                const day = date.getDate(); // Extract the day from the date
                dateText.textContent = `${year}-${month}-${day}`; // Display the year, month, and day in the date text field
                dateText.style.display = 'block'; // 날짜 텍스트 표시
                dateInput.style.display = 'none'; // 날짜 입력 필드 숨김
                userIdInput.value = userId;
                document.getElementById('saveObituaryInfo').style.display = 'none'; // 정보 저장 버튼 숨김
                document.getElementById('editObituaryInfo').style.display = 'block'; // 정보 수정 버튼 표시
            } else {
                nameInput.value = '';
                dateInput.style.display = 'block'; // 날짜 입력 필드 표시
                dateText.style.display = 'none'; // 날짜 텍스트 숨김
                userIdInput.value = userId;
                document.getElementById('saveObituaryInfo').style.display = 'block'; // 정보 저장 버튼 표시
                document.getElementById('editObituaryInfo').style.display = 'none'; // 정보 수정 버튼 숨김
            }

            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.getElementById('obituaryInfoForm').addEventListener('submit', submitObituaryInfo);

function submitObituaryInfo(event) {
    event.preventDefault();
    var name = document.getElementById('obituaryName').value;
    var date = document.getElementById('obituaryDateInput').value;
    var userId = document.getElementById('obituaryUserId').value;

    fetch('/submit-obituary-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, date, userId })
    })
        .then(response => {
            if (response.headers.get('Content-Type').includes('application/json')) {
                return response.json();
            } else {
                return response.text();
            }
        })
        .then(data => {
            // 서버 응답을 alert로 표시
            alert(data.message || data);

            if (data.status === 'success') {
                // 저장이 완료되면 페이지를 새로고침합니다.
                window.location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// 페이지가 로드되면 사용자 데이터를 불러오는 함수를 호출합니다.
window.onload = function () {
    fetchUserData();
};
