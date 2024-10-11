import React, { useEffect, useState } from "react";

function RoomPopup({ close, roomName, roomId, socket }) {
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState("");
  const [messages, setMessages] = useState([]);
  const [show, setShow] = useState(true);
  const [typingUser, setTypingUser] = useState("");
  const [typerId, setTyperId] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("send-room-message", {
        senderId: socket.id,
        roomId: roomId,
        message: message,
      });
      setMessage("");
    }
  };
  const handleLeave = () => {
    socket.emit("leave-room", { roomId, userId: socket.id });
    close(false);
  };
  useEffect(() => {
    socket.emit("fetch-messages", { roomId });
    socket.on("room-messages", (data) => {
      setMessages(data);
    });
    socket.on("receive-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    socket.on("notify", (data) => {
      const { text } = data;
      setShow(true);
      setNotification(text);
    });
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [notification]);
  useEffect(() => {
    socket.on("user-typing", (data) => {
      const { name, id } = data;
      setTypingUser(name);
      setTyperId(id);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setTypingUser("");
      }, 2000);
    });
  }, [socket]);
  return (
    <div
      id="popup-modal"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 border"
      onClick={() => close(false)}
    >
      <div
        className="relative w-96 bg-white shadow-lg rounded-lg mt-4 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-500 flex justify-between p-2 items-center text-white">
          <p className="text-white font-semibold capitalize">{roomName}</p>
          <div>
            <button
              onClick={handleLeave}
              className="bg-red-700 rounded-md py-1 px-2 text-center text-sm"
            >
              {" "}
              Leave
            </button>
          </div>
        </div>
        <div
          className={`flex justify-center z-50 ${
            show ? "opacity-100" : "opacity-0 transition-opacity duration-500"
          }`}
        >
          {notification && (
            <p className="text-sm bg-gray-700 text-center text-white p-2 m-2  rounded-md max-w-fit ">
              {notification}
            </p>
          )}
        </div>
        <div className="p-4 overflow-y-auto max-h-64">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-md mb-2 ${
                msg.senderName === "System"
                  ? "bg-gray-500 text-center text-white"
                  : msg.senderId === socket.id
                  ? "bg-blue-200 text-right"
                  : "bg-gray-200 text-left"
              }`}
            >
              <p className={`text-sm flex flex-col px-2 py-1`}>
                {msg.senderName !== "System" && (
                  <strong>{msg.senderName}</strong>
                )}
                <span>{msg.message}</span>
              </p>
            </div>
          ))}
        </div>
        {isTyping && typerId !== socket.id && (
          <span className="text-gray-500 mx-3 italic text-sm">
            {typingUser} is typing...
          </span>
        )}
        <form
          onSubmit={sendMessage}
          className="p-3 bg-gray-100 flex items-center"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(true);
              socket.emit("room-typing", { userId: socket.id, roomId });
            }}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default RoomPopup;
