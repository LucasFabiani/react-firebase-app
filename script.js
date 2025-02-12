// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, limitToLast, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
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

const chatBox = document.getElementById("chat-box");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

let authenticatedUser = null; // Guarda el usuario autenticado
let unsubscribe = null;

// Manejo de autenticación
loginBtn.addEventListener("click", async () => {
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

// Salir de la cuenta
logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut(); // Cerrar sesión antes de una nueva autenticación
  } catch (error) {
    console.error("Error al salir:", error);
  }
})

// Detectar cambios en la autenticación
onAuthStateChanged(auth, (user) => {
  authenticatedUser = user || null;
  
  if (user) {
    console.log("Usuario autenticado: ", user);
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'flex';

    if (unsubscribe) {
      unsubscribe();
    }
  
    const chatRef = collection(db, "chat");
    const chatQuery = query(chatRef, orderBy("timestamp", "desc"), limit(25));
  
    unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      chatBox.innerHTML = "";
  
      const messages = [];
      snapshot.forEach((doc) => {
        const msg = doc.data();
        messages.push(msg);
      });

      // Ordenar en orden ascendente para mostrar de más antiguo a más reciente
      messages.reverse();

      messages.forEach((msg) => {
        const userName = msg.user || "Anónimo";
        const messageElement = document.createElement("p");
        messageElement.innerHTML = `<b>${userName}:</b> ${msg.message}`;
        chatBox.appendChild(messageElement);
      })
    }, (err) => {
      console.log("Error en snapshot: ", error);
    })
  } else {
    console.log("Sesion terminada");
    chatBox.innerHTML = "";
    loginBtn.style.display = 'flex';
    logoutBtn.style.display = 'none';

    // Si el usuario cierra sesión, detenemos el listener
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }
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
    const chatRef = collection(db, "chat");

    await addDoc(chatRef, {
      user,
      message,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
}
