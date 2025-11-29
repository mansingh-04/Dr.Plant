import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { plantsAPI } from '../lib/api';
import { toast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export const AIAnalyzeModal = ({ open, onClose, plantId, species, initialImage }: any) => {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<any>(null);
  const [showReanalyzeConfirm, setShowReanalyzeConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setResult(null);
      setShowReanalyzeConfirm(false);
    }
  }, [open]);

  const performAnalysis = async (forceReanalyze: boolean) => {
    try {
      if (!analyzeMutation.isPending) {
        toast({ title: 'Analyzing...', description: 'AI is processing your plant image.' });
      }

      console.log('Frontend: Sending analyze request for plantId:', plantId, 'force:', forceReanalyze);
      const response = await plantsAPI.analyzeImage(plantId, { force: forceReanalyze });
      console.log('Frontend: Received response:', response);
      const responseData = response.data;

      if (responseData.status === 'cached' && !forceReanalyze) {
        setResult(responseData.data);
        setShowReanalyzeConfirm(true);
        toast({ title: 'Cached Result', description: 'Showing previous analysis.' });
      } else {
        setResult(responseData.data);
        queryClient.invalidateQueries({ queryKey: ['plant', plantId] });
        toast({ title: 'Analysis complete!', description: 'Check the results below' });
        setShowReanalyzeConfirm(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Could not analyze the image';
      toast({
        title: 'Analysis failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setShowReanalyzeConfirm(false);
    }
  };

  const analyzeMutation = useMutation({
    mutationFn: () => performAnalysis(false),
  });

  const handleClose = () => {
    setResult(null);
    setShowReanalyzeConfirm(false);
    onClose();
  };

  // Parse suggestionText if it's a string
  const parsedResult = result ? {
    ...result,
    suggestionText: typeof result.suggestionText === 'string'
      ? (result.suggestionText.startsWith('{') ? JSON.parse(result.suggestionText) : result.suggestionText)
      : result.suggestionText
  } : null;

  // Extract structured data if available
  const displayData = parsedResult?.suggestionText && typeof parsedResult.suggestionText === 'object'
    ? parsedResult.suggestionText
    : parsedResult;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Plant Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!result ? (
            <>
              {initialImage ? (
                <div className="mt-2 relative rounded-lg overflow-hidden">
                  <img
                    src={initialImage}
                    alt="Plant to analyze"
                    className="w-full max-h-64 object-cover"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No image available to analyze.
                </div>
              )}

              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending || !initialImage}
                className="w-full"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Plant
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Plant Name:</strong> {displayData?.['Plant Name'] || displayData?.species || 'Unknown'}
                </AlertDescription>
              </Alert>

              {displayData?.['Diseases'] && displayData['Diseases'].length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Detected Diseases:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {displayData['Diseases'].map((disease: string, idx: number) => (
                      <li key={idx} className="text-destructive">{disease}</li>
                    ))}
                  </ul>
                </div>
              )}

              {displayData?.['Sympotoms'] && displayData['Sympotoms'].length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Symptoms:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {displayData['Sympotoms'].map((symptom: string, idx: number) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fallback for simple text suggestion */}
              {typeof displayData === 'string' && (
                <p className="text-sm text-muted-foreground">{displayData}</p>
              )}

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={showReanalyzeConfirm} onOpenChange={setShowReanalyzeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already Analyzed</AlertDialogTitle>
            <AlertDialogDescription>
              You have already analyzed this image. Do you want to analyze it again?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReanalyzeConfirm(false)}>View Existing</AlertDialogCancel>
            <AlertDialogAction onClick={() => performAnalysis(true)}>
              Analyze Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
