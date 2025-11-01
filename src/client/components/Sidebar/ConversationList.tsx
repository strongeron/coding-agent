import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationListProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      if (data) {
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting conversation:', error);
        return;
      }

      setConversations(conversations.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        onNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNewConversation} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors',
                currentConversationId === conversation.id && 'bg-accent'
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{conversation.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(conversation.id, e)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No conversations yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
