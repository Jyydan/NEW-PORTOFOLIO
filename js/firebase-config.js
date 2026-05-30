// ═══════════════════════════════════════════════
// ═══ FIREBASE & EMAILJS CONFIGURATION ═══
// ═══════════════════════════════════════════════
//
// FIREBASE SETUP:
// 1. Buka https://console.firebase.google.com/
// 2. Buat project baru (atau gunakan yang sudah ada)
// 3. Buka Project Settings > General > Your apps > Web app (</> icon)
// 4. Register app, lalu copy firebaseConfig ke bawah
// 5. Buka Firestore Database > Create database > Start in test mode
// 6. Buka Storage > Get started > Start in test mode
// 7. Ganti semua 'YOUR_...' di bawah dengan config Anda
//
// EMAILJS SETUP:
// 1. Buka https://www.emailjs.com/ > Sign Up (gratis)
// 2. Email Services > Add New Service > Gmail > Connect
// 3. Email Templates > Create New Template
//    - Subject: "Pesan Portfolio dari {{from_name}}"
//    - Content: "Nama: {{from_name}}\nEmail: {{from_email}}\n\n{{message}}"
// 4. Account > API Keys > Copy Public Key
// 5. Ganti semua 'YOUR_...' di bawah

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyArf6nF46CmEQHIEEWGW7244vwGHbp37Tk",
    authDomain: "portofolio-jayyid-jiddan.firebaseapp.com",
    databaseURL: "https://portofolio-jayyid-jiddan-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "portofolio-jayyid-jiddan",
    storageBucket: "portofolio-jayyid-jiddan.firebasestorage.app",
    messagingSenderId: "40523417316",
    appId: "1:40523417316:web:2501bcb3d2e8a2d02f8ef1",
    measurementId: "G-2MSKZZ6MHB"
};

const EMAILJS_CONFIG = {
    serviceId: 'service_l1shjzr',
    templateId: 'template_seiwf5n',
    publicKey: 'TEGwiH6g9sSukEBtM'
};

// ═══ Initialize Firebase (Firestore only — no Storage needed) ═══
let db = null;
let firebaseReady = false;

try {
    if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY') {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        firebaseReady = true;
        console.log('🔥 Firebase Firestore connected');
    } else {
        console.warn('⚠️ Firebase not configured — using localStorage fallback');
    }
} catch (e) {
    console.error('Firebase init error:', e);
}

// ═══ Initialize EmailJS ═══
let emailjsReady = false;
try {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        emailjsReady = true;
        console.log('📧 EmailJS connected');
    }
} catch (e) {
    console.error('EmailJS init error:', e);
}
