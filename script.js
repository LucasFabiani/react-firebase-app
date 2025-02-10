// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6KtEYggbGEEwwgHmBBSKKG8btyZ2UCek",
  authDomain: "chat-8b92c.firebaseapp.com",
  projectId: "chat-8b92c",
  storageBucket: "chat-8b92c.firebasestorage.app",
  messagingSenderId: "455208600273",
  appId: "1:455208600273:web:b7a07640117492d7d9fbf0",
  measurementId: "G-GVT8DEC70P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const chatRef = collection(db, "chat");


const auth = getAuth();
const provider = new GoogleAuthProvider();

let authenticated = false;

document.getElementById("login-btn").addEventListener("click", async () => {
  try {
    await auth.signOut(); // Cerrar sesión antes de intentar iniciar una nueva
    const result = await signInWithPopup(auth, provider)
    .then((result) => {
      // El usuario ha iniciado sesión
      const user = result.user;
      console.log("Nombre:", user.displayName); // Nombre de la cuenta
      console.log("Email:", user.email); // Correo electrónico
      console.log("Foto:", user.photoURL); // Foto de perfil (opcional)
    })
    .catch((error) => {
      console.error("Error en la autenticación:", error);
    });
    authenticated = true;
    console.log("Usuario autenticado:", result.user);
  } catch (error) {
    console.error("Error de autenticación:", error);
  }
});

// Enviar mensaje
async function sendMessage(user, message) {
  await addDoc(chatRef, {
    user,
    message,
    timestamp: new Date()
  });
}

// Escuchar mensajes en tiempo real
onSnapshot(query(chatRef, orderBy("timestamp", "asc")), (snapshot) => {
  if (!authenticated) return;
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";
  snapshot.forEach((doc) => {
    const msg = doc.data();
    chatBox.innerHTML += `<p><b>${msg.user}:</b> ${msg.message}</p>`;
  });
});

let input = document.getElementById('message');
input.addEventListener('keyup', function(e) {
  var keycode = e.keyCode || e.which;
  if (keycode == 13) {
    const user = auth.currentUser.displayName
    const message = input.value;
    sendMessage(user, message);
    input.value = "";
  }
});