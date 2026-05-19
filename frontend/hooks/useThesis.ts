import api from "../lib/api";
import { IThesis, PaginatedResponse } from "../types";

export interface ThesisQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  course?: string;
  year?: number;
}

export function useThesis() {
  // Axios sets multipart/form-data Content-Type automatically (with boundary)
  // when the body is a FormData instance — do NOT set it manually.
  const uploadThesis = async (formData: FormData): Promise<IThesis> => {
    const { data } = await api.post<{ data: IThesis }>("/api/theses", formData);
    return data.data;
  };

  const getTheses = async (
    params?: ThesisQueryParams
  ): Promise<PaginatedResponse<IThesis>> => {
    const { data } = await api.get<{ data: PaginatedResponse<IThesis> }>(
      "/api/theses",
      { params }
    );
    return data.data;
  };

  const getThesisById = async (id: string): Promise<IThesis> => {
    const { data } = await api.get<{ data: IThesis }>(`/api/theses/${id}`);
    return data.data;
  };

  return { uploadThesis, getTheses, getThesisById };
}
