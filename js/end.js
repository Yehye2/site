document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var room = params.get('room');

    if (room) {
        fetch(`/getObituaryInfoByRoom?room=${room}`)
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
        fetch(`/getobituarynoticeByRoom?room=${room}`)
            .then(response => response.json())
            .then(data => {
                // Update the HTML elements with the retrieved information
                document.getElementById('admission').textContent = data.obituary.admission;
                document.getElementById('funeralDate').textContent = data.obituary.funeralDate;
                document.getElementById('burialDate').textContent = data.obituary.burialDate;
                document.getElementById('bankAccount').textContent = data.obituary.bankAccount;
                // Room 값을 표시
                document.getElementById('room').textContent = `${room}호실`;
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
    var random = params.get('random');

    if (random) {
        fetch(`/getobituarynoticeByRandom?random=${random}`)
            .then(response => response.json())
            .then(data => {
                // Update the HTML elements with the retrieved information
                document.getElementById('bankAccount').textContent = data.obituary.bankAccount;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.log('userId parameter not found in URL.');
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

function submitCondolence() {
    // Redirect to a new page or display a message indicating that editing is no longer possible
    // For example:
    window.location.href = '/final_obituary_notice.html';
}

document.addEventListener('DOMContentLoaded', function () {
    var mapOptions = {
        center: new naver.maps.LatLng(34.802127781, 126.413207992165),
        zoom: 17
    };

    var map = new naver.maps.Map('map', mapOptions);
});

document.getElementById('copyAddressButton').addEventListener('click', function () {
    // 텍스트 요소에서 주소 가져오기
    var addressText = document.getElementById('funeral').innerText;

    // 임시 textarea 요소 생성
    var textarea = document.createElement('textarea');
    textarea.value = addressText;
    textarea.setAttribute('readonly', ''); // 읽기 전용으로 설정하여 사용자가 수정할 수 없도록 함
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px'; // 화면 밖으로 위치시킴
    document.body.appendChild(textarea);

    // 텍스트 선택 및 복사
    textarea.select();
    document.execCommand('copy');

    // 임시 요소 제거
    document.body.removeChild(textarea);

    // 사용자에게 복사가 완료되었음을 알리는 메시지 표시
    alert('주소가 복사되었습니다: ' + addressText);
});

document.addEventListener('DOMContentLoaded', function () {
    // 공유하기 버튼 클릭 이벤트 리스너 추가
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', function () {
            const shareModal = document.getElementById('shareModal');
            shareModal.classList.remove('hidden');
        });
    }

    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            const shareModal = document.getElementById('shareModal');
            shareModal.classList.add('hidden');
        });
    }

    const shareKakao = document.getElementById('shareKakao');
    if (shareKakao) {
        shareKakao.addEventListener('click', function () {
            // Fetch the Kakao API Key from the server
            fetch('/config')
                .then(response => response.json())
                .then(config => {
                    const KAKAO_APP_KEY = config.KAKAO_API_KEY;
                    console.log("Received KAKAO_APP_KEY:", KAKAO_APP_KEY);

                    // Initialize Kakao SDK with the fetched key
                    Kakao.init(KAKAO_APP_KEY);
                    console.log("Kakao SDK initialized with APP_KEY.");

                    // Fetch the obituary information
                    var params = new URLSearchParams(window.location.search);
                    var room = params.get('room');

                    if (room) {
                        fetch(`/getObituaryInfoByRoom?room=${room}`)
                            .then(response => response.json())
                            .then(data => {
                                // Extract the name from the data
                                var name = data.obituary.name;

                                Kakao.Link.sendDefault({
                                    objectType: 'feed',
                                    content: {
                                        title: '[부고알림] 목포효사랑장례식장',
                                        description: `故 ${name}님의 부고를 공유합니다.`,
                                        imageUrl: "https://img.freepik.com/premium-photo/white-chrysanthemum-flower-isolated-on-black-background_154565-58.jpg", // 공유할 이미지의 URL을 설정하세요.
                                        link: {
                                            mobileWebUrl: window.location.href,
                                            webUrl: window.location.href
                                        }
                                    },
                                    buttons: [
                                        {
                                            title: '웹으로 보기',
                                            link: {
                                                mobileWebUrl: window.location.href,
                                                webUrl: window.location.href
                                            }
                                        }
                                    ]
                                }).then(() => {
                                    console.log("Successfully shared.");
                                    const shareModal = document.getElementById('shareModal');
                                    shareModal.classList.add('hidden');
                                }).catch((error) => {
                                    console.error("Error while sharing: ", error);
                                });
                            })
                            .catch(error => {
                                console.error('Error fetching obituary information:', error);
                            });
                    } else {
                        console.log('room 파라미터가 URL에 없습니다.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching KAKAO_APP_KEY:', error);
                });
        });
    }

    const shareSMS = document.getElementById('shareSMS');
    if (shareSMS) {
        shareSMS.addEventListener('click', function () {
            var params = new URLSearchParams(window.location.search);
            var room = params.get('room');

            if (room) {
                Promise.all([
                    fetch(`/getObituaryInfoByRoom?room=${room}`).then(response => response.json()),
                    fetch(`/cheif_mourner?room=${room}`).then(response => response.json())
                ])
                    .then(([obituaryData, mournerData]) => {
                        // Extract the information from the data
                        var name = obituaryData.obituary.name;
                        var description = `故 ${name}님의 부고를 공유합니다.`;

                        var chiefMournerNames = mournerData.map(mourner => mourner.name).join(', ');
                        var roomNumber = obituaryData.obituary.room;

                        // Use SMS API or a web-to-SMS service
                        var smsBody = `${description}\n상주: ${chiefMournerNames}\n빈소: ${roomNumber}\n\n${window.location.href}`;
                        var smsUrl = `sms:?&body=${encodeURIComponent(smsBody)}`;

                        window.location.href = smsUrl;
                        const shareModal = document.getElementById('shareModal');
                        shareModal.classList.add('hidden');
                    })
                    .catch(error => {
                        console.error('Error fetching obituary information:', error);
                    });
            } else {
                console.log('room 파라미터가 URL에 없습니다.');
            }
        });
    }
});
