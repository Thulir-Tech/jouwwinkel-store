
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UploadCloud, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/firestore.admin';

interface ImageUploaderProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const file = acceptedFiles[0];
    
    try {
      const downloadURL = await uploadFile(
        `products/${Date.now()}-${file.name}`,
        file,
        (p) => setProgress(p)
      );
      onChange([...value, downloadURL]);
      toast({ title: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleDelete = (url: string) => {
    onChange(value.filter((imageUrl) => imageUrl !== url));
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          {isDragActive ? 'Drop the files here...' : 'Drag & drop an image here, or click to select'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Recommended 1:1 ratio, max 5MB</p>
      </div>
      
      {uploading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center mt-2">{Math.round(progress)}%</p>
        </div>
      )}

      {value && value.length > 0 && (
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(url)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
