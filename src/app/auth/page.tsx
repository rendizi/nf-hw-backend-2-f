"use client"

import React, { useState } from 'react';
import {toast} from "react-toastify";

import {useRouter} from "next/navigation";

// Define the component as a Functional Component with TypeScript
const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter()

    // Function to handle form submission for login
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                toast("Login successfull");
                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("username", data.username);
                router.replace('/chats');
            } else {
                toast('Login Error:', data);
            }
        } catch (error) {
            toast('Request Failed:'+ error);
            setLoading(false);
        }
    };

    // Function to handle form submission for registration
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                // Handle successful registration
                toast('Registration Successful. Now press login');
            } else {
                // Handle errors
                toast('Registration Error:', data);
            }
        } catch (error) {
            toast('Request Failed:'+ error);
            setLoading(false);
        }
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form className="card-body" onSubmit={handleLogin}>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">username</span>
                            </label>
                            <input
                                type="text"
                                placeholder="username"
                                className="input input-bordered"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="password"
                                className="input input-bordered"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label className="label">
                                <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                            </label>
                        </div>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>
                    <form className="card-body" onSubmit={handleRegister}>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-secondary" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
