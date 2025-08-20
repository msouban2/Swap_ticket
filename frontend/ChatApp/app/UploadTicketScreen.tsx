import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRouter } from "expo-router";

export default function UploadTicketScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const router = useRouter();

  // ?? Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedImage = result.assets[0];
        setImageUri(selectedImage.uri);

        const data = await uploadImage(selectedImage);
        if (data) {
          setTicketData(data);

          router.push({
            pathname: "/TicketWaitingScreen",
            params: {
              ticketId: data.ticket_id,
              ocrText: data.ocr_text,
              ollamaSummary: data.ollama_summary,
            },
          });
        }
      }
    } catch (error) {
      console.error("Image pick failed:", error);
      Alert.alert("Error", "Failed to pick or upload image.");
    }
  };

  // ?? Upload image using FormData
  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", "msouban");

      if (Platform.OS === "web") {
        const response = await fetch(imageAsset.uri);
        const blob = await response.blob();
        formData.append("file", blob, "ticket.jpg");
      } else {
        formData.append("file", {
          uri: imageAsset.uri,
          type: "image/jpeg",
          name: "ticket.jpg",
        } as any); // React Native FormData workaround
      }

      const response = await axios.post("http://localhost:5000/process_ticket", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Backend response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Upload Failed", "Something went wrong while uploading.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Upload Ticket Image" onPress={pickImage} />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {ticketData && (
        <View style={styles.result}>
          <Text style={styles.label}>OCR Text:</Text>
          <Text style={styles.text}>{ticketData.ocr_text}</Text>
          <Text style={styles.label}>Ollama Summary:</Text>
          <Text style={styles.text}>{ticketData.ollama_summary}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 20,
    resizeMode: "contain",
  },
  result: {
    marginTop: 20,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    marginBottom: 15,
  },
});
