'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, UserCircle, PlusCircle, LayoutDashboard } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AuthStatus() {
  const { user, loading } = useAuth();
  // const router = useRouter(); // We might need this for logout

  // In the future, the logout function will live in the AuthContext
  const handleLogout = async () => {
    // await logout();
    // router.refresh();
    alert('Logout functionality not yet implemented.');
  };

  if (loading) {
    return <div className="h-10 w-24 bg-white/10 animate-pulse rounded-lg"></div>;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt={user.fullName || user.email} />
              <AvatarFallback>{(user.fullName || user.email)?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-effect">
          <DropdownMenuLabel>
            <p className="font-bold">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>داشبورد</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/new-ad">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>آگهی جدید</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>پروفایل من</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-500 focus:bg-red-500/10">
            <LogIn className="mr-2 h-4 w-4" />
            <span>خروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild variant="ghost" className="hover:bg-white/10">
      <Link href="/login">
        <LogIn className="mr-2 h-4 w-4" />
        ورود / ثبت‌نام
      </Link>
    </Button>
  );
}
