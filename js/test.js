document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData();
    const imageFile = document.querySelector('input[type="file"]').files[0];
    formData.append("image", imageFile);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.text())
        .then(data => {
            alert('이미지 업로드 성공: ' + data);
        })
        .catch(error => {
            console.error('업로드 중 오류 발생:', error);
            alert('이미지 업로드 실패');
        });
});
