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

document.getElementById('saveButton').addEventListener('click', function () {
    event.preventDefault();

    const primaryMournerRelations = document.querySelectorAll('[name="primaryMournerRelation[]"]');
    const primaryMournerNames = document.querySelectorAll('[name="primaryMournerName[]"]');
    const mournerData = Array.from(primaryMournerRelations).map((element, index) => ({
        relation: element.value,
        name: primaryMournerNames[index].value
    }));

    // Gather data from form inputs
    var obituaryName = document.getElementById('obituaryName').value;
    var obituaryDateText = document.getElementById('obituaryDateText').value;
    var admission = document.getElementById('admission').value;
    var funeralDate = document.getElementById('funeralDate').value;
    var burialDate = document.getElementById('burialDate').value;
    var bankAccount = document.getElementById('bankAccount').value;
    var room = document.getElementById('room').value;


    // Data for /submit-obituary-info endpoint
    fetch('/submitroomobituaryinfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: obituaryName,
            date: obituaryDateText,
            room: room
        })
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });

    // Assume other variables (admission, funeralDate, etc.) are gathered similarly
    // Data for /saveRoomObituary endpoint
    fetch('/saveRoomObituary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            admission: admission, // This needs to be defined
            funeralDate: funeralDate, // This needs to be defined
            burialDate: burialDate, // This needs to be defined
            bankAccount: bankAccount, // This needs to be defined
            room: room, // This needs to be defined
        })
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });

    fetch('/addMourner', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            primaryMournerRelation: mournerData.map(data => data.relation),
            primaryMournerName: mournerData.map(data => data.name),
            room: room // room 변수를 여기에 추가합니다.
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 응답을 JSON으로 파싱합니다.
        })
        .then(data => {
            console.log(data);
            // 성공적으로 데이터를 전송한 후의 로직 (예: 페이지 새로고침, 사용자에게 알림 표시 등)
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