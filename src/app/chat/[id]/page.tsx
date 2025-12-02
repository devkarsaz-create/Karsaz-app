// src/app/chat/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';
import { Message, Ad, User } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ChatPageProps {
  params: { id: string };
  searchParams: { userId: string };
}

export default function ChatPage({ params, searchParams }: ChatPageProps) {
  const adId = params.id;
  const otherUserId = searchParams.userId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClientComponentClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadChat() {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      setCurrentUser(authUser as User);

      // Fetch other user details
      const { data: otherUserData, error: otherUserError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single();
      if (otherUserError) {
        console.error('Error fetching other user:', otherUserError);
        setError('خطا در بارگذاری اطلاعات کاربر دیگر.');
        setLoading(false);
        return;
      }
      setOtherUser(otherUserData as User);

      // Fetch ad details
      const { data: adData, error: adError } = await supabaseClient
        .from('ads')
        .select('title')
        .eq('id', adId)
        .single();
      if (adError) {
        console.error('Error fetching ad:', adError);
        setError('خطا در بارگذاری اطلاعات آگهی.');
        setLoading(false);
        return;
      }
      setAd(adData as Ad);

      // Fetch messages
      const { data: initialMessages, error: messagesError } = await supabaseClient
        .from('messages')
        .select('*')
        .or(
          `and(ad_id.eq.${adId},sender_id.eq.${authUser.id},receiver_id.eq.${otherUserId}),` +
          `and(ad_id.eq.${adId},sender_id.eq.${otherUserId},receiver_id.eq.${authUser.id})`
        )
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        setError('خطا در بارگذاری پیام‌ها.');
      } else {
        setMessages(initialMessages || []);
      }
      setLoading(false);
    }

    loadChat();

    // Setup Realtime subscription
    const channel = supabaseClient.channel(`chat_${adId}_${otherUserId}`);
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        // Only add if it belongs to this specific chat
        if (
          (newMessage.ad_id === adId &&
            ((newMessage.sender_id === currentUser?.id && newMessage.receiver_id === otherUserId) ||
              (newMessage.sender_id === otherUserId && newMessage.receiver_id === currentUser?.id))) 
        ) {
          setMessages((prev) => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [adId, otherUserId, router, supabase, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !adId || !otherUserId) return;

    const { error } = await supabaseClient.from('messages').insert({
      ad_id: adId,
      sender_id: currentUser.id,
      receiver_id: otherUserId,
      content: newMessage,
    });

    if (error) {
      console.error('Error sending message:', error);
      setError('خطا در ارسال پیام.');
    } else {
      setNewMessage("");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] mt-16">در حال بارگذاری چت...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] mt-16 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-2xl">
      <Card className="h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={otherUser?.avatar_url || undefined} />
              <AvatarFallback>{otherUser?.full_name?.charAt(0) || otherUser?.email.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{otherUser?.full_name || otherUser?.email}</CardTitle>
              <CardDescription>درباره آگهی: {ad?.title}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${msg.sender_id === currentUser?.id
                  ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-100"}`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="block text-xs text-gray-300 mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleString("fa-IR", { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="border-t pt-4">
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              type="text"
              placeholder="پیام خود را بنویسید..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
