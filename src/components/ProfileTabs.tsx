"use client";

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MyAds from './MyAds';
import MySubscriptions from './MySubscriptions';
import { User as UserIcon, Package, CreditCard, Settings } from 'lucide-react';

interface ProfileTabsProps {
  user: User;
  userProfile: any;
  activeTab: string;
}

export default function ProfileTabs({ user, userProfile, activeTab }: ProfileTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userProfile?.avatar_url || user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {userProfile?.full_name || user.user_metadata?.full_name || 'کاربر'}
              </CardTitle>
              <CardDescription className="text-base">{user.email}</CardDescription>
              {userProfile?.is_premium && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    <span>👑</span>
                    کاربر پرمیوم
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">آگهی‌های من</span>
            <span className="sm:hidden">آگهی‌ها</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">اشتراک</span>
            <span className="sm:hidden">پلن</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">پروفایل</span>
            <span className="sm:hidden">پروفایل</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">تنظیمات</span>
            <span className="sm:hidden">تنظیمات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="mt-6">
          <MyAds userId={user.id} />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <MySubscriptions userId={user.id} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileEditForm user={user} userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsForm user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileEditForm({ user, userProfile }: { user: User; userProfile: any }) {
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createSupabaseClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone: phone || null,
        location: location || null,
        bio: bio || null,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفقیت",
        description: "پروفایل با موفقیت به‌روزرسانی شد",
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ویرایش پروفایل</CardTitle>
        <CardDescription>اطلاعات شخصی خود را به‌روزرسانی کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">نام و نام خانوادگی</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">شماره تماس</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">موقعیت</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">درباره من</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SettingsForm({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تنظیمات</CardTitle>
        <CardDescription>تنظیمات حساب کاربری</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>ایمیل</Label>
          <Input value={user.email} disabled />
          <p className="text-sm text-muted-foreground mt-1">
            برای تغییر ایمیل با پشتیبانی تماس بگیرید
          </p>
        </div>
        <div>
          <Label>تغییر رمز عبور</Label>
          <Button variant="outline" className="mt-2">
            تغییر رمز عبور
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useToast } from '@/components/ui/use-toast';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';

