import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useJobs } from "../context/JobContext";

const ApplyFormScreen = ({ route, navigation }: any) => {
  const { job, fromSaved } = route.params;
  const { isDarkMode } = useJobs();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });

  const validate = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.name.trim()) return "Name is required.";
    if (!emailRegex.test(form.email)) return "Valid email is required.";
    if (phoneDigits.length < 10) return "Valid phone number is required.";
    if (form.reason.length < 15) return "Please write a longer reason.";
    return null;
  };

  const handleConfirm = () => {
    const error = validate();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    Alert.alert("Success", "Application Submitted!", [
      {
        text: "Okay",
        onPress: () => {
          setForm({ name: "", email: "", phone: "", reason: "" });

          if (fromSaved) {
            navigation.navigate("Main", { screen: "Home" });
            return;
          }

          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, isDarkMode && styles.containerDark]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, isDarkMode && styles.headerCardDark]}>
          <Text style={[styles.title, isDarkMode && styles.textLight]}>
            Apply for {job.job_title}
          </Text>
          <Text style={[styles.company, isDarkMode && styles.textMutedDark]}>
            {job.company_name}
          </Text>
          <Text style={[styles.subLine, isDarkMode && styles.textMutedDark]}>
            {job.location}
          </Text>
        </View>

        <View
          style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}
        >
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
            Your details
          </Text>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, isDarkMode && styles.textMutedDark]}>
              Name
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="Jose Rizz Al"
              placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, isDarkMode && styles.textMutedDark]}>
              Email
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="laonglaan@email.com"
              placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, isDarkMode && styles.textMutedDark]}>
              Phone
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="+63 123-456-7890"
              placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View
          style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}
        >
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
            Why should we hire you?
          </Text>
          <Text
            style={[styles.sectionBody, isDarkMode && styles.textMutedDark]}
          >
            Share a short summary of your experience and why you are a strong
            fit.
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.inputMultiline,
              styles.textArea,
              isDarkMode && styles.inputDark,
            ]}
            placeholder="Write your message"
            placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
            multiline
            value={form.reason}
            onChangeText={(t) => setForm({ ...form, reason: t })}
          />
        </View>
      </ScrollView>

      <View style={[styles.stickyBar, isDarkMode && styles.stickyBarDark]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
          <Text style={styles.primaryText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  containerDark: { backgroundColor: "#0b1120" },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  headerCardDark: { backgroundColor: "#0f172a", borderColor: "#1f2937" },
  title: { fontSize: 30, fontWeight: "700", color: "#0f172a" },
  company: { marginTop: 6, color: "#334155", fontWeight: "600", fontSize: 18 },
  subLine: { marginTop: 6, color: "#64748b", fontSize: 16 },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  sectionCardDark: { backgroundColor: "#0f172a", borderColor: "#1f2937" },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionBody: { marginTop: 8, color: "#475569", lineHeight: 24, fontSize: 15 },
  fieldGroup: { marginTop: 12 },
  label: { color: "#475569", fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#0f172a",
  },
  inputDark: {
    backgroundColor: "#0b1220",
    borderColor: "#334155",
    color: "#e2e8f0",
  },
  textArea: { marginTop: 12 },
  inputMultiline: { height: 140, textAlignVertical: "top" },
  stickyBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  stickyBarDark: { backgroundColor: "#0b1220", borderTopColor: "#1f2937" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#14b8a6",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  secondaryText: { color: "#0f766e", fontWeight: "700", fontSize: 17 },
  primaryBtn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryText: { color: "#ffffff", fontWeight: "700", fontSize: 17 },
  textLight: { color: "#e2e8f0" },
  textMutedDark: { color: "#94a3b8" },
});

export default ApplyFormScreen;
