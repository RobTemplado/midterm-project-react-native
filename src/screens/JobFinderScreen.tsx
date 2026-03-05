import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import { useJobs } from "../context/JobContext";
import { Job } from "../types";

const JOBS_API_URL = "https://empllo.com/api/v1";

const mapJobsFromApi = (data: unknown): Job[] => {
  if (Array.isArray(data)) return data as Job[];

  const maybeArray =
    (data as any)?.jobs ||
    (data as any)?.data?.jobs ||
    (data as any)?.data ||
    [];

  return Array.isArray(maybeArray) ? (maybeArray as Job[]) : [];
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripEmoji = (value: string) =>
  value.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, "").trim();

const formatSalaryRange = (
  minSalary?: number | null,
  maxSalary?: number | null,
  currency?: string | null,
) => {
  if (!minSalary && !maxSalary) return undefined;

  const formatValue = (value: number | null | undefined) =>
    value ? `$${value.toLocaleString()}` : undefined;

  const minText = formatValue(minSalary);
  const maxText = formatValue(maxSalary);
  const rangeText = [minText, maxText].filter(Boolean).join(" - ");
  if (!rangeText) return undefined;

  return currency ? `${rangeText} ${currency}` : rangeText;
};

const normalizeJob = (job: any): Job => {
  const locationsArray = Array.isArray(job?.locations)
    ? job.locations
    : job?.locations
      ? [job.locations]
      : undefined;

  const locationText =
    (locationsArray && locationsArray.length > 0
      ? locationsArray.join(", ")
      : undefined) ??
    job?.location ??
    job?.city ??
    job?.country ??
    (job?.remote ? "Remote" : undefined) ??
    "Location not specified";

  const minSalary = job?.minSalary ?? job?.min_salary ?? null;
  const maxSalary = job?.maxSalary ?? job?.max_salary ?? null;
  const currency = job?.currency ?? null;
  const salaryRange =
    job?.salary_range ??
    job?.salary ??
    job?.compensation ??
    formatSalaryRange(minSalary, maxSalary, currency);

  const rawDescription =
    job?.description ??
    job?.description_text ??
    job?.summary ??
    job?.snippet ??
    "No description provided.";

  return {
    id: String(job?.id ?? job?.job_id ?? job?.jobId ?? uuid.v4()),
    job_title:
      job?.job_title ??
      job?.title ??
      job?.position ??
      job?.role ??
      "Untitled role",
    company_name:
      job?.company_name ??
      job?.company ??
      job?.companyName ??
      job?.employer ??
      "Unknown company",
    salary_range: salaryRange,
    min_salary: minSalary,
    max_salary: maxSalary,
    currency,
    location: String(locationText),
    locations: locationsArray,
    description: stripEmoji(stripHtml(String(rawDescription))),
    tags: Array.isArray(job?.tags) ? job.tags : undefined,
    job_type: job?.jobType ?? job?.job_type,
    work_model: job?.workModel ?? job?.work_model,
    seniority_level: job?.seniorityLevel ?? job?.seniority_level,
    main_category: job?.mainCategory ?? job?.main_category,
    application_link: job?.applicationLink ?? job?.application_link,
    company_logo: job?.companyLogo ?? job?.company_logo,
  };
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function JobFinderScreen({ navigation }: any) {
  const { toggleSaveJob, savedJobs, isDarkMode, toggleTheme } = useJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(JOBS_API_URL);
        const rawData = await response.json();
        const normalized = mapJobsFromApi(rawData).map(normalizeJob);

        if (isMounted) setJobs(normalized);
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Failed to fetch jobs.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return jobs;

    return jobs.filter((job) => {
      const searchable = [
        job.job_title,
        job.company_name,
        job.location,
        job.description,
        job.salary_range || "",
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [jobs, query]);

  const isSaved = (jobId: string) => savedJobs.some((j) => j.id === jobId);

  const renderItem = ({ item }: { item: Job }) => {
    const saved = isSaved(item.id);
    return (
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
                  style={[styles.logoText, isDarkMode && styles.logoTextDark]}
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
            <Text style={[styles.company, isDarkMode && styles.textMutedDark]}>
              {item.company_name}
            </Text>
          </View>
          <View
            style={[styles.accentDot, isDarkMode && styles.accentDotDark]}
          />
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
          {item.work_model ? (
            <Text style={[styles.badge, isDarkMode && styles.badgeDark]}>
              {item.work_model}
            </Text>
          ) : null}
        </View>
        <Text
          style={[styles.description, isDarkMode && styles.textLight]}
          numberOfLines={3}
        >
          {item.description}
        </Text>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => toggleSaveJob(item)}
            style={[styles.actionBtn, isDarkMode && styles.actionBtnDark]}
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={16}
              color={saved ? "#0ea5e9" : isDarkMode ? "#e2e8f0" : "#0f172a"}
            />
            <Text
              style={[styles.actionText, isDarkMode && styles.actionTextDark]}
            >
              {saved ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Apply", { job: item, fromSaved: false })
            }
            style={[styles.primaryBtn, isDarkMode && styles.primaryBtnDark]}
          >
            <Ionicons name="send" size={16} color="#ffffff" />
            <Text style={styles.primaryText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, isDarkMode && styles.containerDark]}
    >
      <View style={[styles.hero, isDarkMode && styles.heroDark]}>
        <View style={styles.heroRow}>
          <View style={styles.heroTitleWrap}>
            <View style={styles.logoRow}>
              <Text style={[styles.heroLogo, isDarkMode && styles.textLight]}>
                SWELL D GUSTO
              </Text>
            </View>
            {isDarkMode ? (
              <Text
                style={[styles.heroSubtitle, styles.textMutedDark]}
                pointerEvents="none"
              >
                TRABAHO AYAW?
              </Text>
            ) : null}
          </View>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.themeToggle, isDarkMode && styles.themeToggleDark]}
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel="Toggle theme"
            >
              <Ionicons
                name={isDarkMode ? "moon" : "sunny"}
                size={18}
                color={isDarkMode ? "#facc15" : "#0f172a"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={[styles.searchWrap, isDarkMode && styles.searchWrapDark]}>
        <View style={[styles.searchPill, isDarkMode && styles.searchPillDark]}>
          <Ionicons
            name="search"
            size={18}
            color={isDarkMode ? "#94a3b8" : "#64748b"}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Job title, keywords, or company"
            placeholderTextColor={isDarkMode ? "#94a3b8" : "#64748b"}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
          />
          {query.length > 0 ? (
            <TouchableOpacity
              style={[styles.clearBtn, isDarkMode && styles.clearBtnDark]}
              onPress={() => setQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={[styles.clearText, isDarkMode && styles.textLight]}>
                x
              </Text>
            </TouchableOpacity>
          ) : null}
          {query.trim().length > 0 ? (
            <TouchableOpacity
              style={[styles.searchBtn, isDarkMode && styles.searchBtnDark]}
              onPress={() => {
                setQuery((prev) => prev.trim());
                Keyboard.dismiss();
              }}
              accessibilityRole="button"
              accessibilityLabel="Apply search"
            >
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            filteredJobs.length === 0 ? styles.emptyContainer : undefined
          }
          ListEmptyComponent={
            <Text
              style={[styles.emptyText, isDarkMode && styles.textMutedDark]}
            >
              No jobs found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 8,
    backgroundColor: "#eef2f6",
  },
  containerDark: { backgroundColor: "#0f172a" },
  hero: {
    backgroundColor: "transparent",
    borderRadius: 24,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: "transparent",
    overflow: "visible",
  },
  heroDark: { backgroundColor: "transparent", borderColor: "transparent" },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  heroLogo: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 0.5,
    fontFamily: "Anton_400Regular",
    color: "#0f172a",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },
  heroTitleWrap: {
    paddingBottom: 8,
    paddingTop: 0,
    alignItems: "flex-start",
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.6,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  themeToggleDark: { backgroundColor: "#0b1220", borderColor: "#334155" },
  searchWrap: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchWrapDark: { backgroundColor: "#0b1220", borderColor: "#1f2937" },
  searchPill: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#cbd5f5",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchPillDark: { backgroundColor: "#0f172a", borderColor: "#334155" },
  searchIcon: { marginLeft: 2 },
  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 4,
    color: "#0f172a",
  },
  searchInputDark: { color: "#e2e8f0" },
  searchBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0ea5e9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBtnDark: { backgroundColor: "#38bdf8" },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5f5",
  },
  clearBtnDark: { backgroundColor: "#1f2937" },
  clearText: { color: "#0f172a", fontWeight: "700" },
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
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#38bdf8",
  },
  accentDotDark: { backgroundColor: "#22d3ee" },
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
  description: { marginTop: 10, color: "#334155", lineHeight: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
  actionBtnDark: { backgroundColor: "#0b1220", borderColor: "#334155" },
  actionBtnDisabled: { borderColor: "#94a3b8" },
  actionText: { color: "#0f172a", fontWeight: "700" },
  actionTextDark: { color: "#e2e8f0" },
  actionTextDisabled: { color: "#94a3b8" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0ea5e9",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  primaryBtnDark: { backgroundColor: "#38bdf8" },
  primaryText: { color: "#ffffff", fontWeight: "700" },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
  emptyText: { textAlign: "center", color: "#94a3b8" },
  errorText: { textAlign: "center", color: "#ef4444" },
  textLight: { color: "#e2e8f0" },
  textMutedDark: { color: "#94a3b8" },
});
