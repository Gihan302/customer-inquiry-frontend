// Types mirror the backend API contract (see Backend/src/types/index.ts).
// Dates arrive as ISO strings in JSON.

// ---- API envelope ----
export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: ErrorDetail[];
}

// ---- Users / auth ----
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface LoginData {
  token: string;
  token_type: 'Bearer';
  expires_in: string;
  user: User;
}

// ---- Inquiries ----
export const INQUIRY_STATUSES = ['New', 'In Progress', 'Resolved'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_VISIBILITIES = ['Public', 'Private'] as const;
export type InquiryVisibility = (typeof INQUIRY_VISIBILITIES)[number];

export interface Inquiry {
  id: number;
  customer_name: string;
  contact_info: string;
  subject: string;
  description: string;
  status: InquiryStatus;
  visibility: InquiryVisibility;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface InquiryList {
  inquiries: Inquiry[];
  pagination: Pagination;
}
