import { useState, useRef } from 'react';
import { Upload, Trash2, X, ChevronLeft, ChevronRight, Download, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  description: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface GalleryProps {
  isAdmin: boolean;
}

const INITIAL_IMAGES: GalleryImage[] = [
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop',
      title: 'Class Field Trip',
      description: 'Amazing day at the science museum with the whole class!',
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Ms. Johnson'
    },
    {
      id: '2',
      src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=400&fit=crop',
      title: 'Sports Day 2026',
      description: 'Celebrating our athletic achievements at the annual sports day.',
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Coach Wilson'
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=400&fit=crop',
      title: 'Science Project Showcase',
      description: 'Students presenting their innovative science projects.',
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Dr. Brown'
    },
    {
      id: '4',
      src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400&fit=crop',
      title: 'Annual Concert',
      description: 'Our talented musicians performing at the annual school concert.',
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Ms. Miller'
    },
    {
      id: '5',
      src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop',
      title: 'Debate Competition',
      description: 'Our debate team competing in the regional championship.',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Mr. Davis'
    },
    {
      id: '6',
      src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&h=400&fit=crop',
      title: 'Class Celebration',
      description: 'End of semester celebration with the whole class.',
      uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      uploadedBy: 'Mr. Smith'
    }
];

export default function Gallery({ isAdmin }: GalleryProps) {
  const [images, setImages] = useLocalStorageState<GalleryImage[]>(
    'classhub_gallery',
    INITIAL_IMAGES,
    list => list.map(img => ({ ...img, uploadedAt: new Date(img.uploadedAt) })),
  );

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setShowLightbox(true);
  };

  const handlePreviousImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const previousIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setSelectedImage(images[previousIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUploadImage = () => {
    if (!uploadTitle.trim() || !uploadedFile) {
      toast.error('Please fill in title and select an image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: GalleryImage = {
        id: Date.now().toString(),
        src: e.target?.result as string,
        title: uploadTitle,
        description: uploadDescription,
        uploadedAt: new Date(),
        uploadedBy: 'You'
      };

      setImages([newImage, ...images]);
      setUploadTitle('');
      setUploadDescription('');
      setUploadedFile(null);
      setShowUploadDialog(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Image uploaded successfully!');
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleDeleteImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    if (selectedImage?.id === id) {
      setShowLightbox(false);
      setSelectedImage(null);
    }
    toast.success('Image deleted');
  };

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setUploadTitle(image.title);
    setUploadDescription(image.description);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingImage || !uploadTitle.trim()) {
      toast.error('Please fill in the title');
      return;
    }

    setImages(images.map(img =>
      img.id === editingImage.id
        ? { ...img, title: uploadTitle, description: uploadDescription }
        : img
    ));

    if (selectedImage?.id === editingImage.id) {
      setSelectedImage({ ...selectedImage, title: uploadTitle, description: uploadDescription });
    }

    setShowEditDialog(false);
    setEditingImage(null);
    setUploadTitle('');
    setUploadDescription('');
    toast.success('Image updated successfully!');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Class Gallery</h2>
        {isAdmin && (
          <Button
            onClick={() => {
              setUploadTitle('');
              setUploadDescription('');
              setUploadedFile(null);
              setShowUploadDialog(true);
            }}
            className="neon-button gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-lg" style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}>
            <p className="text-muted-foreground">No photos yet. {isAdmin && 'Upload your first photo!'}</p>
          </div>
        ) : (
          images.map(image => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300"
              style={{
                background: 'rgba(24, 28, 50, 0.4)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(37, 80, 140, 0.4)',
                border: '1px solid'
              }}
              onClick={() => handleImageClick(image)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(37, 80, 140, 0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Image */}
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-48 object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                <p className="text-xs text-gray-300 mb-2 line-clamp-2">{image.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(image.uploadedAt)}</span>
                  <span>{image.uploadedBy}</span>
                </div>
              </div>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-primary/20 hover:bg-primary/40 text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditImage(image);
                    }}
                    title="Edit photo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-destructive/20 hover:bg-destructive/40 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-4xl" style={{
          background: 'rgba(24, 28, 50, 0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          border: '1px solid'
        }}>
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-primary">{selectedImage?.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLightbox(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>

          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full max-h-96 overflow-hidden rounded-lg">
              {selectedImage && (
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-auto object-contain"
                />
              )}
            </div>

            {/* Image Info */}
            {selectedImage && (
              <div className="space-y-2">
                <p className="text-foreground">{selectedImage.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Uploaded by {selectedImage.uploadedBy} on {formatDate(selectedImage.uploadedAt)}</span>
                  <span>{images.findIndex(img => img.id === selectedImage.id) + 1} of {images.length}</span>
                </div>
              </div>
            )}

            {/* Navigation and Controls */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousImage}
                className="text-primary hover:bg-primary/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex gap-2">
                {isAdmin && selectedImage && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditImage(selectedImage)}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDeleteImage(selectedImage.id);
                        setShowLightbox(false);
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedImage) {
                      const link = document.createElement('a');
                      link.href = selectedImage.src;
                      link.download = selectedImage.title;
                      link.click();
                    }
                  }}
                  className="text-primary hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextImage}
                className="text-primary hover:bg-primary/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      {isAdmin && (
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent style={{
            background: 'rgba(24, 28, 50, 0.9)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}>
            <DialogHeader>
              <DialogTitle className="text-primary">Upload Photo</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* File Input */}
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300"
                style={{
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  background: 'rgba(0, 212, 255, 0.05)'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.8)';
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    handleFileSelect({ target: { files } } as any);
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-foreground font-medium">
                  {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Photo Title
                </label>
                <Input
                  placeholder="e.g., Class Field Trip"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="text-foreground placeholder-muted-foreground"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Add a description for this photo..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded text-foreground placeholder-muted-foreground min-h-20"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)',
                    border: '1px solid'
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadImage}
                  className="neon-button flex-1"
                >
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isAdmin && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent style={{
            background: 'rgba(24, 28, 50, 0.9)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}>
            <DialogHeader>
              <DialogTitle className="text-primary">Edit Photo</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Preview */}
              {editingImage && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={editingImage.src}
                    alt={editingImage.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Photo Title
                </label>
                <Input
                  placeholder="e.g., Class Field Trip"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="text-foreground placeholder-muted-foreground"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Add a description for this photo..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded text-foreground placeholder-muted-foreground min-h-20"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)',
                    border: '1px solid'
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="neon-button flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
