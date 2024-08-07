document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');

    if (room) {
        // 서버에서 데이터를 가져오고 HTML 폼에 데이터를 채우는 함수 호출
        fetchDataAndPopulateForm(room);
    } else {
        console.log('room 파라미터가 URL에 없습니다.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');

    if (room) {
        // URL의 room 매개변수 값에 따라 해당하는 option 요소를 선택
        var roomSelect = document.getElementById('room');
        var deleteRoomInput = document.getElementById('deleteRoom');
        var roomOptions = roomSelect.options;

        for (var i = 0; i < roomOptions.length; i++) {
            if (roomOptions[i].value === room) {
                roomOptions[i].selected = true;
                deleteRoomInput.value = room; // deleteRoom에도 room 값을 설정
                break;
            }
        }
    } else {
        console.log('room 파라미터가 URL에 없습니다.');
    }

    // 서버에서 데이터를 가져오고 HTML 폼에 데이터를 채우는 함수 호출
    fetchDataAndPopulateForm(room);
});
// 서버에서 데이터를 가져와서 HTML 폼에 데이터를 채우는 함수
function fetchDataAndPopulateForm(room) {
    // 첫 번째 fetch 함수
    fetch(`/getObituaryInfoByRoom?room=${room}`)
        .then(response => response.json())
        .then(data => {
            // 날짜 정보를 받아옴
            var obituaryDate = data.obituary?.date;
            // 날짜가 있다면 HTML 폼에 채움
            if (obituaryDate) {
                var date = new Date(obituaryDate);
                var formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

                // HTML 폼에 데이터 채우기
                document.getElementById('obituaryName').value = data.obituary.name;
                document.getElementById('obituaryDateText').value = formattedDate;
            } else {
                console.log('날짜 정보가 없습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // 두 번째 fetch 함수
    fetch(`/getobituarynoticeByRoom?room=${room}`)
        .then(response => response.json())
        .then(data => {
            // HTML 폼에 데이터 채우기
            document.getElementById('admission').value = data.obituary.admission;
            document.getElementById('funeralDate').value = data.obituary.funeralDate;
            document.getElementById('burialDate').value = data.obituary.burialDate;
            document.getElementById('bankAccount').value = data.obituary.bankAccount;

            // State 값을 설정
            const stateSelect = document.getElementById('State');
            const stateValue = data.obituary.State;
            let stateOption = Array.from(stateSelect.options).find(option => option.value === stateValue);

            if (!stateOption) {
                stateOption = new Option(stateValue, stateValue);
                stateSelect.add(stateOption);
            }

            stateSelect.value = stateValue;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // 세 번째 fetch 함수
    fetch(`/cheif_mourner?room=${room}`)
        .then(response => response.json())
        .then(data => {
            // 상주 정보를 받아옴
            const mourners = Array.isArray(data) ? data : [data];
            const primaryMournersContainer = document.getElementById('primaryMourners');

            // 기존 상주 정보 삭제
            primaryMournersContainer.innerHTML = '';

            if (mourners.length === 0) {
                console.log('상주 정보가 없습니다.');
                return; // 상주 정보가 없으면 폼을 채우지 않고 함수 종료
            }

            // 상주 정보를 HTML 폼에 채움
            mourners.forEach(mourner => {
                const relationInput = document.createElement('input');
                relationInput.type = 'text';
                relationInput.name = 'primaryMournerRelation[]';
                relationInput.placeholder = '관계를 입력해주세요. 예: 아들';
                relationInput.value = mourner.relation;

                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.name = 'primaryMournerName[]';
                nameInput.placeholder = '이름을 입력해주세요. 예: 홍길동';
                nameInput.value = mourner.name;

                // HTML 폼에 상주 정보 추가
                primaryMournersContainer.appendChild(relationInput);
                primaryMournersContainer.appendChild(nameInput);
                primaryMournersContainer.appendChild(document.createElement('br'));
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function addMourner() {
    // 현재 입력 필드의 개수를 기반으로 새 ID 결정
    const newId = document.querySelectorAll('.form-group input').length / 2 + 1;

    // 상주 관계를 위한 새 입력 필드 생성
    const newRelationInput = document.createElement('input');
    newRelationInput.type = 'text';
    newRelationInput.name = 'primaryMournerRelation[]';
    newRelationInput.id = 'primaryMournerRelation' + newId;
    newRelationInput.placeholder = '관계를 입력해주세요. 예: 아들';

    // 상주 이름을 위한 새 입력 필드 생성
    const newNameInput = document.createElement('input');
    newNameInput.type = 'text';
    newNameInput.name = 'primaryMournerName[]';
    newNameInput.id = 'primaryMournerName' + newId;
    newNameInput.placeholder = '이름을 입력해주세요. 예: 홍길동';

    // 생성된 입력 필드를 문서에 추가
    const container = document.getElementById('primaryMourners');
    container.appendChild(newRelationInput);
    container.appendChild(newNameInput);
}

function removeMourner() {
    const container = document.getElementById('primaryMourners');
    const inputs = container.querySelectorAll('input[type="text"]');
    if (inputs.length >= 2) { // 최소 1쌍의 입력 필드를 유지하기 위해
        const lastInputIndex = inputs.length - 1;
        container.removeChild(inputs[lastInputIndex]); // 마지막 입력 필드 삭제
        container.removeChild(inputs[lastInputIndex - 1]); // 마지막 입력 필드에 대한 설명 삭제 (예: 이름을 입력해주세요)
        container.removeChild(container.lastElementChild); // 줄바꿈 요소(br) 삭제
    } else {
        console.log("삭제할 상주 입력 필드가 없습니다.");
    }
}

// 상주 입력칸 줄이는 버튼에 이벤트 리스너 추가

document.getElementById('saveButton').addEventListener('click', function (event) {
    event.preventDefault();

    const formData = new FormData();
    const form = document.getElementById('obituaryForm');

    // 필요한 필드만 선택하여 FormData 객체에 추가
    formData.append('obituaryImage', document.getElementById('obituaryImage').files[0]);
    formData.append('name', document.getElementById('obituaryName').value);
    formData.append('date', document.getElementById('obituaryDateText').value);
    formData.append('room', document.getElementById('room').value);

    const primaryMournerRelations = document.querySelectorAll('[name="primaryMournerRelation[]"]');
    const primaryMournerNames = document.querySelectorAll('[name="primaryMournerName[]"]');
    const mournerData = Array.from(primaryMournerRelations).map((element, index) => ({
        relation: element.value,
        name: primaryMournerNames[index].value
    }));

    // Gather data from form inputs
    var State = document.getElementById('State').value;
    var admission = document.getElementById('admission').value;
    var funeralDate = document.getElementById('funeralDate').value;
    var burialDate = document.getElementById('burialDate').value;
    var bankAccount = document.getElementById('bankAccount').value;
    var room = document.getElementById('room').value;

    // Data for /submit-obituary-info endpoint
    const fetchPromises = [
        fetch('/submitroomobituaryinfo', {
            method: 'POST',
            body: formData
        }),
        fetch('/saveRoomObituary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                State: State,
                admission: admission,
                funeralDate: funeralDate,
                burialDate: burialDate,
                bankAccount: bankAccount,
                room: room,
            })
        }),
        fetch('/addMourner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                primaryMournerRelation: mournerData.map(data => data.relation),
                primaryMournerName: mournerData.map(data => data.name),
                room: room
            })
        })
    ];

    Promise.all(fetchPromises)
        .then(responses => Promise.all(responses.map(r => r.text()))) // JSON 대신 text로 처리
        .then(data => {
            console.log(data); // 모든 데이터 로깅
            alert('모든 정보가 성공적으로 저장되었습니다.'); // 사용자에게 알림
            window.location.reload(); // 페이지 새로고침
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('deleteButton').addEventListener('click', deleteRoom);

function deleteRoom() {
    var roomNumber = document.getElementById('deleteRoom').value; // Get the room number from the input field
    fetch(`/deleteRoom`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room: roomNumber }) // Send the room number in the request body
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

// '수정' 버튼 클릭 시 실행되는 함수
document.getElementById('updateButton').addEventListener('click', function (event) {
    event.preventDefault(); // 기본 이벤트 동작 방지


    const formData = new FormData();
    const form = document.getElementById('obituaryForm');

    // 필요한 필드만 선택하여 FormData 객체에 추가
    formData.append('obituaryImage', document.getElementById('obituaryImage').files[0]);
    formData.append('name', document.getElementById('obituaryName').value);
    formData.append('date', document.getElementById('obituaryDateText').value);
    formData.append('room', document.getElementById('room').value);

    const primaryMournerRelations = document.querySelectorAll('[name="primaryMournerRelation[]"]');
    const primaryMournerNames = document.querySelectorAll('[name="primaryMournerName[]"]');
    const mournerData = Array.from(primaryMournerRelations).map((element, index) => ({
        relation: element.value,
        name: primaryMournerNames[index].value
    }));

    // Gather data from form inputs
    var State = document.getElementById('State').value;
    var admission = document.getElementById('admission').value;
    var funeralDate = document.getElementById('funeralDate').value;
    var burialDate = document.getElementById('burialDate').value;
    var bankAccount = document.getElementById('bankAccount').value;
    var room = document.getElementById('room').value;

    // 서버에 수정된 데이터 전송
    const fetchPromises = [
        fetch('/deleteMourner', {
            method: 'DELETE', // DELETE 메서드 사용
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room: room
            })
        }),
        fetch('/updateObituaryInfo', {
            method: 'PATCH',
            body: formData
        }),
        fetch('/updateRoomObituary', {
            method: 'PATCH', // PATCH 메서드 사용
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                State: State,
                admission: admission,
                funeralDate: funeralDate,
                burialDate: burialDate,
                bankAccount: bankAccount,
                room: room,
            })
        }),
        fetch('/addMourner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                primaryMournerRelation: mournerData.map(data => data.relation),
                primaryMournerName: mournerData.map(data => data.name),
                room: room
            })
        })
    ];

    // 모든 수정 작업 완료 후의 동작
    Promise.all(fetchPromises)
        .then(responses => Promise.all(responses.map(r => r.text()))) // JSON 대신 text로 처리
        .then(data => {
            console.log(data); // 모든 데이터 로깅
            alert('정보가 성공적으로 수정되었습니다.'); // 사용자에게 알림
            window.location.reload(); // 페이지 새로고침
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
