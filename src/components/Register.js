import React, { useState } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

function Register({ onRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const handleRegister = async (e) => {
        e.preventDefault();

        const response = await fetch(`${apiUrl}/auth/register`, {
            method: "POST",
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('登録完了!');
            onRegister(data.token, username); // 登録後にログイン処理を呼び出す
        } else {
            alert(data.message);
        }
    };

    return (
    <form onSubmit={handleRegister}>
        <label>Username:</label>
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <label>Password:</label>
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit" className="btn btn__primary">Register</button>
    </form>
  );
}

export default Register;