const video = document.getElementById('video');
const recordButton = document.getElementById('record');
const stopButton = document.getElementById('stop');

let mediaRecorder;
let recordedChunks = [];

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });
            recordedChunks = [];
            uploadVideo(blob);
        };

        recordButton.addEventListener('click', () => {
            mediaRecorder.start();
            recordButton.disabled = true;
            stopButton.disabled = false;
        });

        stopButton.addEventListener('click', () => {
            mediaRecorder.stop();
            recordButton.disabled = false;
            stopButton.disabled = true;
        });
    })
    .catch(err => {
        console.error('Error accessing the camera:', err);
    });

function uploadVideo(blob) {
    const formData = new FormData();
    formData.append('video', blob, 'recorded-video.webm');

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
