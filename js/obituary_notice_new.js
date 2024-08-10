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
                    document.getElementById('room').textContent = `${room}호실`;

                    // 이미지 URL이 존재하면 이미지 요소에 설정
                    if (data.obituary.image) {
                        document.getElementById('obituaryImage').src = data.obituary.image;
                    } else {
                        // 이미지가 없으면 기본 이미지를 설정하거나 처리
                        document.getElementById('obituaryImage').src = 'https://img.freepik.com/premium-photo/white-chrysanthemum-flower-isolated-on-black-background_154565-58.jpg';
                    }
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

// document.addEventListener('DOMContentLoaded', function () {
//     var params = new URLSearchParams(window.location.search);
//     var userId = params.get('userId');

//     if (userId) {
//         fetch(`/getobituarynotice?userId=${userId}`)
//             .then(response => response.json())
//             .then(data => {
//                 // Update the HTML elements with the retrieved information
//                 document.getElementById('admission').textContent = data.obituary.admission;
//                 document.getElementById('funeralDate').textContent = data.obituary.funeralDate;
//                 document.getElementById('burialDate').textContent = data.obituary.burialDate;
//                 document.getElementById('bankAccount').value = data.obituary.bankAccount;
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//             });
//     } else {
//         console.log('userId parameter not found in URL.');
//     }
// });

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');
    var userId = params.get('userId');  // userId 가져오기

    if (room) {
        fetch(`/getobituarynoticeByRoom?room=${room}`)
            .then(response => response.json())
            .then(data => {
                // 기본 부고 정보 업데이트
                document.getElementById('admission').textContent = data.obituary.admission;
                document.getElementById('funeralDate').textContent = data.obituary.funeralDate;
                document.getElementById('burialDate').textContent = data.obituary.burialDate;
                document.getElementById('room').textContent = `${room}호실`;

                // userId가 있는 경우, 해당 유저의 계좌 정보 가져오기
                if (userId) {
                    fetch(`/getUserData?room=${room}`)
                        .then(response => response.json())
                        .then(userData => {
                            if (userData.status === 'success' && Array.isArray(userData.data)) {
                                var user = userData.data.find(u => u.Id == userId);
                                if (user) {
                                    document.getElementById('bankAccount').value = user.account;  // 유저 계좌 정보 설정
                                } else {
                                    console.error('해당 유저 ID에 맞는 데이터를 찾을 수 없습니다.');
                                }
                            } else {
                                console.error('사용자 데이터를 가져오는 데 실패했습니다.');
                            }
                        })
                        .catch(error => {
                            console.error('사용자 데이터 요청 중 에러 발생:', error);
                        });
                } else {
                    // userId가 없는 경우 기본 부고 데이터의 계좌 정보 설정
                    document.getElementById('bankAccount').value = data.obituary.bankAccount;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.log('URL에 room 파라미터가 없습니다.');
    }
});


document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');

    if (room) {
        fetch(`/cheif_mourner?room=${room}`)
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
                    mournerDiv.className = 'mourner flex items-center py-2';

                    const relationP = document.createElement('span');
                    relationP.textContent = `${relation} `;
                    relationP.className = 'text-gray-600 flex-shrink-0 w-20 font-bold';

                    const namesP = document.createElement('p');
                    namesP.textContent = names.join(', '); // 이름을 쉼표로 구분하여 나열
                    namesP.className = 'text-gray-800 ml-4 font-bold';

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

        // Log if any elements are missing
        if (!admissionElem) console.error('Admission element is missing');
        if (!funeralDateElem) console.error('Funeral Date element is missing');
        if (!burialDateElem) console.error('Burial Date element is missing');
        if (!bankAccountElem) console.error('Bank Account element is missing');

        // Generate a 4-digit random number
        const random = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem('random', random);

        // Only proceed if all elements are present
        if (admissionElem && funeralDateElem && burialDateElem && bankAccountElem) {
            const contentData = {
                random: random, // Use the generated random number
                admission: admissionElem.innerText,
                funeralDate: funeralDateElem.innerText,
                burialDate: burialDateElem.innerText,
                bankAccount: bankAccountElem.value
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

function submitCondolence() {
    // Retrieve the random value from localStorage
    const random = localStorage.getItem('random');
    // Retrieve the room value from the URL
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');

    if (random && room) {
        // Redirect to a new page using the room and random values
        window.location.href = '/end?room=' + room + '&random=' + random;
    } else {
        // Handle the case where either the random or room value is missing
        console.error('Random or Room value is missing');
    }
}

var mapOptions = {
    center: new naver.maps.LatLng(34.802127781, 126.413207992165),
    zoom: 17,
    disableNetworkBar: true
};

var map = new naver.maps.Map('map', mapOptions);