
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MediaUploader } from './media-uploader';
import { Trash2, GripVertical, Link as LinkIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  singleImage?: boolean;
}

export function ImageManager({ images, onImagesChange, singleImage = false }: ImageManagerProps) {
  const [addMethod, setAddMethod] = useState<'upload' | 'link'>('upload');
  const [newImageUrl, setNewImageUrl] = useState('');
  const { toast } = useToast();
  
  // Drag and drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleAddFromUploader = (urls: string[]) => {
    if (singleImage) {
      onImagesChange(urls);
    } else {
      onImagesChange([...images, ...urls]);
    }
  }

  const handleAddFromLink = () => {
    if (!newImageUrl || !newImageUrl.startsWith('http')) {
        toast({ title: "Invalid URL", description: "Please enter a valid image URL.", variant: "destructive" });
        return;
    }
    if (singleImage) {
      onImagesChange([newImageUrl]);
    } else {
      onImagesChange([...images, newImageUrl]);
    }
    setNewImageUrl('');
  };

  const handleDelete = (urlToDelete: string) => {
    onImagesChange(images.filter((url) => url !== urlToDelete));
  };
  
  const handleDragSort = () => {
    if (singleImage || dragItem.current === null || dragOverItem.current === null) return;
    const newImages = [...images];
    const draggedItemContent = newImages.splice(dragItem.current, 1)[0];
    newImages.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Current Images</Label>
        {!singleImage && (
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop the images to change their order. The first image is the main one.
          </p>
        )}
        {images.length > 0 ? (
          <div className="space-y-2">
            {images.map((url, index) => (
              <div
                key={url + index}
                className="flex items-center gap-2 p-2 border rounded-lg bg-background"
                draggable={!singleImage}
                onDragStart={() => dragItem.current = index}
                onDragEnter={() => dragOverItem.current = index}
                onDragEnd={handleDragSort}
                onDragOver={(e) => e.preventDefault()}
              >
                {!singleImage && <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />}
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  width={64}
                  height={64}
                  className="rounded-md object-cover w-16 h-16"
                />
                <p className="flex-grow text-xs text-muted-foreground truncate">{url}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(url)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-4 border-dashed border-2 rounded-lg">
            No images yet.
          </div>
        )}
      </div>

      <div className="p-4 border rounded-lg space-y-4">
        <h4 className="font-medium">Add New Image</h4>
        <p className="text-sm text-muted-foreground">
            Recommended aspect ratio for product cards is square (1:1).
        </p>
        <RadioGroup value={addMethod} onValueChange={(value) => setAddMethod(value as 'upload' | 'link')} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload" className="flex items-center gap-2"><Upload className="h-4 w-4"/>Upload File</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="link" id="link" />
            <Label htmlFor="link" className="flex items-center gap-2"><LinkIcon className="h-4 w-4" />Image URL</Label>
          </div>
        </RadioGroup>

        {addMethod === 'upload' ? (
          <MediaUploader
            value={[]}
            onChange={handleAddFromUploader}
            fileTypes={['image']}
            maxFiles={singleImage ? 1 : 0}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button type="button" onClick={handleAddFromLink}>Add Image</Button>
          </div>
        )}
      </div>
    </div>
  );
}
