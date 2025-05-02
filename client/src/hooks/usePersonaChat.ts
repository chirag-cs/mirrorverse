// This hook manages the chat state and interactions with the backend for the persona chat feature.
import { useState } from "react";
import axios from "axios";
const API_URL = "https://mirrorverse.onrender.com/";

interface ChatMessage {
    sender: "user" | "persona";
    text: string;
}

export const usePersonaChat = (personaDescription: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingchat, setLoadingChat] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (userMessage: string) => {
        setLoadingChat(true);
        setError(null);

        const updatedMessages: ChatMessage[] = [
            ...messages,
            { sender: "user", text: userMessage },
        ];

        setMessages(updatedMessages);

        try {
            const res = await axios.post(`${API_URL}chat`, {
                personaDescription,
                chatHistory: updatedMessages, // 🧠 Pass full message history
            });

            const personaReply: string = res.data.reply;

            setMessages((prev) => [
                ...prev,
                { sender: "persona", text: personaReply },
            ]);
        } catch (err: any) {
            setError("Failed to get response from persona.");
            console.error("Chat error:", err.response?.data || err.message);
        } finally {
            setLoadingChat(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        loadingchat,
        error,
        sendMessage,
        clearChat,
    };
};

