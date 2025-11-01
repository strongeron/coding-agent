import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChatInterface } from '../components/Chat/ChatInterface';
import { ConversationList } from '../components/Sidebar/ConversationList';
import { SandboxPanel } from '../components/Sidebar/SandboxPanel';
import { Button } from '../components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && !conversationId) {
      createNewConversation();
    }
  }, [user]);

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'New Conversation',
      })
      .select()
      .single();

    if (data) {
      setConversationId(data.id);
    }
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
  };

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 border-r border-sidebar-border bg-sidebar overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <h1 className="font-bold text-lg text-sidebar-foreground">Mastra Agent</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationList
              currentConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={createNewConversation}
            />
          </div>

          <div className="p-4 border-t border-sidebar-border space-y-4">
            <SandboxPanel conversationId={conversationId} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-sidebar-foreground truncate opacity-70">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card p-4 flex items-center gap-4 shadow-sm">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Coding Agent Chat</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered coding assistant with Daytona sandboxes
            </p>
          </div>
        </header>

        {conversationId ? (
          <ChatInterface conversationId={conversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
