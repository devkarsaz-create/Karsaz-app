// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import { createSupabaseClientComponentClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClientComponentClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("لینک تأیید به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.");
      // Optionally, redirect to a confirmation page
      // router.push("/check-email");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] px-4">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">ثبت نام در کارساز</CardTitle>
          <CardDescription>ایمیل و رمز عبور خود را برای ایجاد حساب وارد کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "در حال ثبت نام..." : "ثبت نام"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">
            حساب کاربری دارید؟{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
              ورود
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
