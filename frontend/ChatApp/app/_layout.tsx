import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Stack initialRouteName="UploadTicketScreen">
      <Stack.Screen name="UploadTicketScreen" options={{ title: "Upload Ticket" }} />
      <Stack.Screen name="ChatRoomScreen" options={{ title: "Chat Room" }} />
      <Stack.Screen name="TicketWaitingScreen" options={{ title: "Waiting for Ticket" }} />
      <Stack.Screen name="BuyerMatchScreen" options={{ title: "Buyer Match" }} />
      <Stack.Screen name="DealSummaryScreen" options={{ title: "Deal Summary" }} />
      <Stack.Screen name="HistoryScreen" options={{ title: "History" }} />
    </Stack>
  );
}
