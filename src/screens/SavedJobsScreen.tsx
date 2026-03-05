import React from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useJobs } from "../context/JobContext";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function SavedJobsScreen({ navigation }: any) {
  const { savedJobs, removeJob, isDarkMode } = useJobs();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.emptyText, isDarkMode && styles.textMutedDark]}>
            No saved jobs yet.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, isDarkMode && styles.cardDark]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Job Details", { job: item })}
          >
            <View style={styles.cardTop}>
              <View style={styles.logoWrap}>
                {item.company_logo ? (
                  <Image
                    source={{ uri: item.company_logo }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.logoFallback, isDarkMode && styles.logoDark]}
                  >
                    <Text
                      style={[
                        styles.logoText,
                        isDarkMode && styles.logoTextDark,
                      ]}
                    >
                      {getInitials(item.company_name)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.title, isDarkMode && styles.textLight]}>
                  {item.job_title}
                </Text>
                <Text
                  style={[styles.company, isDarkMode && styles.textMutedDark]}
                >
                  {item.company_name}
                </Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <Text style={[styles.badge, isDarkMode && styles.badgeDark]}>
                {item.location}
              </Text>
              {item.salary_range ? (
                <Text style={[styles.badge, isDarkMode && styles.badgeDark]}>
                  {item.salary_range}
                </Text>
              ) : null}
              {item.job_type ? (
                <Text style={[styles.badge, isDarkMode && styles.badgeDark]}>
                  {item.job_type}
                </Text>
              ) : null}
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Apply", { job: item, fromSaved: true })
                }
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryText}>Apply Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeJob(item.id)}
                style={styles.ghostBtn}
              >
                <Text style={styles.ghostText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#eef2f6" },
  darkContainer: { backgroundColor: "#0f172a" },
  hero: {
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  heroDark: { backgroundColor: "#0b1220", borderColor: "#1f2937" },
  heroGlow: {
    position: "absolute",
    right: -40,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "#a5f3fc",
    opacity: 0.35,
  },
  eyebrow: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.2,
  },
  subhead: { marginTop: 6, color: "#475569" },
  emptyText: { textAlign: "center", marginTop: 50, color: "#94a3b8" },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  cardDark: { backgroundColor: "#0b1220", borderColor: "#1f2937" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoWrap: { width: 48, height: 48 },
  logo: { width: 48, height: 48, borderRadius: 14 },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  logoDark: { backgroundColor: "#1f2937" },
  logoText: { fontWeight: "800", color: "#0f172a" },
  logoTextDark: { color: "#e2e8f0" },
  cardTitleWrap: { flex: 1 },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  company: { color: "#334155", marginTop: 4, fontWeight: "600" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  badge: {
    backgroundColor: "#e0f2fe",
    color: "#0f172a",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "600",
  },
  badgeDark: { backgroundColor: "#0f172a", color: "#e2e8f0" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  primaryBtn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  primaryText: { color: "#ffffff", fontWeight: "700" },
  ghostBtn: {
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  ghostText: { color: "#ef4444", fontWeight: "700" },
  textLight: { color: "#e2e8f0" },
  textMutedDark: { color: "#94a3b8" },
});
