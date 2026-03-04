export interface Job {
  id: string; // Required unique ID assigned via uuid
  job_title: string;
  company_name: string;
  salary_range?: string;
  min_salary?: number | null;
  max_salary?: number | null;
  currency?: string | null;
  location: string;
  locations?: string[];
  description: string;
  tags?: string[];
  job_type?: string;
  work_model?: string;
  seniority_level?: string;
  main_category?: string;
  application_link?: string;
  company_logo?: string;
}

export interface ApplicationForm {
  name: string;
  email: string;
  phone: string;
  reason: string;
}