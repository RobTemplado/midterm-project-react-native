import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useJobs } from "../context/JobContext";
import { Job } from "../types";

const JobDetailsScreen = ({ route, navigation }: any) => {
  const { job } = route.params as { job: Job };
  const { toggleSaveJob, savedJobs, isDarkMode } = useJobs();

  const revealAnim = useRef(new Animated.Value(0)).current;
  const [activeSection, setActiveSection] = useState<
    "Skills" | "Description" | "Requirements" | "Benefits"
  >("Description");

  const isSaved = savedJobs.some((saved) => saved.id === job.id);
  const salaryText =
    job.salary_range ||
    (job.min_salary || job.max_salary
      ? [job.min_salary, job.max_salary]
          .map((value) => (value ? `$${value.toLocaleString()}` : ""))
          .filter(Boolean)
          .join(" - ") + (job.currency ? ` ${job.currency}` : "")
      : "Not listed");
  const branchesText =
    job.locations && job.locations.length > 0
      ? job.locations.join(", ")
      : job.location;

  const splitSections = (text: string) => {
    const sections = {
      description: "",
      requirements: "",
      benefits: "",
    };

    const rawText = String(text || "");
    // Some job feeds inline headings like "Requirements" or "Benefits" inside a long paragraph.
    const normalizedText = rawText.replace(
      /([^\n])\s*(?:[\u{1F300}-\u{1FAFF}\u2600-\u27BF]\s*)?(description|requirements|requirement|qualifications|qualification|responsibilities|responsibility|benefits|benefit)\b\s*[:\-–]*/giu,
      "$1\n$2\n",
    );

    const lines = normalizedText.split(/\n+/);
    let current: "description" | "requirements" | "benefits" = "description";

    const normalizeHeading = (value: string) =>
      value.trim().toLowerCase().replace(/:$/, "");

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const heading = normalizeHeading(line);
      if (heading === "description") {
        current = "description";
        continue;
      }
      if (
        heading === "requirements" ||
        heading === "requirement" ||
        heading === "qualifications" ||
        heading === "qualification" ||
        heading === "responsibilities" ||
        heading === "responsibility"
      ) {
        current = "requirements";
        continue;
      }
      if (heading === "benefits" || heading === "benefit") {
        current = "benefits";
        continue;
      }

      sections[current] = sections[current]
        ? `${sections[current]}\n${line}`
        : line;
    }

    return sections;
  };

  const sections = splitSections(job.description);
  const stripEmoji = (value: string) =>
    value.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, "").trim();
  const descriptionText = stripEmoji(sections.description || job.description)
    .replace(/^description\s*[:\-–]*\s*/i, "")
    .trim();
  const requirementsText = sections.requirements || "Not listed.";
  const benefitsText = sections.benefits || "Not listed.";

  const handleOpenLink = () => {
    if (job.application_link) Linking.openURL(job.application_link);
  };

  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const revealTranslate = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.safeArea, isDarkMode && styles.containerDark]}
    >
      <Animated.View
        style={{ flex: 1, transform: [{ translateY: revealTranslate }] }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            isDarkMode && styles.containerDark,
          ]}
        >
          <Animated.View style={{ opacity: revealAnim }}>
            <View style={styles.grabberWrap}>
              <View style={styles.grabber} />
            </View>
            <View
              style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}
            >
              <View style={styles.headerBlock}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, isDarkMode && styles.textLight]}>
                    {job.job_title}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.headerSaveBtn,
                      isDarkMode && styles.headerSaveBtnDark,
                      isSaved && styles.headerSaveBtnSaved,
                    ]}
                    onPress={() => toggleSaveJob(job)}
                  >
                    <Ionicons
                      name={isSaved ? "bookmark" : "bookmark-outline"}
                      size={18}
                      color={
                        isSaved ? "#ffffff" : isDarkMode ? "#34d399" : "#10b981"
                      }
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.company, isDarkMode && styles.textMutedDark]}
                >
                  {job.company_name}
                </Text>
                <Text
                  style={[styles.subLine, isDarkMode && styles.textMutedDark]}
                >
                  {branchesText}
                  {job.work_model ? ` - ${job.work_model}` : ""}
                </Text>
              </View>

              <View
                style={[
                  styles.sectionDivider,
                  isDarkMode && styles.sectionDividerDark,
                ]}
              />

              <View style={styles.detailList}>
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIcon,
                      isDarkMode && styles.detailIconDark,
                    ]}
                  />
                  <Text
                    style={[styles.detailText, isDarkMode && styles.textLight]}
                  >
                    {job.job_type || "Job type not listed"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIcon,
                      isDarkMode && styles.detailIconDark,
                    ]}
                  />
                  <Text
                    style={[styles.detailText, isDarkMode && styles.textLight]}
                  >
                    {branchesText}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIcon,
                      isDarkMode && styles.detailIconDark,
                    ]}
                  />
                  <Text
                    style={[styles.detailText, isDarkMode && styles.textLight]}
                  >
                    {salaryText}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tabRow}>
              {["Skills", "Description", "Requirements", "Benefits"].map(
                (label) => {
                  const isActive = activeSection === label;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() =>
                        setActiveSection(
                          label as
                            | "Skills"
                            | "Description"
                            | "Requirements"
                            | "Benefits",
                        )
                      }
                      style={[
                        styles.tabBtn,
                        isActive && styles.tabBtnActive,
                        isDarkMode && styles.tabBtnDark,
                        isActive && isDarkMode && styles.tabBtnActiveDark,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          isActive && styles.tabTextActive,
                          isDarkMode && styles.textLight,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            <View
              style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}
            >
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.textLight]}
              >
                {activeSection}
              </Text>
              {activeSection === "Skills" ? (
                job.tags && job.tags.length > 0 ? (
                  <View style={styles.tagsWrap}>
                    {job.tags.slice(0, 10).map((tag) => (
                      <Text
                        key={tag}
                        style={[styles.tag, isDarkMode && styles.tagDark]}
                      >
                        {tag}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.sectionBody,
                      isDarkMode && styles.textMutedDark,
                    ]}
                  >
                    No skills listed.
                  </Text>
                )
              ) : null}
              {activeSection === "Description" ? (
                <Text
                  style={[
                    styles.sectionBody,
                    isDarkMode && styles.textMutedDark,
                  ]}
                >
                  {descriptionText}
                </Text>
              ) : null}
              {activeSection === "Requirements" ? (
                <Text
                  style={[
                    styles.sectionBody,
                    isDarkMode && styles.textMutedDark,
                  ]}
                >
                  {requirementsText}
                </Text>
              ) : null}
              {activeSection === "Benefits" ? (
                <Text
                  style={[
                    styles.sectionBody,
                    isDarkMode && styles.textMutedDark,
                  ]}
                >
                  {benefitsText}
                </Text>
              ) : null}
            </View>

            {job.application_link ? (
              <TouchableOpacity style={styles.linkBtn} onPress={handleOpenLink}>
                <Text style={styles.linkText}>View on Empllo</Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        </ScrollView>
      </Animated.View>
      <View style={[styles.stickyBar, isDarkMode && styles.stickyBarDark]}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            styles.primaryBtnFull,
            isDarkMode && styles.primaryBtnDark,
          ]}
          onPress={() =>
            navigation.navigate("Apply", { job, fromSaved: false })
          }
        >
          <Text style={styles.primaryText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flexGrow: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 96,
    backgroundColor: "#f8fafc",
  },
  containerDark: { backgroundColor: "#0b0b0b" },
  grabberWrap: { alignItems: "center", marginBottom: 16, marginTop: 4 },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 14,
  },
  summaryCardDark: {
    backgroundColor: "#141414",
    borderColor: "#2a2a2a",
    shadowOpacity: 0.2,
  },
  headerBlock: { marginTop: 0, marginBottom: 10 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  headerSaveBtn: {
    borderWidth: 1,
    borderColor: "#10b981",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  headerSaveBtnDark: { backgroundColor: "#0f0f0f", borderColor: "#34d399" },
  headerSaveBtnSaved: { backgroundColor: "#10b981", borderColor: "#10b981" },
  title: {
    flex: 1,
    flexShrink: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  company: { marginTop: 6, color: "#1f2937", fontWeight: "700", fontSize: 17 },
  subLine: { marginTop: 6, color: "#4b5563", fontSize: 15 },
  sectionDivider: { height: 1, backgroundColor: "#d1d5db", marginVertical: 12 },
  sectionDividerDark: { backgroundColor: "#2a2a2a" },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
  },
  sectionCardDark: { backgroundColor: "#141414", borderColor: "#2a2a2a" },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flexBasis: "48%",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
  tabBtnDark: {
    borderColor: "#3a3a3a",
    backgroundColor: "#111111",
  },
  tabBtnActive: {
    borderColor: "#10b981",
    backgroundColor: "#10b981",
  },
  tabBtnActiveDark: {
    borderColor: "#34d399",
    backgroundColor: "#34d399",
  },
  tabText: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  tabTextActive: { color: "#ffffff" },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionBody: {
    marginTop: 8,
    color: "#374151",
    lineHeight: 24,
    fontSize: 15,
    textAlign: "justify",
  },
  detailList: { gap: 6 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  detailIcon: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#9ca3af",
  },
  detailIconDark: { backgroundColor: "#8b8b8b" },
  detailText: { fontSize: 15, color: "#0f172a", fontWeight: "700" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tag: {
    backgroundColor: "#e5e7eb",
    color: "#0f172a",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 13,
    fontWeight: "600",
  },
  tagDark: { backgroundColor: "#1f1f1f", color: "#f3f4f6" },
  stickyBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  stickyBarDark: { backgroundColor: "#111111", borderTopColor: "#2a2a2a" },
  primaryBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryBtnDark: { backgroundColor: "#34d399" },
  primaryBtnFull: { flex: 1, alignItems: "center" },
  primaryText: { color: "#ffffff", fontWeight: "700", fontSize: 17 },
  linkBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  linkText: { color: "#065f46", fontWeight: "700", fontSize: 16 },
  textLight: { color: "#f9fafb" },
  textMutedDark: { color: "#9ca3af" },
});

export default JobDetailsScreen;
