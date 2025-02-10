// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limitToLast, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
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
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const chatRef = collection(db, "chat");

let authenticatedUser = null; // Guarda el usuario autenticado

// Manejo de autenticación
document.getElementById("login-btn").addEventListener("click", async () => {
  try {
    await auth.signOut(); // Cerrar sesión antes de una nueva autenticación
    const result = await signInWithPopup(auth, provider);

    if (result.user) {
      authenticatedUser = result.user;
      console.log("Usuario autenticado:", authenticatedUser.displayName);
    }
  } catch (error) {
    console.error("Error de autenticación:", error);
  }
});

// Detectar cambios en la autenticación
onAuthStateChanged(auth, (user) => {
  authenticatedUser = user || null;
  console.log("Cambio de autenticación:", authenticatedUser?.displayName || "No autenticado");
});

// Escuchar mensajes en tiempo real
onSnapshot(query(chatRef, orderBy("timestamp", "asc"), limitToLast(25)), (snapshot) => {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = ""; // Limpiar antes de volver a insertar los mensajes

  snapshot.forEach((doc) => {
    const msg = doc.data();
    const userName = msg.user || "Anónimo"; // Si no hay usuario, mostrar "Anónimo"
    chatBox.innerHTML += `<p><b>${userName}:</b> ${msg.message}</p>`;
  });

  // Desplazar automáticamente al último mensaje
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Enviar mensaje con tecla Enter
let input = document.getElementById("message");
input.addEventListener("keyup", function (e) {
  if (e.key === "Enter" && input.value.trim()) {
    if (authenticatedUser) {
      sendMessage(authenticatedUser.displayName, input.value.trim());
    } else {
      console.error("Debe iniciar sesión para enviar mensajes.");
    }
    input.value = ""; // Limpiar input después de enviar
  }
});

// Función para enviar mensajes
async function sendMessage(user, message) {
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
