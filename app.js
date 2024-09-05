// app.js
// Import and configure Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIhqkSEWYKlokRjW24YgzNefFiNCUkaMY",
    authDomain: "wls-videos-bd5d4.firebaseapp.com",
    projectId: "wls-videos-bd5d4",
    storageBucket: "wls-videos-bd5d4.appspot.com",
    messagingSenderId: "641099201066",
    appId: "1:641099201066:web:d70dcb35093cfa77a8a153"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);

const uploadButton = document.getElementById('uploadButton');
const videoFile = document.getElementById('videoFile');
const videoTitle = document.getElementById('videoTitle');
const videoList = document.getElementById('videoList');

// Upload video function
uploadButton.addEventListener('click', async () => {
    const file = videoFile.files[0];
    const title = videoTitle.value;
    if (file && title) {
        const storageRef = ref(storage, `videos/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(firestore, 'videos'), {
            title: title,
            url: url
        });
        videoFile.value = '';
        videoTitle.value = '';
    }
});

// Display videos
onSnapshot(collection(firestore, 'videos'), (snapshot) => {
    videoList.innerHTML = '';
    snapshot.forEach((doc) => {
        const videoData = doc.data();
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');
        videoItem.innerHTML = `
            <h3>${videoData.title}</h3>
            <video controls>
                <source src="${videoData.url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        videoList.appendChild(videoItem);
    });
});
