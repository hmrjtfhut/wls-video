// scripts.js
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIhqkSEWYKlokRjW24YgzNefFiNCUkaMY",
    authDomain: "wls-videos-bd5d4.firebaseapp.com",
    databaseURL: "https://wls-videos-bd5d4-default-rtdb.firebaseio.com",
    projectId: "wls-videos-bd5d4",
    storageBucket: "wls-videos-bd5d4.appspot.com",
    messagingSenderId: "641099201066",
    appId: "1:641099201066:web:f00f68c5d24e1aa2a8a153"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

// Handle login functionality
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginButton')) {
        document.getElementById('loginButton').addEventListener('click', async () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            try {
                await auth.signInWithEmailAndPassword(email, password);
                window.location.href = 'index.html';
                document.getElementById('loginError').classList.add('hidden');
            } catch (error) {
                document.getElementById('loginError').textContent = 'Login failed: ' + error.message;
                document.getElementById('loginError').classList.remove('hidden');
            }
        });
    }

    // Handle sign-up functionality
    if (document.getElementById('signupButton')) {
        document.getElementById('signupButton').addEventListener('click', async () => {
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                window.location.href = 'login.html';
                document.getElementById('signupError').classList.add('hidden');
            } catch (error) {
                document.getElementById('signupError').textContent = 'Sign up failed: ' + error.message;
                document.getElementById('signupError').classList.remove('hidden');
            }
        });
    }

    // Handle video upload functionality
    if (document.getElementById('uploadButton')) {
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
    }

    // Load videos
    if (document.getElementById('videoList')) {
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

        loadVideos();
    }

    // Increment views for a video
    window.incrementViews = async function(videoId) {
        try {
            const videoRef = firestore.collection('videos').doc(videoId);
            const doc = await videoRef.get();
            const views = doc.data().views;
            await videoRef.update({ views: views + 1 });
            loadVideos();
        } catch (error) {
            console.error('Error updating views:', error);
        }
    };
});
