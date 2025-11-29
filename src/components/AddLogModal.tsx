import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { logsAPI } from '../lib/api';
import { toast } from '../hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LOG_TYPES = ['Watered', 'Fertilized', 'Pruned', 'Repotted', 'Observed', 'Other'];

export const AddLogModal = ({ open, onClose, plantId, log }: any) => {
  const queryClient = useQueryClient();
  const [logType, setLogType] = useState('Watered');
  const [logValue, setLogValue] = useState('');
  const [note, setNote] = useState('');
  const [logDate, setLogDate] = useState('');

  useEffect(() => {
    if (log) {
      setLogType(log.logType);
      setLogValue(log.logValue || '');
      setNote(log.note || '');
      // Format date for datetime-local input (YYYY-MM-DDThh:mm)
      const date = new Date(log.logDate || log.createdAt);
      const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setLogDate(formattedDate);
    } else {
      setLogType('Watered');
      setLogValue('');
      setNote('');
      setLogDate('');
    }
  }, [log, open]);

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        logType,
        logValue,
        note,
        logDate: logDate ? new Date(logDate).toISOString() : new Date().toISOString()
      };

      if (log) {
        return logsAPI.updateLog(log.id, data);
      } else {
        return logsAPI.addLogs(plantId, { logs: [data] });
      }
    },
    onSuccess: () => {
      toast({
        title: log ? 'Log updated!' : 'Log added!',
        description: log ? 'Plant log updated successfully' : 'Plant log recorded successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['plant', plantId] });
      handleClose();
    },
    onError: () => {
      toast({
        title: log ? 'Failed to update log' : 'Failed to add log',
        description: log ? 'Could not update the log' : 'Could not record the log',
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    if (!log) {
      setLogType('Watered');
      setLogValue('');
      setNote('');
      setLogDate('');
    }
    onClose();
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{log ? 'Edit Plant Log' : 'Add Plant Log'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Log Type</Label>
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOG_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="logValue">Value (e.g., 500ml, 2 leaves)</Label>
            <Input
              id="logValue"
              value={logValue}
              onChange={(e) => setLogValue(e.target.value)}
              placeholder="Enter value"
            />
          </div>

          <div>
            <Label htmlFor="logDate">Date & Time</Label>
            <Input
              id="logDate"
              type="datetime-local"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {log ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              log ? 'Update Log' : 'Add Log'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
