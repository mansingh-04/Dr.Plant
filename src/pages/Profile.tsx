import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, API_BASE_URL } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { Loader2, Upload, User } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const profileImageUrl = user?.id ? `${API_BASE_URL}/users/profile-image/${user.id}` : null;

    // Fetch fresh profile data
    const { data: profileData, refetch } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await userAPI.getProfile();
            return response.data;
        },
    });

    useEffect(() => {
        if (profileData) {
            setName(profileData.name);
        }
    }, [profileData]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: { name: string }) => {
            return await userAPI.updateProfile(data);
        },
        onSuccess: (response) => {
            updateUser(response.data);
            toast({
                title: 'Profile updated',
                description: 'Your name has been updated successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Update failed',
                description: error.response?.data?.error || 'Failed to update profile',
                variant: 'destructive',
            });
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('image', file);
            return await userAPI.uploadProfileImage(formData);
        },
        onSuccess: () => {
            setImageFile(null);
            setImagePreview(null);
            setImageSrc(null);
            setShowCropModal(false);
            refetch();
            // Force reload the avatar by updating user state
            updateUser({ ...user });
            toast({
                title: 'Image uploaded',
                description: 'Your profile image has been updated',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Upload failed',
                description: error.response?.data?.error || 'Failed to upload image',
                variant: 'destructive',
            });
        },
    });

    const deleteImageMutation = useMutation({
        mutationFn: async () => {
            return await userAPI.deleteProfileImage();
        },
        onSuccess: () => {
            setImageFile(null);
            setImagePreview(null);
            refetch();
            updateUser({ ...user });
            toast({
                title: 'Image removed',
                description: 'Your profile image has been removed',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Remove failed',
                description: error.response?.data?.error || 'Failed to remove image',
                variant: 'destructive',
            });
        },
    });

    const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return Promise.reject(new Error('No 2d context'));
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current) {
            toast({
                title: 'Error',
                description: 'Please select an area to crop',
                variant: 'destructive',
            });
            return;
        }

        try {
            const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
            const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
            setImageFile(croppedFile);

            // Create preview
            const previewUrl = URL.createObjectURL(croppedBlob);
            setImagePreview(previewUrl);
            setShowCropModal(false);
        } catch (error) {
            console.error('Error cropping image:', error);
            toast({
                title: 'Error',
                description: 'Failed to crop image',
                variant: 'destructive',
            });
        }
    };

    const handleSaveProfile = () => {
        if (!name.trim()) {
            toast({
                title: 'Validation error',
                description: 'Name is required',
                variant: 'destructive',
            });
            return;
        }
        updateProfileMutation.mutate({ name });
    };

    const handleUploadImage = () => {
        if (imageFile) {
            uploadImageMutation.mutate(imageFile);
        }
    };

    const handleRemoveImage = () => {
        deleteImageMutation.mutate();
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

                {/* Profile Image Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Profile Image</CardTitle>
                        <CardDescription>Update your profile picture</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage
                                src={imagePreview || profileImageUrl || undefined}
                                alt={user?.name || 'User'}
                            />
                            <AvatarFallback className="text-4xl">
                                {user?.name ? getInitials(user.name) : <User className="h-16 w-16" />}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col items-center gap-3 w-full">
                            <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <Label htmlFor="image-upload" className="w-full max-w-xs">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <span className="cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose Image
                                    </span>
                                </Button>
                            </Label>

                            {imageFile && (
                                <Button
                                    onClick={handleUploadImage}
                                    disabled={uploadImageMutation.isPending}
                                    className="w-full max-w-xs"
                                >
                                    {uploadImageMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload Image'
                                    )}
                                </Button>
                            )}

                            {profileData?.hasProfileImage && !imageFile && (
                                <Button
                                    onClick={handleRemoveImage}
                                    disabled={deleteImageMutation.isPending}
                                    variant="destructive"
                                    className="w-full max-w-xs"
                                >
                                    {deleteImageMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Removing...
                                        </>
                                    ) : (
                                        'Remove Image'
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Information Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>

                        <Button
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                            className="w-full"
                        >
                            {updateProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Image Crop Modal */}
            <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Crop Your Profile Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center p-4">
                        {imageSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Crop preview"
                                    style={{ maxHeight: '500px', maxWidth: '100%' }}
                                />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCropModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCropComplete}>
                            Crop & Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;
