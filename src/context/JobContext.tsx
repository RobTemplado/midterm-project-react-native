import React, { createContext, useState, useContext } from "react";
import { Job } from "../types";

interface JobContextType {
  savedJobs: Job[];
  saveJob: (job: Job) => void;
  toggleSaveJob: (job: Job) => void;
  removeJob: (id: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const saveJob = (job: Job) => {
    // REQUIREMENT: Only one of each job can be added. There must not be a duplicate.
    setSavedJobs((prev) => {
      if (prev.find((j) => j.id === job.id)) return prev;
      return [...prev, job];
    });
  };

  const toggleSaveJob = (job: Job) => {
    setSavedJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      if (exists) return prev.filter((j) => j.id !== job.id);
      return [...prev, job];
    });
  };

  const removeJob = (id: string) => {
    setSavedJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <JobContext.Provider
      value={{
        savedJobs,
        saveJob,
        toggleSaveJob,
        removeJob,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobs must be used within a JobProvider");
  return context;
};
