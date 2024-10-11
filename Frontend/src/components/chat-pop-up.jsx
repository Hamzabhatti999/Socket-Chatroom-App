import React, { useEffect, useState } from "react";
// import { IoSend } from "react-icons/io5";

function ChatPopup({ close, receiver, socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [typerId, setTyperId] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("sent-msg", {
        from: socket.id,
        to: receiver,
        text: message,
      });
      setMessage("");
      setIsTyping(false);
    }
  };
  const handleNewMessage = (data) => {
    setMessages((prevMessages) => {
      if (
        !prevMessages.some(
          (msg) => msg.msg === data.msg && msg.senderId === data.senderId
        )
      ) {
        return [...prevMessages, data];
      }
      return prevMessages;
    });
  };

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

  useEffect(() => {
    socket.emit("get-thread", { from: socket.id, to: receiver });
    socket.on("new-msg", handleNewMessage);
    socket.on("conversation", (data) => {
      setMessages(data);
    });
  }, [socket, receiver]);
  return (
    <div
      id="popup-modal"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={() => close(false)}
    >
      <div
        className="relative w-80 bg-white shadow-lg rounded-lg mt-4 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-500 text-white p-4 text-center font-bold">
          Chat
        </div>
        <div className="flex-1 p-4 overflow-y-auto max-h-64">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 rounded-md ${
                msg.senderId === socket.id
                  ? "bg-blue-200 text-right"
                  : "bg-gray-300 text-left"
              }`}
            >
              <p className="text-sm flex flex-col px-2">
                <strong>{msg.senderName}</strong>
                <span className=" mb-1">{msg.msg}</span>
              </p>
            </div>
          ))}
        </div>

        {isTyping && typingUser && (
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
              socket.emit("typing", { from: socket.id, to: receiver });
              setIsTyping(true);
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

export default ChatPopup;
