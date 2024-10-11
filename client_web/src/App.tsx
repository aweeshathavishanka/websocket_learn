import { useEffect, useState } from "react";

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string[]>([]); // This is an array of messages
  const [userMessage, setUserMessage] = useState<string>(""); // This should be a single string

  //connect to server
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");
    ws.onopen = () => {
      console.log("Connected to server");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log("Received a message from server: " + event.data);
      //Check if event.data is a blob and convert into string
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          setMessage((prevMessage) => [...prevMessage, text]);
        };

        reader.readAsText(event.data);
      } else if (typeof event.data === "string") {
        setMessage((prevMessage) => [...prevMessage, event.data]); // Fixed: event.data is used here
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!socket) {
    return (
      <div>
        <p>Connecting to the WebSocket Server</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-50 w-screen">
      <h1 className="text-3xl font-bold mb-4">Websocket Chat</h1>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg mb-4 p-2">
          {message.map(
            (
              msg,
              index // Changed 'message' to 'msg' for clarity
            ) => (
              <div
                key={index}
                className="p-2 border-b last:border-b-0 text-black">
                {msg}
              </div>
            )
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            value={userMessage} // This is now a string, not an array
            onChange={(e) => setUserMessage(e.target.value)} // e.target.value is a string
            className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={() => {
              if (userMessage.trim() !== "" && socket) {
                socket.send(userMessage); // Send the user message to the WebSocket server
                setUserMessage(""); // Clear the input after sending
              }
            }}
            className="bg-blue-500 text-white rounded-r-lg px-4 hover:bg-blue-600 transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
