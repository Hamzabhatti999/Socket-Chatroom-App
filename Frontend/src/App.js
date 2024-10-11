import React, { useEffect, useState } from "react";
import UserPopup from "./components/user-popup";
import { io } from "socket.io-client";
import useSocketEvent from "./hooks/socket-listener.hook";
import ChatPopup from "./components/chat-pop-up";
import RoomPopup from "./components/room-popup";
function App() {
  const [name, setName] = useState();
  const [popup, setPopup] = useState(false);
  const [chatPopup, setChatPopup] = useState(false);
  const [roomPopup, setRoomPopup] = useState(false);
  const [type, setType] = useState("");
  const [userId, setUserId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [socket, setSocket] = useState();
  const createRoom = () => {
    if (!users.find((val) => val.id === socket.id)) {
      alert("Please Create User First");
      return;
    }
    setPopup(true);
    setType("Room");
  };
  const rooms = useSocketEvent("room-list", socket);
  const users = useSocketEvent("user-list", socket);
  const createUser = () => {
    setPopup(true);
    setType("User");
  };
  const handleRegister = () => {
    const eventName = type === "Room" ? "create-room" : "create-user";
    socket.emit(eventName, { name });
    setPopup(false);
  };
  const handleJoinRoom = (room) => {
    if (!users.find((val) => val.id === socket.id)) {
      alert("Please Create User First");
      return;
    }
    setRoomPopup(true);
    setRoomName(room.name);
    setRoomId(room.id);
    if (!room.users?.includes(socket.id)) {
      socket.emit("join-room", { roomId: room.id });
    }
  };
  const handleStartChat = (id) => {
    if (!users.find((val) => val.id === socket.id)) {
      alert("Please Create User To Start Chat");
      return;
    }
    setChatPopup(true);
    setUserId(id);
  };
  useEffect(() => {
    const socket = io("http://localhost:8000");
    socket.on("connect", () => {
      setSocket(socket);
    });
    socket.emit("get-user-and-rooms");
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div className="flex justify-around mt-10">
        <div className="border border-gray-200 rounded-lg p-6 shadow-lg w-1/2 mr-5">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
            Users
          </h2>
          {users?.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center mb-4 border-b pb-2"
              >
                <span className="text-gray-700">{user.name}</span>
                {user.id !== socket.id && (
                  <button
                    onClick={() => handleStartChat(user.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Start Chat
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No Users available</p>
          )}
          {!users?.find((val) => val.id === socket.id) && (
            <button
              onClick={createUser}
              className="bg-blue-500 text-white w-full py-3 rounded-md mt-4 hover:bg-blue-600"
            >
              Create User
            </button>
          )}
        </div>
        <div className="border border-gray-200 rounded-lg p-6 shadow-lg w-1/2">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
            Rooms
          </h2>
          <div>
            {rooms?.length > 0 ? (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex justify-between items-center mb-4 border-b pb-2"
                >
                  <span className="text-gray-700">{room.name}</span>
                  <button
                    onClick={() => handleJoinRoom(room)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    {room.users?.includes(socket.id) ? "Open" : "Join"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No rooms available</p>
            )}
          </div>
          <button
            onClick={createRoom}
            className="bg-purple-500 text-white w-full py-3 rounded-md mt-4 hover:bg-purple-600"
          >
            Create a Room
          </button>
        </div>
      </div>

      {popup && (
        <UserPopup
          close={setPopup}
          type={type}
          setName={setName}
          onSubmit={handleRegister}
        />
      )}
      {chatPopup && (
        <ChatPopup close={setChatPopup} receiver={userId} socket={socket} />
      )}
      {roomPopup && (
        <RoomPopup
          close={setRoomPopup}
          roomName={roomName}
          roomId={roomId}
          socket={socket}
        />
      )}
    </>
  );
}

export default App;
