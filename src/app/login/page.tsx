"use client";

import { useState } from "react";
import { createSupabaseClientComponentClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, Chrome, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClientComponentClient();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "خطا در ورود",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "خوش آمدید!",
        description: "با موفقیت وارد شدید.",
      });
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({
        title: "خطا در ورود با Google",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect border-white/10 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">بازگشت به خانه</span>
            </Link>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center glow-effect">
              <span className="text-3xl font-bold text-white">ک</span>
            </div>
            <CardTitle className="text-4xl font-black gradient-text">
              ورود به کارساز
            </CardTitle>
            <CardDescription className="text-base mt-2">
              به حساب کاربری خود وارد شوید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 h-12 glass-effect border-white/10 hover:bg-white/5"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              <Chrome className="h-5 w-5" />
              {googleLoading ? "در حال ورود..." : "ورود با Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">یا</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">ایمیل</Label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-12 h-12 glass-effect border-white/10 focus:border-primary/50"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">رمز عبور</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="رمز عبور خود را وارد کنید"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12 h-12 glass-effect border-white/10 focus:border-primary/50"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/30" 
                disabled={loading || googleLoading}
              >
                {loading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>

            <div className="text-center text-sm space-y-3 pt-4 border-t border-white/10">
              <p className="text-muted-foreground">
                حساب کاربری ندارید؟{" "}
                <Link href="/signup" className="text-primary hover:underline font-semibold">
                  ثبت نام کنید
                </Link>
              </p>
              <Link href="/forgot-password" className="block text-sm text-primary hover:underline">
                رمز عبور را فراموش کرده‌اید؟
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
