"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { Language } from "@/i18n/translations";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, User, Lock, Globe, DollarSign, Save } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { t, setLanguage } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    username: "", email: "", first_name: "", last_name: "", phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "", new_password: "", confirm_password: "",
  });
  const [preferencesData, setPreferencesData] = useState({
    language: "en", currency: "IDR",
  });
  const [goalsData, setGoalsData] = useState({
    monthly_income_goal: "", monthly_savings_goal: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      });
      setPreferencesData({
        language: user.language || "en",
        currency: user.currency || "IDR",
      });
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/accounts/profile/");
      setGoalsData({
        monthly_income_goal: res.data.monthly_income_goal || "",
        monthly_savings_goal: res.data.monthly_savings_goal || "",
      });
    } catch {
      console.error("Failed to fetch profile");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.patch("/accounts/me/", profileData);
      setUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/accounts/change-password/", {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success("Password updated successfully!");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.patch("/accounts/me/", preferencesData);
      setUser(res.data);
      setLanguage(preferencesData.language as Language);
      toast.success("Preferences updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.patch("/accounts/profile/", {
        monthly_income_goal: parseFloat(goalsData.monthly_income_goal),
        monthly_savings_goal: parseFloat(goalsData.monthly_savings_goal),
      });
      toast.success("Financial goals updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update goals");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile",     labelKey: "profile_tab" as const,     icon: User       },
    { id: "password",    labelKey: "password_tab" as const,    icon: Lock       },
    { id: "preferences", labelKey: "preferences_tab" as const, icon: Globe      },
    { id: "goals",       labelKey: "goals_tab" as const,       icon: DollarSign },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("settings_title")}</h1>
        <p className="text-gray-600 mt-1">{t("settings_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Icon className="w-5 h-5" />
                  <span>{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("profile_information")}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("username")}</label>
                      <Input type="text" value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("email")}</label>
                      <Input type="email" value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("first_name")}</label>
                      <Input type="text" value={profileData.first_name}
                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("last_name")}</label>
                      <Input type="text" value={profileData.last_name}
                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("phone_number")}</label>
                      <Input type="tel" value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {t("save_changes")}
                </Button>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("change_password")}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("current_password")}</label>
                      <Input type="password" value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("new_password")}</label>
                      <Input type="password" value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} required minLength={6} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("confirm_new_password")}</label>
                      <Input type="password" value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} required minLength={6} />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {t("update_password")}
                </Button>
              </form>
            )}

            {activeTab === "preferences" && (
              <form onSubmit={handleUpdatePreferences} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("preferences")}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("language")}</label>
                      <select value={preferencesData.language}
                        onChange={(e) => setPreferencesData({ ...preferencesData, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                        <option value="ja">日本語 (Japanese)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("currency")}</label>
                      <select value={preferencesData.currency}
                        onChange={(e) => setPreferencesData({ ...preferencesData, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="IDR">IDR - Indonesian Rupiah</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {t("save_preferences")}
                </Button>
              </form>
            )}

            {activeTab === "goals" && (
              <form onSubmit={handleUpdateGoals} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("financial_goals")}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("monthly_income_goal")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <input type="number" value={goalsData.monthly_income_goal}
                          onChange={(e) => setGoalsData({ ...goalsData, monthly_income_goal: e.target.value })}
                          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0" step="0.01" min="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("monthly_savings_goal")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <input type="number" value={goalsData.monthly_savings_goal}
                          onChange={(e) => setGoalsData({ ...goalsData, monthly_savings_goal: e.target.value })}
                          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0" step="0.01" min="0" />
                      </div>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {t("save_goals")}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}