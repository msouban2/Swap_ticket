import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ✅ Import your screens
import UploadTicketScreen from "../app/UploadTicketScreen";
import ChatRoomScreen from "../app/ChatRoomScreen";
import TicketWaitingScreen from "../app/TicketWaitingScreen";
import BuyerMatchScreen from "../app/BuyerMatchScreen"; // 👈 Add this


// ✅ Define the types for routes (navigation + params)
export type RootStackParamList = {
  Upload: undefined;
  ChatRoom: {
    roomId: string;
    buyerId: string;
    sellerId: string;
    judgeId: string;
  };
  TicketWaiting: {
    ticketId: string;
    ocrText: string;
    ollamaSummary: string;
  };
  BuyerMatch: {   // 👈 Add this
    ticketId: string;
    buyerId: string;
    sellerId: string;
  };
};

// ✅ Create stack with type safety
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Upload">
        {/* Upload Screen */}
        <Stack.Screen
          name="Upload"
          component={UploadTicketScreen}
          options={{ title: "Upload Ticket" }}
        />

        {/* Chat Room Screen */}
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={{ title: "Chat Room" }}
        />

        {/* Waiting Screen */}
        <Stack.Screen
          name="TicketWaiting"
          component={TicketWaitingScreen}
          options={{ title: "Waiting for Ticket" }}
        />

        {/* Buyer Match screen */}
        <Stack.Screen
          name="BuyerMatch"
          component={BuyerMatchScreen}
          options={{ title: "Buyer Match" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
