document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var userId = params.get('userId');

    if (userId) {
        fetch(`/getObituaryInfo?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                // 날짜를 년 월 일 형식으로 변환
                var date = new Date(data.obituary.date);
                var formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

                // 화면에 표시
                document.getElementById('obituaryName').textContent = data.obituary.name;
                document.getElementById('obituaryDateText').textContent = formattedDate;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.log('userId 파라미터가 URL에 없습니다.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');

    if (room) {
        fetch(`/getObituaryInfoByRoom?room=${room}`)
            .then(response => response.json())
            .then(data => {
                // 날짜를 년 월 일 형식으로 변환하기 전에 data.obituary가 존재하는지 확인
                if (data.obituary?.date) {
                    var date = new Date(data.obituary.date);
                    var formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

                    // 화면에 표시
                    document.getElementById('obituaryName').textContent = data.obituary.name;
                    document.getElementById('obituaryDateText').textContent = formattedDate;
                } else {
                    // 적절한 처리나 메시지 표시
                    console.log('날짜 정보가 없습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.log('room 파라미터가 URL에 없습니다.');
    }
});


document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var userId = params.get('userId');

    if (userId) {
        fetch(`/getobituarynotice?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                // Update the HTML elements with the retrieved information
                document.getElementById('admission').textContent = data.obituary.admission;
                document.getElementById('funeralDate').textContent = data.obituary.funeralDate;
                document.getElementById('burialDate').textContent = data.obituary.burialDate;
                document.getElementById('bankAccount').textContent = data.obituary.bankAccount;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.log('userId parameter not found in URL.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');

    if (room) {
        fetch(`/getobituarynoticeByRoom?room=${room}`)
            .then(response => response.json())
            .then(data => {
                // Update the HTML elements with the retrieved information
                document.getElementById('admission').textContent = data.obituary.admission;
                document.getElementById('funeralDate').textContent = data.obituary.funeralDate;
                document.getElementById('burialDate').textContent = data.obituary.burialDate;
                document.getElementById('bankAccount').textContent = data.obituary.bankAccount;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        // console.log('userId parameter not found in URL.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');

    if (room) {
        fetch(`/cheif_mourner?room=${room}`) // 오타 수정: chief_mourner
            .then(response => response.json())
            .then(data => {
                // 상주 정보를 담을 컨테이너
                const mournerContainer = document.getElementById('chiefMourner');
                // 기존 상주 정보 삭제
                mournerContainer.innerHTML = '';

                // 데이터 처리를 위한 배열 확인 및 변환
                let mourners = Array.isArray(data) ? data : [data];

                // relation에 따라 그룹화
                const mournerGroups = mourners.reduce((acc, mourner) => {
                    (acc[mourner.relation] = acc[mourner.relation] || []).push(mourner.name);
                    return acc;
                }, {});

                // 그룹화된 상주 정보 동적 추가
                Object.entries(mournerGroups).forEach(([relation, names], index) => {
                    const mournerDiv = document.createElement('div');
                    mournerDiv.className = 'mourner';
                    mournerDiv.style.display = 'flex';
                    mournerDiv.style.justifyContent = 'flex-start';
                    mournerDiv.style.alignItems = 'center';
                    mournerDiv.style.marginBottom = '10px';

                    const relationP = document.createElement('p');
                    relationP.textContent = `${relation}: `;
                    relationP.style.marginRight = '10px';

                    const namesP = document.createElement('p');
                    namesP.textContent = names.join(', '); // 이름을 쉼표로 구분하여 나열

                    mournerDiv.appendChild(relationP);
                    mournerDiv.appendChild(namesP);

                    mournerContainer.appendChild(mournerDiv);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});


document.addEventListener('DOMContentLoaded', (event) => {
    function saveContent() {
        const admissionElem = document.getElementById('admission');
        const funeralDateElem = document.getElementById('funeralDate');
        const burialDateElem = document.getElementById('burialDate');
        const bankAccountElem = document.getElementById('bankAccount');

        // Retrieve the user ID from URL parameters
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');

        // Log if any elements or the userId are missing
        if (!admissionElem) console.error('Admission element is missing');
        if (!funeralDateElem) console.error('Funeral Date element is missing');
        if (!burialDateElem) console.error('Burial Date element is missing');
        if (!bankAccountElem) console.error('Bank Account element is missing');
        if (!userId) console.error('User ID is missing');

        // Only proceed if all elements and the userId are present
        if (admissionElem && funeralDateElem && burialDateElem && bankAccountElem && userId) {
            const contentData = {
                userId: userId,
                admission: admissionElem.innerText,
                funeralDate: funeralDateElem.innerText,
                burialDate: burialDateElem.innerText,
                bankAccount: bankAccountElem.innerText
            };

            // Send the data to the server using the Fetch API
            fetch('/saveObituary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contentData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(responseData => {
                    console.log('Success:', responseData);
                    // Provide feedback to user or update the UI as needed
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }

    // Attach the saveContent function to the button click event
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveContent);
    } else {
        console.error('Save button does not exist in the DOM.');
    }
});

function getUserId() {
    // 현재 페이지의 URL을 가져옵니다.
    var url = window.location.href;
    // URL에서 쿼리 스트링을 가져옵니다.
    var queryString = url.split('?')[1];
    // 쿼리 스트링을 '&'를 기준으로 분할하여 배열로 만듭니다.
    var queryParams = queryString.split('&');
    // 유저 ID를 담을 변수를 선언합니다.
    var userId = null;

    // 각 쿼리 파라미터를 반복하여 userId를 찾습니다.
    for (var i = 0; i < queryParams.length; i++) {
        var param = queryParams[i].split('=');
        if (param[0] === 'userId') {
            // userId를 찾으면 해당 값을 변수에 저장하고 반복문을 종료합니다.
            userId = param[1];
            break;
        }
    }

    return userId;
}

function submitCondolence(userId) {

    // Redirect to a new page or display a message indicating that editing is no longer possible
    // For example:
    window.location.href = '/end?userId=' + userId;
}

