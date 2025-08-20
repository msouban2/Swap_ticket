import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import io from "socket.io-client";
import { useLocalSearchParams } from "expo-router";

type Message = {
  id: string;
  sender: "seller" | "buyer" | "judge";
  text: string;
  timestamp: string;
};

// ? Replace with your Flask backend Socket.IO endpoint
const SOCKET_URL = "http://localhost:5000"; // Update this if needed

export default function ChatRoomScreen() {
  const { ticketId, userRole, userName } = useLocalSearchParams();
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!ticketId || !userRole || !userName) return;

    const newSocket = io(SOCKET_URL, {
      query: {
        ticketId: ticketId as string,
        userName: userName as string,
        userRole: userRole as string,
      },
    });

    setSocket(newSocket);

    newSocket.on("chat_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("welcome", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [ticketId, userRole, userName]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender: userRole as "seller" | "buyer" | "judge",
      text: input,
      timestamp: new Date().toISOString(),
    };

    socket.emit("chat_message", msg);
    setInput("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    let bgColor = "#ddd";
    if (item.sender === "seller") bgColor = "#f1c40f";
    if (item.sender === "buyer") bgColor = "#3498db";
    if (item.sender === "judge") bgColor = "#2ecc71";

    return (
      <View style={[styles.message, { backgroundColor: bgColor }]}>
        <Text style={styles.sender}>{item.sender.toUpperCase()}:</Text>
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  messageList: { flex: 1, padding: 10 },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  sender: { fontWeight: "bold", marginBottom: 2 },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendBtn: {
    backgroundColor: "#27ae60",
    marginLeft: 8,
    borderRadius: 20,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
});
