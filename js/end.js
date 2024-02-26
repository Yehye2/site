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

function submitCondolence() {

    // Redirect to a new page or display a message indicating that editing is no longer possible
    // For example:
    window.location.href = '/final_obituary_notice.html';
}