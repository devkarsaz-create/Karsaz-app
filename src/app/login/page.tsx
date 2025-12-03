'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth(); // We get the setUser function from our context
  const { toast } = useToast();
  const router = useRouter();

  // This function will be replaced with a call to our api.ts
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- API Call Simulation ---
    // In the future, this will be: const { user, error } = await api.login(email, password);
    console.log("Attempting login with:", email, password);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // SIMULATED SUCCESS
    const simulatedUser = {
      id: '12345-abcde',
      email: email,
      fullName: 'کاربر تست',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
    };
    setUser(simulatedUser);
    toast({
      title: "ورود موفقیت‌آمیز بود",
      description: `خوش آمدید، ${simulatedUser.fullName}! در حال انتقال به صفحه اصلی...`,
      className: "bg-green-600 border-green-700 text-white",
    });
    router.push('/');

    // SIMULATED FAILURE EXAMPLE
    /*
    const error = { message: "ایمیل یا رمز عبور اشتباه است." };
    if (error) {
      toast({
        title: "خطا در ورود",
        description: error.message,
        variant: "destructive",
      });
    }
    */
    // --- End API Call Simulation ---

    setIsLoading(false);
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
        <Card className="w-full max-w-md glass-effect border-white/10">
            <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <LogIn className="h-10 w-10 text-indigo-400" />
                </div>
                <CardTitle className="text-3xl font-bold gradient-text">ورود به حساب</CardTitle>
                <CardDescription>برای دسترسی به داشبورد و آگهی‌های خود وارد شوید</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-muted-foreground">ایمیل</label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="you@example.com" 
                            required 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-muted-foreground">رمز عبور</label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••"
                            required 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'در حال بررسی...' : 'ورود'}
                    </Button>
                     <p className="text-xs text-muted-foreground">
                        حساب کاربری ندارید؟{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            ثبت‌نام کنید
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
