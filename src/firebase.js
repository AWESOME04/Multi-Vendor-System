// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadImage(file, path) {
    try {
        // Create file metadata including the content type
        const metadata = {
            contentType: 'image/jpeg',
        };

        // Create a storage reference
        const storageRef = ref(storage, path);

        // Upload the file and metadata
        const snapshot = await uploadBytes(storageRef, file, metadata);
        console.log('Uploaded image successfully:', snapshot.metadata.fullPath);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at:', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

module.exports = {
    storage,
    uploadImage
};