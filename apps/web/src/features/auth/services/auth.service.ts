import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name?: string;
}

export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface SetPasswordData {
  token: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await apiClient.post(endpoints.auth.login, credentials);
    return data;
  },

  async register(data: RegisterData) {
    const { data: response } = await apiClient.post(endpoints.auth.register, data);
    return response;
  },

  async verifyCode(data: VerifyCodeData) {
    const { data: response } = await apiClient.post(endpoints.auth.verifyCode, data);
    return response;
  },

  async setPassword(data: SetPasswordData) {
    const { data: response } = await apiClient.post(endpoints.auth.setPassword, data);
    return response;
  },

  async forgotPassword(data: ForgotPasswordData) {
    const { data: response } = await apiClient.post(endpoints.auth.forgotPassword, data);
    return response;
  },

  async resetPassword(data: { token: string; email: string; password: string }) {
    const { data: response } = await apiClient.post(endpoints.auth.resetPassword, data);
    return response;
  },

  async resendVerification(email: string) {
    const { data } = await apiClient.post(endpoints.auth.resendVerification, { email });
    return data;
  },

  async getMe() {
    const { data } = await apiClient.get(endpoints.auth.me);
    return data;
  },

  async logout() {
    const { data } = await apiClient.post(endpoints.auth.logout);
    return data;
  },
};