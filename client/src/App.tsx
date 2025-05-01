
import { useState, useEffect, useRef } from "react";
import { useMirrorverseAI, MirrorPersona } from "./hooks/useMirrorverseAI";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";
import { usePersonaChat } from "./hooks/usePersonaChat";
import "./App.css";


function App() {
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<MirrorPersona | null>(null);
  const [savedPersonas, setSavedPersonas] = useState<MirrorPersona[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const { generatePersonaStreamed, streamedText, generateImageFromPersona } = useMirrorverseAI();
  const menuRef = useRef<(HTMLDivElement | null)[]>([]);
  const [evolvingPersonaTitle, setEvolvingPersonaTitle] = useState<string | null>(null);
  const [evolvingPersonaIndex, setEvolvingPersonaIndex] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPersona, setChatPersona] = useState<MirrorPersona | null>(null);
  const chatModalRef = useRef<HTMLDivElement | null>(null);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  const {
    messages,
    loadingchat,
    error,
    sendMessage,
    clearChat,
  } = usePersonaChat(chatPersona?.backstory || "");





  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        openMenuIndex !== null &&
        menuRef.current[openMenuIndex] &&
        !menuRef.current[openMenuIndex].contains(event.target)
      ) {
        setOpenMenuIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIndex]);

  useEffect(() => {
    function handleModalClickOutside(event: MouseEvent) {
      if (
        isChatOpen &&
        chatModalRef.current &&
        !chatModalRef.current.contains(event.target as Node)
      ) {
        setIsChatOpen(false);
      }
    }

    document.addEventListener("mousedown", handleModalClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleModalClickOutside);
    };
  }, [isChatOpen]);



  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  

  const buildPromptFromPersona = (persona: MirrorPersona): string => {
    return `${persona.aesthetic}`;
  };


  const handleGenerate = async () => {
    setLoading(true);
    // setPersona(null);
    try {
      const inputToUse = evolvingPersonaTitle && persona?.inputPrompt
        ? `${persona.inputPrompt} and ${input}`
        : input;

      const parsed = await generatePersonaStreamed(inputToUse);
      setPersona(parsed);
      console.log("Generated Persona", parsed);

      const prompt = buildPromptFromPersona(parsed);
      const imageData = await generateImageFromPersona(inputToUse + " " + prompt);
      console.log("Image Data", imageData);
      setImageData(imageData);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
      setEvolvingPersonaTitle(null);
      // setEvolvingPersonaIndex(null);
    }
  };



  const handleCollect = () => {
    if (persona) {
      setSavedPersonas((prev) => {
        if (evolvingPersonaIndex !== null) {
          const updated = [...prev];
          updated[evolvingPersonaIndex] = persona;
          return updated;
        }
        return [persona, ...prev];
      });

      setPersona(null);
      setInput("");
      setEvolvingPersonaIndex(null);
      setEvolvingPersonaTitle(null);
      inputRef.current?.focus();
    }
  };


  const handleDeletePersona = (index: number) => {
    setSavedPersonas((prev) => prev.filter((_, idx) => idx !== index));
    setOpenMenuIndex(null);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    clearChat();
  };


  const handleEvolvePersona = (persona: MirrorPersona, index: number) => {
    inputRef.current?.focus();
    setPersona(persona);
    setEvolvingPersonaTitle(persona.title);
    setEvolvingPersonaIndex(index);
    setOpenMenuIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/30 p-4 border-r border-white/10 overflow-y-auto relative space-y-3">
        <h2 className="text-lg font-bold mb-4 text-indigo-300">🧬 Collected Personas</h2>
        {savedPersonas.map((persona, idx) => (
          <div
            key={idx}
            className="group relative bg-white/5 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-white/10 transition-all duration-300 border border-white/10"
          >
            <div className="flex justify-between items-center">
              <span className="block truncate max-w-[160px]">{persona.title}</span>
              <div className="relative" ref={(el) => {
                menuRef.current[idx] = el;
              }}>
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition duration-200 cursor-pointer"
                  onClick={() =>
                    setOpenMenuIndex(openMenuIndex === idx ? null : idx)
                  }
                >
                  <span className="text-white text-xl">⋮</span>
                </div>

                {/* Mini Menu */}
                {openMenuIndex === idx && (
                  <div className="absolute top-6 right-0 w-36 bg-black border border-white/10 rounded-md shadow-xl z-50">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-white/10"
                      onClick={() => handleEvolvePersona(persona, idx)}
                    >
                      Evolve
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-white/10"
                      onClick={() => {
                        setChatPersona(persona);
                        setIsChatOpen(true);
                        setOpenMenuIndex(null);
                      }}
                    >
                      Chat
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-white/10 text-red-400"
                      onClick={() => handleDeletePersona(idx)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>



      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center font-mono transform -translate-y-12">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: "#000000",
              },
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: {
                  enable: false,
                },
                resize: true,
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                enable: false,
              },
              move: {
                direction: "top",
                enable: true,
                outModes: {
                  default: "out",
                },
                speed: 0.5,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 50,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
          }}
        />

        {/* Title and Subtitle */}
        <div className="title-wrapper">
          <motion.h1
            className="mirrorverse-title"
            initial={{ scale: 3, opacity: 0, y: -200 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 12,
              duration: 1
            }}
            onAnimationComplete={() => {
              const dust = document.querySelector(".dust") as HTMLElement;
              dust.classList.add("active");
            }}
          >
            Mirrorverse
          </motion.h1>

          <div className="dust" />

          <motion.h2
            className="mirrorverse-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.2,
              duration: 1.2,
              ease: "easeOut"
            }}
          >
            Here, you can transform into anyone you desire
          </motion.h2>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "Me if I were a cyberpunk poet from Neo-Tokyo, 2088"'
          className="w-full max-w-xl h-32 p-4 rounded-lg bg-black/20 border border-white/20 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !input}
          className="bg-indigo-600 hover:bg-indigo-800 transition px-6 py-2 rounded-full font-semibold disabled:opacity-50"
        >
          {loading
            ? "Summoning..."
            : evolvingPersonaTitle
              ? `Evolve: ${evolvingPersonaTitle}`
              : "Generate Mirror Persona"}
        </button>

        {loading && (
          <div className="mt-8 max-w-3xl w-full bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl border border-white/10 animate-pulse">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">🧠 Summoning AI Reflection...</h2>
            <pre className="whitespace-pre-wrap text-white/80 text-sm">{streamedText}</pre>
          </div>
        )}

        {persona && !loading && (
          <div className="mt-8 max-w-3xl w-full bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">🧠 AI Reflection</h2>

            <p className="text-xl font-bold mb-2 text-white/90">{persona.title}</p>
            <p className="mb-2"><strong className="text-indigo-400">Backstory:</strong> {persona.backstory}</p>
            <p className="mb-2"><strong className="text-indigo-400">Tone:</strong> {persona.tone}</p>
            <p className="mb-2"><strong className="text-indigo-400">Aesthetic:</strong> {persona.aesthetic}</p>
            <p className="mb-2"><strong className="text-indigo-400">Pop Culture:</strong> {persona.popCulture}</p>
            <p className="mb-2"><strong className="text-indigo-400">Scene:</strong> {persona.scene}</p>

            {imageData && (
              <img
                src={imageData}
                alt="Generated visual"
                className="mt-4 w-full max-w-md rounded-lg border border-white/10 shadow-md justify-self-center"
              />
            )}

            {!evolvingPersonaTitle && (<button
              onClick={handleCollect}
              className="mt-4 bg-purple-600 hover:bg-purple-800 transition px-5 py-2 rounded-full font-semibold"
            >
              Collect Persona
            </button>)}


          </div>
        )}
      </div>

      {isChatOpen && chatPersona && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div
            ref={chatModalRef}
            className="bg-[#121212] text-white border border-gray-700 rounded-xl w-full max-w-md shadow-2xl relative flex flex-col h-[80vh] p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-center relative pb-3 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-center">
                Chat with {chatPersona.title}
              </h2>
              <button
                onClick={handleCloseChat}
                className="absolute right-0 text-gray-400 hover:text-white text-xl"
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 py-3 px-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[75%] text-sm px-4 py-2 rounded-2xl break-words shadow-sm ${msg.sender === "user"
                    ? "ml-auto bg-blue-600 text-white rounded-br-none"
                    : "mr-auto bg-gray-800 text-white rounded-bl-none"
                    }`}
                >
                  {msg.text}
                </div>
              ))}

              {loadingchat && (
                <div className="text-xs text-gray-400 italic text-center">
                  {chatPersona.title} is typing...
                </div>
              )}
              {error && (
                <div className="text-xs text-red-400 text-center">{error}</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loadingchat && chatInput.trim()) {
                    sendMessage(chatInput.trim());
                    setChatInput("");
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-600 bg-[#1e1e1e] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (!loadingchat && chatInput.trim()) {
                    sendMessage(chatInput.trim());
                    setChatInput("");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}

export default App;
