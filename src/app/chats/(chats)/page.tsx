'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from 'socket.io-client';

const socket = io('http://127.0.0.1:4000/');

interface Room {
    _id: string;
    room: string;
    participants: string[]; // Corrected type
    __v: number;
}

const Page: React.FC = () => {
    const [rooms, setRooms] = useState<Room[] | null>(null);
    const [roomId, setRoomId] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        // Fetch data from the server initially
        fetchRooms();
    }, []);

    const fetchRooms = () => {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token ? { Authorization: `${token}` } : {};

        fetch("http://127.0.0.1:4000/rooms", {
            headers
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: Room[]) => {
                console.log("Fetched data:", data);
                setRooms(data);
            })
            .catch((error) => console.error("Error fetching rooms:", error));
    };

    const createRoom = () => {
        socket.emit('create-room');

        socket.on('room-created', (newRoom: Room) => {
            console.log(newRoom);
            const token = localStorage.getItem('token');
            socket.emit('join-room', token, newRoom);
            fetchRooms();
        });
    };

    const joinRoom = () => {
        const token = localStorage.getItem('token');
        if (token && roomId.trim() !== "") {
            socket.emit('join-room', token, roomId);
            fetchRooms()
        }
    };

    return (
        <div className="h-screen">

            <div>
                <h1>Join room by id</h1>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button onClick={joinRoom} className="ml-5">Join Room</button>
                <button onClick={fetchRooms} className="ml-5">Refresh Rooms</button>
                <button onClick={createRoom} className="ml-5">Create New</button>

                <p>Click below to open chat</p>

                {rooms && rooms.length === 0 ? (
                    <p>No rooms available</p>
                ) : (
                    rooms && rooms.map((room) => (
                        <p key={room._id} onClick={() => router.push(`/chats/${room.room}`)}>
                            Room ID: {room.room}
                        </p>
                    ))
                )}
            </div>
        </div>
    );
};

export default Page;
