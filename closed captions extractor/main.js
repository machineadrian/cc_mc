let GoogleAuth;
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        'apiKey': 'AIzaSyBy7QFGqftN1BqTj-nywYluQkA8F1yZbME',  // Your API Key
        'clientId': '343266099187 a57dfeckp0ctms0pmd8apglpfhncbunb.apps.googleusercontent.com',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
        'scope': SCOPE
    }).then(() => {
        GoogleAuth = gapi.auth2.getAuthInstance();
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
        setSigninStatus();
        document.getElementById('signinButton').onclick = handleAuthClick;
        document.getElementById('extractYouTubeBtn').onclick = handleYouTubeExtraction;
    });
}

function handleAuthClick() {
    GoogleAuth.signIn();
}

function setSigninStatus() {
    const user = GoogleAuth.currentUser.get();
    const isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        document.getElementById('signinButton').style.display = 'none';
        document.getElementById('extractYouTubeBtn').style.display = 'block';
    } else {
        document.getElementById('signinButton').style.display = 'block';
        document.getElementById('extractYouTubeBtn').style.display = 'none';
    }
}

function updateSigninStatus() {
    setSigninStatus();
}

function handleYouTubeExtraction() {
    const youtubeURL = document.getElementById('youtubeURL').value;
    const videoId = extractYouTubeVideoID(youtubeURL);

    if (videoId) {
        fetchYouTubeCaptions(videoId);
    } else {
        alert('Invalid YouTube URL. Please try again.');
    }
}

function extractYouTubeVideoID(url) {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
}

function fetchYouTubeCaptions(videoId) {
    gapi.client.youtube.captions.list({
        'part': 'snippet',
        'videoId': videoId
    }).then(response => {
        if (response.result.items && response.result.items.length > 0) {
            const captionId = response.result.items[0].id;
            downloadCaption(captionId);
        } else {
            alert('No captions available for this video.');
        }
    }, error => {
        console.error('Error fetching YouTube captions:', error);
    });
}

function downloadCaption(captionId) {
    gapi.client.youtube.captions.download({
        'id': captionId,
        'tfmt': 'vtt'
    }).then(response => {
        document.getElementById('captionsText').textContent = response.body;
    }, error => {
        console.error('Error downloading caption:', error);
    });
}

// Local video handling
document.getElementById('videoUpload').addEventListener('change', function(event) {
    const videoFile = event.target.files[0];
    const videoElement = document.getElementById('localVideo');
    const trackElement = document.getElementById('localTrack');

    if (videoFile) {
        const videoURL = URL.createObjectURL(videoFile);
        videoElement.src = videoURL;
        trackElement.src = "";  // Reset the caption source
    }
});

document.getElementById('extractLocalBtn').addEventListener('click', function() {
    const trackElement = document.getElementById('localTrack');
    const captionsText = document.getElementById('captionsText');

    if (trackElement.track && trackElement.track.readyState === 2) {
        const track = trackElement.track;
        const cues = track.cues;
        let captionsContent = '';

        for (let i = 0; i < cues.length; i++) {
            captionsContent += `${cues[i].startTime.toFixed(2)} - ${cues[i].endTime.toFixed(2)}: ${cues[i].text}\n`;
        }

        captionsText.textContent = captionsContent;
    } else {
        alert('Captions are not loaded yet or not available. Please check your video file.');
    }
});

// Load the client library
handleClientLoad();
