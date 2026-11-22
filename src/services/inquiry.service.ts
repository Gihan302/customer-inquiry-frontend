import type {
  ApiSuccess,
  Inquiry,
  InquiryList,
  InquiryStatus,
  InquiryVisibility,
} from '../types';
import { api } from './api';

export interface InquiryListParams {
  page?: number;
  limit?: number;
  status?: InquiryStatus;
  visibility?: InquiryVisibility;
  search?: string;
}

export interface InquiryFields {
  customer_name: string;
  contact_info: string;
  subject: string;
  description: string;
}

export interface CreateInquiryInput extends InquiryFields {
  visibility: InquiryVisibility;
}

export interface UpdateInquiryInput extends InquiryFields {
  /** The updated_at value the user was looking at; the server returns 409 if the record changed since. */
  expected_updated_at?: string;
}

/** GET /inquiries: the backend only returns Public inquiries and the caller's own Private ones. */
export async function listInquiries(params: InquiryListParams = {}): Promise<InquiryList> {
  // Drop empty values so the URL stays clean (e.g. no "?search=").
  const query = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  );
  const res = await api.get<ApiSuccess<InquiryList>>('/inquiries', { params: query });
  return res.data.data;
}

export async function getInquiry(id: number): Promise<Inquiry> {
  const res = await api.get<ApiSuccess<{ inquiry: Inquiry }>>(`/inquiries/${id}`);
  return res.data.data.inquiry;
}

export async function createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
  const res = await api.post<ApiSuccess<{ inquiry: Inquiry }>>('/inquiries', input);
  return res.data.data.inquiry;
}

export async function updateInquiry(id: number, input: UpdateInquiryInput): Promise<Inquiry> {
  const res = await api.put<ApiSuccess<{ inquiry: Inquiry }>>(`/inquiries/${id}`, input);
  return res.data.data.inquiry;
}

export async function updateInquiryStatus(
  id: number,
  status: InquiryStatus,
): Promise<{ inquiry: Inquiry; changed: boolean; message: string }> {
  const res = await api.patch<ApiSuccess<{ inquiry: Inquiry }>>(`/inquiries/${id}/status`, { status });
  return {
    inquiry: res.data.data.inquiry,
    changed: res.data.message !== 'Inquiry status unchanged',
    message: res.data.message,
  };
}
