import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

// ✅ Ticket type
interface Ticket {
  _id: string;
  category: "travel" | "movie" | "event" | "hotel" | "other";
  from?: string;
  to?: string;
  movieName?: string;
  eventName?: string;
  hotelName?: string;
  date?: string;
  time?: string;
  price?: number;
  city?: string;
  pinCode?: string;
  ollama_summary?: string;
}

export default function BuyerMatchScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, []);

  // ✅ Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      const response = await axios.get<Ticket[]>(
        "http://localhost:5000/tickets"
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Join ticket → go to ChatRoom
  const handleJoinTicket = (ticket: Ticket) => {
    router.push({
      pathname: "/ChatRoomScreen",
      params: {
        roomId: `ticket_${ticket._id}`,
        buyerId: "u_buyer_1", // ⚡ Replace with actual user ID
        sellerId: "u_seller_1",
        judgeId: "u_judge_1",
      },
    });
  };

  // ✅ Group tickets by category
  const groupTicketsByCategory = () => {
    const categories = ["travel", "movie", "event", "hotel", "other"] as const;

    return categories.map((cat) => {
      const data = tickets
        .filter((t) => t.category === cat)
        .sort((a, b) => {
          if (a.date && b.date) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          if (a.price && b.price) {
            return a.price - b.price;
          }
          return 0;
        });

      return { title: cat.toUpperCase(), data };
    });
  };

  // ✅ Render a single ticket
  const renderItem = ({ item }: { item: Ticket }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Ticket ID:</Text>
      <Text>{item._id}</Text>

      {item.from && item.to && (
        <>
          <Text style={styles.label}>From → To:</Text>
          <Text>
            {item.from} → {item.to}
          </Text>
        </>
      )}

      {item.movieName && (
        <>
          <Text style={styles.label}>Movie:</Text>
          <Text>{item.movieName}</Text>
        </>
      )}

      {item.eventName && (
        <>
          <Text style={styles.label}>Event:</Text>
          <Text>{item.eventName}</Text>
        </>
      )}

      {item.hotelName && (
        <>
          <Text style={styles.label}>Hotel:</Text>
          <Text>{item.hotelName}</Text>
        </>
      )}

      {item.date && (
        <>
          <Text style={styles.label}>Date:</Text>
          <Text>
            {item.date} {item.time}
          </Text>
        </>
      )}

      {item.city && (
        <>
          <Text style={styles.label}>City:</Text>
          <Text>
            {item.city} ({item.pinCode})
          </Text>
        </>
      )}

      {item.price && (
        <>
          <Text style={styles.label}>Price:</Text>
          <Text>₹{item.price}</Text>
        </>
      )}

      <Text style={styles.label}>Summary:</Text>
      <Text>{item.ollama_summary}</Text>

      <Button title="Join Ticket" onPress={() => handleJoinTicket(item)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Tickets</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <SectionList
          sections={groupTicketsByCategory()}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title, data } }) =>
            data.length > 0 ? (
              <Text style={styles.sectionHeader}>{title}</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    backgroundColor: "#ddd",
    padding: 8,
    borderRadius: 6,
  },
  card: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
  },
});
