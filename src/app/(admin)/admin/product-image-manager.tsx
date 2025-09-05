
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

interface ProductImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function ProductImageManager({ images, onImagesChange }: ProductImageManagerProps) {
  const [addMethod, setAddMethod] = useState<'upload' | 'link'>('upload');
  const [newImageUrl, setNewImageUrl] = useState('');
  const { toast } = useToast();
  
  // Drag and drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleAddFromUploader = (urls: string[]) => {
    onImagesChange([...images, ...urls]);
  }

  const handleAddFromLink = () => {
    if (!newImageUrl || !newImageUrl.startsWith('http')) {
        toast({ title: "Invalid URL", description: "Please enter a valid image URL.", variant: "destructive" });
        return;
    }
    onImagesChange([...images, newImageUrl]);
    setNewImageUrl('');
  };

  const handleDelete = (urlToDelete: string) => {
    onImagesChange(images.filter((url) => url !== urlToDelete));
  };
  
  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
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
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop the images to change their order on the product page. The first image is the main one.
        </p>
        {images.length > 0 ? (
          <div className="space-y-2">
            {images.map((url, index) => (
              <div
                key={url + index}
                className="flex items-center gap-2 p-2 border rounded-lg bg-background"
                draggable
                onDragStart={() => dragItem.current = index}
                onDragEnter={() => dragOverItem.current = index}
                onDragEnd={handleDragSort}
                onDragOver={(e) => e.preventDefault()}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  width={64}
                  height={64}
                  className="rounded-md object-cover w-16 h-16"
                  data-ai-hint="product image"
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
