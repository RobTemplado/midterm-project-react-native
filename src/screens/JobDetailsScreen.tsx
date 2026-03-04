import React, { useEffect, useRef } from "react";
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
import { useJobs } from "../context/JobContext";
import { Job } from "../types";

const JobDetailsScreen = ({ route, navigation }: any) => {
  const { job } = route.params as { job: Job };
  const { saveJob, savedJobs, isDarkMode } = useJobs();

  const revealAnim = useRef(new Animated.Value(0)).current;

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
  const descriptionText = stripEmoji(sections.description || job.description);
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
                <Text style={[styles.title, isDarkMode && styles.textLight]}>
                  {job.job_title}
                </Text>
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

              {job.tags && job.tags.length > 0 ? (
                <>
                  <View
                    style={[
                      styles.sectionDivider,
                      isDarkMode && styles.sectionDividerDark,
                    ]}
                  />
                  <View>
                    <Text
                      style={[
                        styles.sectionTitle,
                        isDarkMode && styles.textLight,
                      ]}
                    >
                      Skills
                    </Text>
                    <View style={styles.tagsWrap}>
                      {job.tags.slice(0, 6).map((tag) => (
                        <Text
                          key={tag}
                          style={[styles.tag, isDarkMode && styles.tagDark]}
                        >
                          {tag}
                        </Text>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}
            </View>

            <View
              style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}
            >
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.textLight]}
              >
                Description
              </Text>
              <Text
                style={[styles.sectionBody, isDarkMode && styles.textMutedDark]}
              >
                {descriptionText}
              </Text>
            </View>

            <View
              style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}
            >
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.textLight]}
              >
                Requirements
              </Text>
              <Text
                style={[styles.sectionBody, isDarkMode && styles.textMutedDark]}
              >
                {requirementsText}
              </Text>
            </View>

            <View
              style={[styles.sectionCard, isDarkMode && styles.sectionCardDark]}
            >
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.textLight]}
              >
                Benefits
              </Text>
              <Text
                style={[styles.sectionBody, isDarkMode && styles.textMutedDark]}
              >
                {benefitsText}
              </Text>
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
          style={[styles.secondaryBtn, isSaved && styles.secondaryBtnDisabled]}
          onPress={() => saveJob(job)}
          disabled={isSaved}
        >
          <Text
            style={[
              styles.secondaryText,
              isSaved && styles.secondaryTextDisabled,
            ]}
          >
            {isSaved ? "Saved" : "Save Job"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
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
    backgroundColor: "#f1f5f9",
  },
  container: {
    flexGrow: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 96,
    backgroundColor: "#f1f5f9",
  },
  containerDark: { backgroundColor: "#0b1120" },
  grabberWrap: { alignItems: "center", marginBottom: 16, marginTop: 4 },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#94a3b8",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 14,
  },
  summaryCardDark: {
    backgroundColor: "#0f172a",
    borderColor: "#1f2937",
    shadowOpacity: 0.2,
  },
  headerBlock: { marginTop: 0, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  company: { marginTop: 6, color: "#334155", fontWeight: "600", fontSize: 17 },
  subLine: { marginTop: 6, color: "#64748b", fontSize: 15 },
  sectionDivider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 12 },
  sectionDividerDark: { backgroundColor: "#1f2937" },
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
    backgroundColor: "#cbd5f5",
  },
  detailIconDark: { backgroundColor: "#64748b" },
  detailText: { fontSize: 15, color: "#0f172a", fontWeight: "600" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tag: {
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 13,
    fontWeight: "600",
  },
  tagDark: { backgroundColor: "#1f2937", color: "#e2e8f0" },
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
  },
  secondaryBtnDisabled: { borderColor: "#94a3b8" },
  secondaryText: { color: "#0f766e", fontWeight: "700", fontSize: 17 },
  secondaryTextDisabled: { color: "#94a3b8" },
  primaryBtn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  primaryText: { color: "#ffffff", fontWeight: "700", fontSize: 17 },
  linkBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#14b8a6",
  },
  linkText: { color: "#0f766e", fontWeight: "700", fontSize: 16 },
  textLight: { color: "#e2e8f0" },
  textMutedDark: { color: "#94a3b8" },
});

export default JobDetailsScreen;
