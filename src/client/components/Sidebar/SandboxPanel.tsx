import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Terminal, Package } from 'lucide-react';

interface Sandbox {
  id: string;
  sandbox_id: string;
  language: string;
  status: string;
  created_at: string;
}

interface SandboxPanelProps {
  conversationId: string | null;
}

export function SandboxPanel({ conversationId }: SandboxPanelProps) {
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    loadSandboxes();
  }, [conversationId]);

  const loadSandboxes = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('sandboxes')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading sandboxes:', error);
        return;
      }

      if (data) {
        setSandboxes(data);
      }
    } catch (err) {
      console.error('Failed to load sandboxes:', err);
    }
  };

  if (!conversationId || sandboxes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Sandboxes
          </CardTitle>
          <CardDescription className="text-xs">
            No active sandboxes
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Active Sandboxes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sandboxes.map((sandbox) => (
          <div
            key={sandbox.id}
            className="p-3 rounded-lg border bg-card space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium font-mono">
                  {sandbox.sandbox_id.slice(0, 8)}...
                </span>
              </div>
              <Badge
                variant={sandbox.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {sandbox.status}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Language: {sandbox.language}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
