'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth(); // We might use this to auto-login after signup
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- API Call Simulation ---
    // In the future, this will be: const { user, error } = await api.signup(email, password, fullName);
    console.log("Attempting signup with:", email, fullName);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // SIMULATED SUCCESS
    toast({
        title: "ثبت‌نام موفقیت‌آمیز بود",
        description: "حساب شما با موفقیت ایجاد شد. لطفاً وارد شوید.",
        className: "bg-green-600 border-green-700 text-white",
    });
    router.push('/login');

    // SIMULATED FAILURE EXAMPLE
    /*
    const error = { message: "این ایمیل قبلاً ثبت‌نام کرده است." };
    if (error) {
      toast({
        title: "خطا در ثبت‌نام",
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
                    <UserPlus className="h-10 w-10 text-indigo-400" />
                </div>
                <CardTitle className="text-3xl font-bold gradient-text">ایجاد حساب جدید</CardTitle>
                <CardDescription>به بزرگترین پلتفرم نیازمندی‌های ایران بپیوندید</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">نام کامل</label>
                        <Input 
                            id="fullName" 
                            type="text" 
                            placeholder="مثلاً: علی رضایی"
                            required 
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
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
                            placeholder="حداقل ۸ کاراکتر"
                            required 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'در حال ایجاد حساب...' : 'ثبت‌نام'}
                    </Button>
                     <p className="text-xs text-muted-foreground">
                        قبلاً ثبت‌نام کرده‌اید؟{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            وارد شوید
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
