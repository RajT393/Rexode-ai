import { useEffect, useState } from "react";
import { Send, Menu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import {
  db,
  collection,
  addDoc,
  doc,
  getDoc
} from "./firebase"; // Firebase file from above
import { FixedSizeList } from "react-window";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [llmUrl, setLlmUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 Fetch LLM URL from Firebase config
  useEffect(() => {
    const fetchLlmUrl = async () => {
      try {
        const docRef = doc(db, "config", "llm_url");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLlmUrl(docSnap.data().value);
        } else {
          throw new Error("LLM URL not found in Firebase");
        }
      } catch (err) {
        setError(`Failed to load config: ${err.message}`);
        console.error("Firebase error:", err);
      }
    };
    fetchLlmUrl();
  }, []);

  // 💬 Save messages to Firebase chat_history
  useEffect(() => {
    const saveMessage = async () => {
      if (messages.length === 0) return;
      try {
        const latest = messages[messages.length - 1];
        await addDoc(collection(db, "chat_history"), {
          prompt: latest.prompt,
          response: latest.response,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    };
    saveMessage();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !llmUrl || isLoading) return;

    setIsLoading(true);
    setError(null);
    const newMsg = { prompt: input, response: "Thinking..." };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    try {
      const res = await fetch(`${llmUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();
      setMessages((prev) => [...prev.slice(0, -1), { prompt: input, response: data.response }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { prompt: input, response: `⚠️ Error: ${err.message || "API request failed"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const SidebarItem = ({ index, style }) => (
    <div style={style} className="p-2 rounded bg-zinc-700 mb-2 truncate">
      {messages[index].prompt.slice(0, 25)}
      {messages[index].prompt.length > 25 && "..."}
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-zinc-800 p-3 transition-all flex flex-col`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mb-4 p-2 hover:bg-zinc-700 rounded">
          <Menu />
        </button>
        {sidebarOpen && (
          <FixedSizeList
            height={window.innerHeight - 100}
            itemCount={messages.length}
            itemSize={50}
            width="100%"
            className="flex-1"
          >
            {SidebarItem}
          </FixedSizeList>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {error && <div className="bg-red-900 text-white p-2 text-center">{error}</div>}

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className="animate-fade-in">
              <div className="text-right text-zinc-400 text-sm">You</div>
              <div className="bg-blue-600 p-3 rounded-md max-w-xl ml-auto whitespace-pre-wrap">
                {msg.prompt}
              </div>
              <div className="text-left text-zinc-400 text-sm mt-2">Rexode</div>
              <div className="bg-zinc-700 p-3 rounded-md max-w-xl prose prose-invert">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{msg.response}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex p-4 bg-zinc-800">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Rexode a coding question..."
            className="flex-1 p-2 rounded bg-zinc-700 outline-none text-white"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className={`ml-2 px-4 py-2 rounded flex items-center ${
              isLoading ? "bg-zinc-600" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isLoading ? <span className="animate-spin">↻</span> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
