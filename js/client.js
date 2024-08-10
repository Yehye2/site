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
                table += '<tr><th>이름</th><th>전화번호</th><th>계좌번호</th><th>호실</th><th>가족관계</th><th>문자발송</th><th>카카오톡</th><th>삭제</th><td colspan="8"><button class="deleteAllUsers" data-room="' + room + '" onclick="deleteAll()">전체삭제</button></td></tr>';
                responseData.data.forEach(function (user) {
                    table += '<tr>';
                    table += '<td>' + user.name + '</td>';
                    table += '<td>' + user.phone + '</td>';
                    table += '<td>' + user.account + '</td>';
                    table += '<td>' + user.room + '</td>';
                    table += '<td>' + user.relationship + '</td>';
                    table += '<td><button class="send-sms-button" data-phone="' + user.phone + '" data-room="' + room + '" data-id="' + user.Id + '">문자 발송</button></td>';
                    table += '<td><button class="send-kakao-button" data-phone="' + user.phone + '" data-room="' + room + '" data-id="' + user.Id + '">알림톡 발송</button></td>';
                    table += '<td> <button onclick="deleteUserData(' + user.Id + ')">삭제</button></td>';
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

function deleteAll() {
    var room = document.querySelector('.deleteAllUsers').getAttribute('data-room'); // Get the room number from the data-room attribute of the button
    fetch(`/deleteAllUser`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room: room }) // Send the room number in the request body
    })
        .then(response => {
            if (response.ok) {
                window.location.reload(); // Refresh the page if the delete operation was successful
            } else {
                console.error('Error deleting room');
            }
        })
        .catch(error => console.error('Error:', error));
}

function obituaryButton(userId) {
    window.location.href = 'notice?userId=' + userId;
}

function roomObituaryButton(room) {
    window.location.href = 'notice?room=' + room;
}

document.querySelectorAll('.room-button, #notice').forEach(button => {
    button.addEventListener('click', function () {
        var room = this.getAttribute('data-room');

        // notice 버튼의 경우 room 번호가 없으므로 기본값 설정
        if (!room) {
            room = 'defaultRoom'; // 기본 룸 번호 또는 필요한 로직으로 설정
            this.setAttribute('data-room', room);
        }

        // notice 버튼 클릭 시 URL 변경
        if (this.id === 'notice') {
            window.location.href = 'new?room=' + room;
            return; // 함수 실행을 여기서 종료
        }

        // Fetch user data or perform other actions as needed
        // notice 버튼에 대해서는 fetchUserData 호출이 적절하지 않을 수 있으므로 조건문 추가
        if (this.id !== 'notice') {
            fetchUserData(room);
        }

        // Ensure the "부고장 생성" button is managed correctly
        manageObituaryButton(room);
    });
});

function manageObituaryButton(room) {
    // Check for an existing button
    let obituaryButton = document.querySelector('#obituaryButton');
    if (!obituaryButton) {
        obituaryButton = document.createElement('button');
        obituaryButton.id = 'roomButton'; // 버튼의 ID를 'obituaryButton'으로 변경하는 것이 더 적절할 수 있습니다.
        obituaryButton.textContent = '부고장 생성';
        document.body.appendChild(obituaryButton);
    }

    // Update the button's data-room attribute and click event listener
    obituaryButton.setAttribute('data-room', room);
    obituaryButton.onclick = function () {
        roomObituaryButton(room);
    };

    // Additionally, update the #notice button's data-room attribute
    let noticeButton = document.getElementById('notice');
    if (noticeButton) {
        noticeButton.setAttribute('data-room', room);
    }
}

let tableElement = document.querySelector('#userInfoDisplay'); // 테이블의 ID로 바꾸세요
let buttonHTML = '<button id="obituaryButton" data-room="' + room + '">부고장 확인</button>';
tableElement.insertAdjacentHTML('afterend', buttonHTML);

