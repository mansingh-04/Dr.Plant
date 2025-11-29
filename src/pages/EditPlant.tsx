import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantsAPI } from '../lib/api';
import { resizeImage } from '../utils/imageUtils';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from '../hooks/use-toast';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';

const DEFAULT_PLANT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

const EditPlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [image, setImage] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: plant, isLoading } = useQuery({
    queryKey: ['plant', id],
    queryFn: async () => {
      const response = await plantsAPI.getById(id!);
      return response.data;
    },
  });

  useEffect(() => {
    if (plant) {
      setName(plant.name);
      setSpecies(plant.species);
      setPreview(plant.images?.[0]?.imageUrl ? `http://localhost:3000${plant.images[0].imageUrl}` : DEFAULT_PLANT_IMAGE);
    }
  }, [plant]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('species', species);
      if (image) {
        formData.append('image', image);
      }
      return plantsAPI.update(id!, formData);
    },
    onSuccess: () => {
      toast({ title: 'Plant updated!', description: 'Changes saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['plant', id] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      navigate(`/plants/${id}`);
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Could not save changes',
        variant: 'destructive',
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e: any) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else if (plant?.images?.[0]?.imageUrl) {
      // If user clears selection but there was an existing image, revert to that
      setImage(null);
      setPreview(plant.images?.[0]?.imageUrl ? `http://localhost:3000${plant.images[0].imageUrl}` : DEFAULT_PLANT_IMAGE);
    } else {
      // If user clears selection and there was no existing image, revert to default
      setImage(null);
      setPreview(DEFAULT_PLANT_IMAGE);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(DEFAULT_PLANT_IMAGE);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !species.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to={`/plants/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plant
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Plant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Plant Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Ficus"
                  required
                />
              </div>

              <div>
                <Label htmlFor="species">Species *</Label>
                <Input
                  id="species"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder="e.g., Ficus elastica"
                  required
                />
              </div>

              <div>
                <Label>Plant Image</Label>
                {preview && preview !== DEFAULT_PLANT_IMAGE ? (
                  <div className="mt-2 relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <label
                      htmlFor="file-upload-edit"
                      className="absolute top-2 left-2 p-1 rounded-md bg-white/70 text-gray-800 cursor-pointer hover:bg-white"
                    >
                      Change Image
                      <input
                        id="file-upload-edit"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label htmlFor="file-upload-edit" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload new image
                      </span>
                      <input
                        id="file-upload-edit"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPlant;
