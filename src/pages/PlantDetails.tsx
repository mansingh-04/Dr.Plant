import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantsAPI, logsAPI, API_BASE_URL } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { LogsList } from '../components/LogsList';
import { AddLogModal } from '../components/AddLogModal';
import { Loading } from '../components/Loading';
import { AIAnalyzeModal } from '../components/AIAnalyzeModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { toast } from '../hooks/use-toast';
import { ArrowLeft, Edit, Trash2, Plus, Sparkles, Leaf, Upload, Droplets, Sun, Sprout, AlertTriangle, Info, History } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

const PlantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCareTipsModal, setShowCareTipsModal] = useState(false);
  const [careTips, setCareTips] = useState<any>(null);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [deletingLog, setDeletingLog] = useState<any>(null);

  const { data: plant, isLoading } = useQuery({
    queryKey: ['plant', id],
    queryFn: async () => {
      const response = await plantsAPI.getById(id!);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => plantsAPI.delete(id!),
    onSuccess: () => {
      toast({ title: 'Plant deleted', description: 'Plant removed successfully' });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      navigate('/plants');
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Could not delete plant',
        variant: 'destructive',
      });
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (logId: string) => logsAPI.deleteLog(logId),
    onSuccess: () => {
      toast({ title: 'Log deleted', description: 'Log removed successfully' });
      queryClient.invalidateQueries({ queryKey: ['plant', id] });
      setDeletingLog(null);
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Could not delete log',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <Loading message="Fetching plant details..." />;
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Plant not found</h2>
          <Link to="/plants">
            <Button>Back to Garden</Button>
          </Link>
        </div>
      </div>
    );
  }


  const imageUrl = plant.images?.[0]?.imageUrl
    ? `${API_BASE_URL}${plant.images[0].imageUrl}`
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-[40vh] min-h-[350px] mb-20">
        {/* Blurred Background */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 dark:opacity-20 scale-110"
          style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none', backgroundColor: imageUrl ? 'transparent' : 'var(--primary)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end relative z-10 translate-y-12">
          <div className="flex flex-col md:flex-row items-end gap-8 w-full">
            {/* Main Image */}
            <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 relative group bg-white dark:bg-gray-900">
              {imageUrl ? (
                <img src={imageUrl} alt={plant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Leaf className="w-20 h-20 text-primary/40" />
                </div>
              )}

              {/* Quick Update Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <label htmlFor="quick-image-upload" className="cursor-pointer p-4 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg transform hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6 text-primary" />
                  <input
                    id="quick-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('name', plant.name);
                        formData.append('species', plant.species);
                        formData.append('image', file);

                        plantsAPI.update(id!, formData)
                          .then(() => {
                            toast({ title: 'Image updated', description: 'New image uploaded successfully' });
                            queryClient.invalidateQueries({ queryKey: ['plant', id] });
                            queryClient.invalidateQueries({ queryKey: ['plants'] });
                          })
                          .catch(() => {
                            toast({ title: 'Update failed', description: 'Could not upload image', variant: 'destructive' });
                          });
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Title & Actions */}
            <div className="flex-1 mb-4 w-full md:w-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2 drop-shadow-sm">{plant.name}</h1>
                  <Badge variant="secondary" className="text-lg px-4 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                    {plant.species}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Link to={`/plants/${id}/edit`}>
                    <Button variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-panel border-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete plant?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the plant and all its logs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* Top Section: Actions, Health History, and Logs */}
        <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Left Column: Actions & Health History */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-10">
            {/* Action Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div
                onClick={() => setShowAIModal(true)}
                className="glass-card p-6 rounded-2xl cursor-pointer group border border-white/20 dark:border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="p-3 bg-purple-500/10 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">AI Health Check</h3>
                  <p className="text-sm text-muted-foreground">Analyze your plant for diseases and get instant treatment advice.</p>
                </div>
              </div>

              <div
                onClick={() => setShowCareTipsModal(true)}
                className="glass-card p-6 rounded-2xl cursor-pointer group border border-white/20 dark:border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sprout className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="p-3 bg-emerald-500/10 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Leaf className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Get Care Tips</h3>
                  <p className="text-sm text-muted-foreground">Receive personalized watering, sunlight, and soil recommendations.</p>
                </div>
              </div>
            </div>

            {/* Recommendations History */}
            {plant.recommendations && plant.recommendations.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <History className="w-5 h-5 mr-2 text-primary" />
                  Health Analysis History
                </h3>
                <RecommendationCarousel recommendations={plant.recommendations} />
              </div>
            )}
          </div>

          {/* Right Column: Logs */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-xl font-bold">Care Logs</h3>
              <Button onClick={() => setShowLogModal(true)} size="sm" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Log
              </Button>
            </div>
            <div className="overflow-y-auto custom-scrollbar pr-2 -mr-2 flex-1">
              <LogsList
                logs={plant.logs}
                onEdit={(log: any) => {
                  setEditingLog(log);
                  setShowLogModal(true);
                }}
                onDelete={(log: any) => setDeletingLog(log)}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: Care Tips History (Full Width) */}
        {plant.careTips && plant.careTips.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl w-full">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <History className="w-5 h-5 mr-2 text-primary" />
              Care Tips History
            </h3>
            <CareTipsCarousel careTips={plant.careTips} />
          </div>
        )}
      </div>

      <AddLogModal
        open={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setEditingLog(null);
        }}
        plantId={id}
        log={editingLog}
      />

      <AIAnalyzeModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        plantId={id}
        species={plant.species}
        initialImage={imageUrl}
      />

      <AlertDialog open={showCareTipsModal} onOpenChange={setShowCareTipsModal}>
        <AlertDialogContent className="glass-panel border-none max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex justify-between items-center text-2xl">
              <span>Personalized Care Tips</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              We'll analyze your plant's health and recent care logs to provide custom care advice.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1 custom-scrollbar">
            {!careTips ? (
              <div className="space-y-4">
                {plant.logs && plant.logs.length > 0 ? (
                  <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertTitle>Ready to Analyze</AlertTitle>
                    <AlertDescription>
                      We will use your {plant.logs.length > 10 ? '10 most recent' : `${plant.logs.length}`} care logs to generate personalized advice.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No Logs Found</AlertTitle>
                    <AlertDescription>
                      You haven't added any care logs yet. The advice will be generic. We recommend adding logs (watering, etc.) first for better results.
                    </AlertDescription>
                  </Alert>
                )}

                {(!plant.logs || plant.logs.length === 0) && (
                  <Button variant="outline" onClick={() => {
                    setShowCareTipsModal(false);
                    setShowLogModal(true);
                  }} className="w-full border-dashed border-2 h-16">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Care Log First
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <CareTipsDisplay tips={careTips} />
              </div>
            )}
          </div>

          <AlertDialogFooter className="mt-auto pt-4 border-t border-white/10">
            <AlertDialogCancel onClick={() => {
              setShowCareTipsModal(false);
              setCareTips(null);
            }}>Close</AlertDialogCancel>

            {!careTips && (
              <Button
                onClick={async () => {
                  setIsGeneratingTips(true);
                  try {
                    const res = await plantsAPI.getCareTips(id!, {});
                    setCareTips(res.data.careTips);
                    queryClient.invalidateQueries({ queryKey: ['plant', id] });
                  } catch (e) {
                    toast({ title: "Error", description: "Failed to generate tips", variant: "destructive" });
                  } finally {
                    setIsGeneratingTips(false);
                  }
                }}
                disabled={isGeneratingTips}
                className="bg-primary hover:bg-primary/90"
              >
                {isGeneratingTips ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Tips
                  </>
                )}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingLog} onOpenChange={(open) => !open && setDeletingLog(null)}>
        <AlertDialogContent className="glass-panel border-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Log?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this log entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingLog && deleteLogMutation.mutate(deletingLog.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

const CareTipsDisplay = ({ tips }: { tips: string | object }) => {
  let parsedTips: any = tips;

  if (typeof tips === 'string') {
    try {
      parsedTips = JSON.parse(tips);
    } catch (e) {
      parsedTips = { general: tips };
    }
  }

  if (typeof parsedTips === 'string') {
    return <div className="whitespace-pre-line text-sm">{parsedTips}</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {parsedTips.water && (
        <Card className="bg-blue-500/5 border-blue-500/20 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-blue-600 dark:text-blue-400">
              <Droplets className="w-4 h-4 mr-2" />
              Watering
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {parsedTips.water}
          </CardContent>
        </Card>
      )}

      {parsedTips.sunlight && (
        <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-amber-600 dark:text-amber-400">
              <Sun className="w-4 h-4 mr-2" />
              Sunlight
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {parsedTips.sunlight}
          </CardContent>
        </Card>
      )}

      {parsedTips.soil && (
        <Card className="bg-stone-500/5 border-stone-500/20 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-stone-600 dark:text-stone-400">
              <Sprout className="w-4 h-4 mr-2" />
              Soil & Fertilizer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {parsedTips.soil}
          </CardContent>
        </Card>
      )}

      {parsedTips.warnings && (
        <Card className="bg-red-500/5 border-red-500/20 shadow-none sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Important Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {parsedTips.warnings}
          </CardContent>
        </Card>
      )}

      {parsedTips.general && (
        <Card className="sm:col-span-2 bg-primary/5 border-primary/10 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center text-primary">
              <Info className="w-4 h-4 mr-2" />
              General Advice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {parsedTips.general}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const RecommendationCarousel = ({ recommendations }: { recommendations: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

  const rec = recommendations[currentIndex];

  let parsedSuggestion = null;
  try {
    parsedSuggestion = typeof rec.suggestionText === 'string' && rec.suggestionText.startsWith('{')
      ? JSON.parse(rec.suggestionText)
      : null;
  } catch (e) {
    console.error("Failed to parse suggestion text", e);
  }


  const displayData = parsedSuggestion || { suggestionText: rec.suggestionText };
  const recImageUrl = rec.plantImage?.id ? `${API_BASE_URL}/plants/images/${rec.plantImage.id}` : null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevSlide} disabled={recommendations.length <= 1} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1} / {recommendations.length}
        </span>
        <Button variant="ghost" size="icon" onClick={nextSlide} disabled={recommendations.length <= 1} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>

      <div className="border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
        {/* Associated Image */}
        <div className="w-full md:w-1/3 shrink-0">
          {recImageUrl ? (
            <div className="w-full bg-muted rounded-xl overflow-hidden border border-black/5">
              <img src={recImageUrl} alt="Analyzed Plant" className="w-full h-auto max-h-[300px] object-contain mx-auto" />
            </div>
          ) : (
            <div className="aspect-square rounded-xl overflow-hidden border bg-muted/50 flex items-center justify-center">
              <Leaf className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="mt-3 text-center">
            <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
              Analyzed on {new Date(rec.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="flex-1">
          {displayData['Plant Name'] && (
            <h4 className="font-bold text-xl text-primary mb-4">
              {displayData['Plant Name']}
            </h4>
          )}

          {displayData['Diseases'] && displayData['Diseases'].length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Detected Issues</p>
              <div className="flex flex-wrap gap-2">
                {displayData['Diseases'].map((disease: string, i: number) => (
                  <Badge key={i} variant="destructive" className="text-sm px-3 py-1">
                    {disease}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {displayData['Sympotoms'] && displayData['Sympotoms'].length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {displayData['Sympotoms'].map((symptom: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-sm bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 px-3 py-1">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!parsedSuggestion && rec.suggestionText && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {rec.suggestionText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CareTipsCarousel = ({ careTips }: { careTips: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % careTips.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + careTips.length) % careTips.length);
  };

  const tip = careTips[currentIndex];

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevSlide} disabled={careTips.length <= 1} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1} / {careTips.length}
        </span>
        <Button variant="ghost" size="icon" onClick={nextSlide} disabled={careTips.length <= 1} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>

      <div className="border border-black/5 dark:border-white/5 rounded-2xl p-6">
        <p className="text-xs text-muted-foreground mb-4 text-center font-medium">
          Generated on {new Date(tip.createdAt).toLocaleDateString()} at {new Date(tip.createdAt).toLocaleTimeString()}
        </p>
        <CareTipsDisplay tips={tip.tips} />
      </div>
    </div>
  );
};

export default PlantDetails;