document.getElementById('userInfoDisplay').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('send-sms-button')) {
        var phoneNumber = e.target.getAttribute('data-phone');
        var room = e.target.getAttribute('data-room');
        var userId = e.target.getAttribute('data-id'); // 유저 ID 가져오기

        // /getObituaryInfoByRoom 요청을 보냅니다
        fetch(`/getObituaryInfoByRoom?room=${room}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.obituary) {
                    var name = data.obituary.name;
                    var room = data.obituary.room;

                    // Chief mourner 정보 요청을 추가합니다
                    return fetch(`/cheif_mourner?room=${room}`)
                        .then(response => response.json())
                        .then(mournersData => {
                            // API 응답 데이터를 올바르게 처리
                            if (Array.isArray(mournersData) && mournersData.length > 0) {
                                // 상주 정보 문자열 생성
                                var mournersString = mournersData.map(mourner => `${mourner.relation}: ${mourner.name}`).join(', ');

                                // sendMessage 함수에 필요한 데이터를 전달합니다
                                console.log('발송할 메시지:', mournersString);
                                sendMessage(phoneNumber, name, room, mournersString, userId); // 유저 ID 추가
                            } else {
                                console.error('상주 정보를 찾을 수 없습니다. 응답 데이터:', mournersData);
                                alert('상주 정보를 찾을 수 없습니다.');
                            }
                        })
                        .catch(error => {
                            console.error('상주 정보 요청 중 에러 발생:', error);
                            alert('상주 정보 요청 중 에러가 발생했습니다.');
                        });
                } else {
                    console.error('부고 정보를 찾을 수 없습니다. 응답 데이터:', data);
                    alert('부고 정보를 찾을 수 없습니다.');
                }
            })
            .catch(error => {
                console.error('요청 중 에러 발생:', error);
                alert('요청 중 에러가 발생했습니다.');
            });
    }
});


document.getElementById('userInfoDisplay').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('send-kakao-button')) {
        var phoneNumber = e.target.getAttribute('data-phone');
        var room = e.target.getAttribute('data-room');

        // /getObituaryInfoByRoom 요청을 보냅니다.
        fetch(`/getObituaryInfoByRoom?room=${room}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.obituary) {
                    var name = data.obituary.name;
                    var room = data.obituary.room;

                    // Chief mourner 정보 요청을 추가합니다
                    return fetch(`/cheif_mourner?room=${room}`)
                        .then(response => response.json())
                        .then(mournersData => {
                            // API 응답 데이터를 올바르게 처리
                            if (Array.isArray(mournersData) && mournersData.length > 0) {
                                // 상주 정보 문자열 생성
                                var mournersString = mournersData.map(mourner => `${mourner.relation}: ${mourner.name}`).join(', ');

                                // sendMessage 함수에 필요한 데이터를 전달합니다
                                console.log('발송할 메시지:', mournersString);
                                sendKakao(phoneNumber, name, room, mournersString);
                            } else {
                                console.error('상주 정보를 찾을 수 없습니다. 응답 데이터:', mournersData);
                                alert('상주 정보를 찾을 수 없습니다.');
                            }
                        })
                        .catch(error => {
                            console.error('상주 정보 요청 중 에러 발생:', error);
                            alert('상주 정보 요청 중 에러가 발생했습니다.');
                        });
                } else {
                    console.error('부고 정보를 찾을 수 없습니다. 응답 데이터:', data);
                    alert('부고 정보를 찾을 수 없습니다.');
                }
            })
            .catch(error => {
                console.error('요청 중 에러 발생:', error);
                alert('요청 중 에러가 발생했습니다.');
            });
    }
});

function sendMessage(phoneNumber, name, room, mournersString, userId) {  // userId 추가
    // mournersString의 각 관계를 줄바꿈으로 처리합니다.
    // 이를 위해 각 관계를 분리한 후 줄바꿈으로 조인합니다.
    var formattedMournersString = mournersString.split(', ').join('\n');

    var message = `
상주님,
모바일 부고장을 보내 드립니다.
[訃告]

故 ${name}님께서 별세 하셨기에 알려드립니다.

장소: 목포효사랑장례식장 / ${room}호실

상주
${formattedMournersString}

아래 버튼으로
부고장을 확인하고
조의금 계좌를 수정하여
지인분들께
부고장을 공유하실 수 있습니다.

[부고장](https://port-0-site-754g42alukrlrej.sel5.cloudtype.app/notice?room=${room}&userId=${userId})
`;

    console.log('발송할 메시지:', message);  // 디버깅용 로그

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


function sendKakao(phoneNumber, name, room, mournersString) {
    var formattedMournersString = mournersString.split(', ').join('\n');
    var message = room; // 'room' 변수의 값을 URL에 추가

    axios.post('/send-kakao', {
        to: phoneNumber,
        text: message,
        name: name,
        room: room,
        mournersString: formattedMournersString // 필요한 경우 서버로 mournersString 데이터를 보냅니다.
    })
        .then(response => {
            if (response.data.status === 'success') {
                alert('알림톡이 발송되었습니다.');
            } else {
                alert('알림톡 발송 실패');
            }
        })
        .catch(error => {
            console.error(error);
            alert('알림톡 발송 중 오류가 발생했습니다.');
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
