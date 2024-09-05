// scripts.js
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIhqkSEWYKlokRjW24YgzNefFiNCUkaMY",
    authDomain: "wls-videos-bd5d4.firebaseapp.com",
    projectId: "wls-videos-bd5d4",
    storageBucket: "wls-videos-bd5d4.appspot.com",
    messagingSenderId: "641099201066",
    appId: "1:641099201066:web:d70dcb35093cfa77a8a153"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

// Show a specific section and hide others
function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// Login functionality
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showSection('upload');
        document.getElementById('loginError').classList.add('hidden');
    } catch (error) {
        document.getElementById('loginError').textContent = 'Login failed: ' + error.message;
        document.getElementById('loginError').classList.remove('hidden');
    }
});

// Sign up functionality
document.getElementById('signupButton').addEventListener('click', async () => {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showSection('login');
        document.getElementById('signupError').classList.add('hidden');
    } catch (error) {
        document.getElementById('signupError').textContent = 'Sign up failed: ' + error.message;
        document.getElementById('signupError').classList.remove('hidden');
    }
});

// Upload video functionality
document.getElementById('uploadButton').addEventListener('click', async () => {
    const file = document.getElementById('videoFile').files[0];
    const title = document.getElementById('videoTitle').value;
    if (file && title) {
        try {
            const storageRef = storage.ref(`videos/${file.name}`);
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();
            await firestore.collection('videos').add({
                title: title,
                url: url,
                views: 0,
                uploader: auth.currentUser.email
            });
            document.getElementById('videoTitle').value = '';
            document.getElementById('videoFile').value = '';
            loadVideos();
            document.getElementById('uploadError').classList.add('hidden');
        } catch (error) {
            document.getElementById('uploadError').textContent = 'Upload failed: ' + error.message;
            document.getElementById('uploadError').classList.remove('hidden');
        }
    } else {
        document.getElementById('uploadError').textContent = 'Please enter a title and select a file.';
        document.getElementById('uploadError').classList.remove('hidden');
    }
});

// Load videos
async function loadVideos() {
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = '';
    try {
        const querySnapshot = await firestore.collection('videos').get();
        querySnapshot.forEach((doc) => {
            const videoData = doc.data();
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.innerHTML = `
                <h3>${videoData.title}</h3>
                <video controls>
                    <source src="${videoData.url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <p>Views: ${videoData.views}</p>
                <button onclick="incrementViews('${doc.id}')">Watch</button>
            `;
            videoList.appendChild(videoItem);
        });
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// Increment views for a video
async function incrementViews(videoId) {
    try {
        const videoRef = firestore.collection('videos').doc(videoId);
        const doc = await videoRef.get();
        const views = doc.data().views;
        await videoRef.update({ views: views + 1 });
        loadVideos();
    } catch (error) {
        console.error('Error updating views:', error);
    }
}

// Show login page initially
showSection('login');

// Show the upload section after login
document.getElementById('homeLink').addEventListener('click', () => showSection('upload'));
document.getElementById('uploadLink').addEventListener('click', () => showSection('upload'));
document.getElementById('loginLink').addEventListener('click', () => showSection('login'));
document.getElementById('signupLink').addEventListener('click', () => showSection('signup'));

// Load videos when the page loads
window.onload = loadVideos;
