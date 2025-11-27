"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      language: "en",
      currency: "IDR",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register/", data);
      const { tokens, user } = response.data;

      // Store tokens
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);

      // Set user in store
      setUser(user);

      toast.success("Registration successful! Welcome to Okane Kakeibo! 🎉");
      router.push("/setup");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.email?.[0] ||
        error.response?.data?.username?.[0] ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account 🚀
            </h1>
            <p className="text-gray-600">
              Start your journey with Okane Kakeibo budgeting
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.first_name?.message}
                {...register("first_name")}
              />

              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.last_name?.message}
                {...register("last_name")}
              />
            </div>

            <Input
              label="Username"
              placeholder="johndoe"
              error={errors.username?.message}
              {...register("username")}
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.password2?.message}
                {...register("password2")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register("language")}
                >
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                </select>
                {errors.language && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.language.message}
                  </p>
                )}
              </div>

              <Input
                label="Currency"
                placeholder="IDR"
                error={errors.currency?.message}
                {...register("currency")}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
