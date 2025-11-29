import { format } from 'date-fns';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Droplet, Scissors, Package, Eye, Edit2, Trash2 } from 'lucide-react';

const getLogIcon = (type: string) => {
  switch (type) {
    case 'Watered':
      return <Droplet className="w-4 h-4" />;
    case 'Pruned':
      return <Scissors className="w-4 h-4" />;
    case 'Repotted':
      return <Package className="w-4 h-4" />;
    default:
      return <Eye className="w-4 h-4" />;
  }
};

export const LogsList = ({ logs, onEdit, onDelete }: any) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No logs yet. Add your first log!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log: any) => (
        <Card key={log.id} className="group relative">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">{getLogIcon(log.logType)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{log.logType}</Badge>
                    {log.logValue && (
                      <span className="text-sm font-medium">{log.logValue}</span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEdit(log)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => onDelete(log)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {log.note && (
                  <p className="text-sm text-muted-foreground">{log.note}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(log.logDate || log.createdAt), 'PPP p')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
