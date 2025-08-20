import React from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function TicketWaitingScreen() {
  const router = useRouter();
  const { ticketId, ocrText, ollamaSummary } = useLocalSearchParams();

  const handleGoToChatroom = () => {
    router.push({
      pathname: "/ChatRoomScreen",
      params: {
        roomId: `ticket_${ticketId}`,
        buyerId: "u_buyer_1", // ⚡ Replace with real IDs from backend
        sellerId: "u_seller_1",
        judgeId: "u_judge_1",
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ticket Waiting for Buyer</Text>

      <Text style={styles.label}>Ticket ID:</Text>
      <Text style={styles.text}>{ticketId}</Text>

      <Text style={styles.label}>OCR Text:</Text>
      <Text style={styles.text}>{ocrText}</Text>

      <Text style={styles.label}>Ollama Summary:</Text>
      <Text style={styles.text}>{ollamaSummary}</Text>

      <View style={styles.buttonWrapper}>
        <Button title="Go to Chatroom" onPress={handleGoToChatroom} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  text: {
    marginBottom: 10,
  },
  buttonWrapper: {
    marginTop: 20,
    width: "100%",
  },
});
