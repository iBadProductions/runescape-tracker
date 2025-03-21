
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import DPSChart from "./components/DPSChart";
import useSocket from "./hooks/useSocket";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [dpsHistory, setDpsHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [flicker, setFlicker] = useState(false);

  const handleAuth = async (endpoint) => {
    const response = await fetch(\`http://localhost:5000/\${endpoint}\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      if (endpoint === "logout") {
        setUser(null);
      } else {
        setUser(username);
      }
    }
    alert(data.message);
  };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useSocket(socket, {
    item_drop: (data) => {
      setNotifications((prev) => [...prev, data.message]);
      if (Notification.permission === "granted") {
        new Notification("RuneScape Drop", { body: data.message });
      }
    },
    rare_drop: (data) => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 800);
      if (Notification.permission === "granted") {
        new Notification("🎉 RARE DROP!", {
          body: \`You received \${data.name} worth \${data.value.toLocaleString()} GP!\`,
        });
      }
    },
    dps_update: (data) => {
      const dpsValue = parseFloat(data.message.split(" ")[3]);
      setDpsHistory((prev) => [
        ...prev.slice(-9),
        { time: new Date().toLocaleTimeString(), dps: dpsValue },
      ]);
    },
  });

  return (
    <div className={\`min-h-screen relative \${flicker ? "flicker" : ""} bg-white dark:bg-gray-900 text-black dark:text-white p-6\`}>
      <h1 className="text-3xl font-bold text-center mb-6">RuneScape Character Tracker</h1>

      {!user ? (
        <div className="flex flex-col items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Username"
            className="p-2 rounded text-black"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded text-black"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => handleAuth("signup")} className="px-4 py-2 bg-blue-600 text-white rounded">Sign Up</button>
            <button onClick={() => handleAuth("login")} className="px-4 py-2 bg-green-600 text-white rounded">Log In</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl mb-2">Welcome, {user}!</h2>
          <button onClick={() => handleAuth("logout")} className="px-4 py-2 bg-red-600 text-white rounded">Log Out</button>
        </div>
      )}

      <DPSChart data={dpsHistory} />

      <div className="mt-6 w-full max-w-2xl">
        <h2 className="text-xl mb-2">Recent Item Drops</h2>
        <ul className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          {notifications.slice(-5).map((notif, index) => (
            <li key={index} className="p-2 border-b border-gray-300">{notif}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
