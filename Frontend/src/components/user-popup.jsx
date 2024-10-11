function UserPopup({ close, type, setName, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <>
      <div
        id="popup-modal"
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={() => close(false)}
      >
        <div
          className="relative p-4 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gray-200 rounded-lg shadow-lg border border-black">
            <h1 className="text-center font-bold mt-2 text-xl">
              {type === "Room" ? "Create Room" : "Register User"}
            </h1>

            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:bg-gray-300 rounded-lg p-1 focus:outline-none"
              onClick={() => close(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <form className="p-6" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter Name"
                onChange={(e) => setName(e.target.value)}
                className="mb-5 p-3 w-full text-lg rounded-md border border-gray-300 text-gray-700"
                required
              />
              <button
                type="submit" // Change to type="submit" to submit the form
                className="w-full text-white bg-green-600 hover:bg-green-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                {type === "Room" ? "Create Room" : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
export default UserPopup