// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6KtEYggbGEEwwgHmBBSKKG8btyZ2UCek",
  authDomain: "chat-8b92c.firebaseapp.com",
  projectId: "chat-8b92c",
  storageBucket: "chat-8b92c.firebasestorage.app",
  messagingSenderId: "455208600273",
  appId: "1:455208600273:web:b7a07640117492d7d9fbf0",
  measurementId: "G-GVT8DEC70P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const chatRef = collection(db, "chat");
const auth = getAuth();
const provider = new GoogleAuthProvider();

let authenticated = false;

// Botón de inicio de sesión
document.getElementById("login-btn").addEventListener("click", async () => {
  try {
    await auth.signOut(); // Cerrar sesión antes de iniciar una nueva
    const result = await signInWithPopup(auth, provider);

    if (result.user) {
      console.log("Nombre:", result.user.displayName); 
      console.log("Email:", result.user.email);
      console.log("Foto:", result.user.photoURL);
      authenticated = true;
      console.log("Usuario autenticado:", result.user);
    }
  } catch (error) {
    console.error("Error de autenticación:", error);
    authenticated = false; // Asegurar que no se marque como autenticado si falla
  }
});

// Función para enviar mensajes
async function sendMessage(user, message) {
  if (!user || !message.trim()) return;
  
  try {
    await addDoc(chatRef, {
      user,
      message,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
}

// Escuchar autenticación en tiempo real
onAuthStateChanged(auth, (user) => {
  if (user) {
    authenticated = true;
  } else {
    authenticated = false;
  }
});

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

// Enviar mensaje con tecla Enter
let input = document.getElementById('message');
input.addEventListener('keyup', function(e) {
  if (e.key === "Enter") {
    const user = auth.currentUser ? auth.currentUser.displayName : "Anónimo";
    const message = input.value.trim();
    
    if (message) {
      sendMessage(user, message);
      input.value = "";
    }
  }
});
