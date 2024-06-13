'use client'

import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const socket = io("http://localhost:4000");

interface PageProps {
    params: {
        id: number;
    };
}

interface Message {
    message: string;
    sender: string;
    createdAt: string;
}

const Chat: React.FC<PageProps> = (props) => {
    const id = props.params.id;
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        socket.emit("join-room", token, id);
        socket.emit("send-online", token, id);

        socket.on("online", ({ sender, room }) => {
            console.log(`Received online event: ${sender} is online in room ${room}`);
            toast(`${sender} is online`);
        });

        socket.on("offline", ({ sender, room }) => {
            console.log(`Received offline event: ${sender} is offline in room ${room}`);
            toast(`${sender} is offline`);
        });

        socket.on("messages", (messagesResp: any) => {
            console.log(messagesResp);
            setMessages(messagesResp);
        });

        socket.on("typing", ({ sender, room }) => {
            console.log(sender, room);
            toast(`${sender} is typing`);
        });

        socket.on("stop-typing", ({ sender, room }) => {
            console.log(sender, room);
            toast(`${sender} is stopped typing`);
        });

        socket.on("new-message", ({ message, sender, now }) => {
            console.log("Received new message", { message, sender, now });
            const newMessage: Message = {
                message: message,
                sender: sender,
                createdAt: now,
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            console.log("Cleaning up socket listeners");
            socket.emit("send-offline", token, id);
            socket.off("online");
            socket.off("messages");
            socket.off("new-message");
        };
    }, [id, token]);

    useEffect(() => {
        console.log("Messages updated:", messages);
    }, [messages]);

    const handleTyping = (input: string) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        socket.emit("send-typing", token, id);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("send-stop-typing", token, id);
        }, 1000); // Adjust debounce delay as needed
    };

    const handleMessageSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (messageInput.trim() === "") return;
        console.log("Sending message:", messageInput);
        socket.emit("send-message", token, messageInput, id);
        setMessageInput("");
    };

    const handleGoOffline = () => {
        socket.emit("send-offline", token, id);
        // Additional actions if needed after going offline
    };

    return (
        <div className="h-screen flex flex-col justify-between">
            <form onSubmit={handleMessageSubmit} className="flex">
                <input
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered input-warning flex-grow"
                    value={messageInput}
                    onChange={(e) => {
                        handleTyping(e.target.value);
                        setMessageInput(e.target.value);
                    }}
                />

                <button type="submit" className="btn btn-primary ml-2">
                    Send
                </button>
            </form>
            <button onClick={handleGoOffline} className="btn btn-danger mt-2">
                Go Offline
            </button>
            <div className="overflow-auto flex-grow">
                {messages &&
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`chat ${
                                username === message.sender ? "self" : "other"
                            }`}
                        >
                            <div className="chat-header">
                                {message.sender}
                                <time className="text-xs opacity-50">{message.createdAt}</time>
                            </div>
                            <div className="chat-bubble">{message.message}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Chat;
