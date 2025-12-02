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
import { Mail, Lock, User, Chrome, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClientComponentClient();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "خطا",
        description: "رمز عبور و تکرار آن یکسان نیستند.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "خطا",
        description: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "خطا در ثبت نام",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "ثبت نام موفق",
        description: "لینک تأیید به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({
        title: "خطا در ثبت نام با Google",
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
              ثبت نام در کارساز
            </CardTitle>
            <CardDescription className="text-base mt-2">
              حساب کاربری جدید ایجاد کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 h-12 glass-effect border-white/10 hover:bg-white/5"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
            >
              <Chrome className="h-5 w-5" />
              {googleLoading ? "در حال ثبت نام..." : "ثبت نام با Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">یا</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">نام و نام خانوادگی</Label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="نام و نام خانوادگی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pr-12 h-12 glass-effect border-white/10 focus:border-primary/50"
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
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
                    placeholder="حداقل ۶ کاراکتر"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12 h-12 glass-effect border-white/10 focus:border-primary/50"
                    required
                    minLength={6}
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">تکرار رمز عبور</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="تکرار رمز عبور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "در حال ثبت نام..." : "ثبت نام"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground pt-4 border-t border-white/10">
              حساب کاربری دارید؟{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                وارد شوید
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
