// src/app/chat/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Message, User } from '@/lib/supabase';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ChatListItem {
  ad_id: string;
  ad_title: string;
  other_user: User;
  last_message_content: string;
  last_message_created_at: string;
}

async function getChatList(userId: string): Promise<ChatListItem[]> {
  // Fetch all messages involving the current user
  const { data: messages, error } = await supabaseClient
    .from('messages')
    .select('*, sender:users!messages_sender_id_fkey(*), receiver:users!messages_receiver_id_fkey(*), ads(title)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }

  const chatsMap = new Map<string, ChatListItem>();

  for (const message of messages) {
    const otherUser = message.sender_id === userId ? message.receiver : message.sender;
    const chatId = message.ad_id + "-" + otherUser.id;

    if (!chatsMap.has(chatId)) {
      chatsMap.set(chatId, {
        ad_id: message.ad_id,
        ad_title: (message.ads as { title: string }).title,
        other_user: otherUser as User,
        last_message_content: message.content,
        last_message_created_at: message.created_at,
      });
    }
  }

  return Array.from(chatsMap.values());
}

export default async function ChatPage() {
  const supabaseServer = createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const chatList = await getChatList(user.id);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-center mb-8">چت‌ها</h1>
      {chatList.length === 0 ? (
        <p className="text-center text-gray-400">شما تا کنون چتی ندارید.</p>
      ) : (
        <div className="space-y-4">
          {chatList.map((chat) => (
            <Link key={`${chat.ad_id}-${chat.other_user.id}`} href={`/chat/${chat.ad_id}?userId=${chat.other_user.id}`}>
              <Card className="hover:bg-gray-700 transition-colors cursor-pointer">
                <CardContent className="flex items-center p-4">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={chat.other_user.avatar_url || undefined} />
                    <AvatarFallback>{chat.other_user.full_name?.charAt(0) || chat.other_user.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {chat.other_user.full_name || chat.other_user.email}
                      <span className="text-sm text-gray-400 font-normal"> - {chat.ad_title}</span>
                    </CardTitle>
                    <p className="text-gray-300 line-clamp-1">{chat.last_message_content}</p>
                    <p className="text-xs text-gray-500 text-right">
                      {new Date(chat.last_message_created_at).toLocaleString("fa-IR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}