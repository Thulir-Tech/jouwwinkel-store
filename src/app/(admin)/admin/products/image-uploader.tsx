
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UploadCloud, Trash2, Video } from 'lucide-react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/firestore.admin';

interface MediaUploaderProps {
  value: string[];
  onChange: (value: string[]) => void;
  fileTypes?: ('image' | 'video')[];
  maxFiles?: number;
}

export function MediaUploader({ value, onChange, fileTypes = ['image'], maxFiles = 0 }: MediaUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
        toast({ title: "File type not accepted", description: `Please upload a valid ${fileTypes.join(' or ')} file.`, variant: 'destructive' });
        return;
    }
    
    if (acceptedFiles.length === 0) return;

    if (maxFiles > 0 && value.length + acceptedFiles.length > maxFiles) {
        toast({ title: 'Upload limit reached', description: `You can only upload a maximum of ${maxFiles} file(s).`, variant: 'destructive'});
        return;
    }

    setUploading(true);

    try {
      const uploadPromises = acceptedFiles.map(file => 
        uploadFile(
          `products/${Date.now()}-${file.name}`,
          file,
          (p) => setProgress(p) // Note: progress will only show for the last file if multiple
        )
      );

      const downloadURLs = await Promise.all(uploadPromises);
      const newValue = maxFiles === 1 ? downloadURLs : [...value, ...downloadURLs];
      onChange(newValue);

      toast({ title: 'Media uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const acceptMap = {
    'image': { 'image/*': [] },
    'video': { 'video/*': ['.mp4', '.mov', '.avi'] },
  };

  const accept = fileTypes.reduce((acc, type) => ({...acc, ...acceptMap[type]}), {});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: maxFiles !== 1,
  });

  const handleDelete = (url: string) => {
    onChange(value.filter((imageUrl) => imageUrl !== url));
  };

  const fileTypeLabel = fileTypes.join(' or ');

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
          {isDragActive ? 'Drop the files here...' : `Drag & drop ${fileTypeLabel}(s) here, or click to select`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
            {maxFiles === 1 ? 'One file maximum' : `Recommended 1:1 ratio for images, max 5MB`}
        </p>
      </div>
      
      {uploading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center mt-2">{Math.round(progress)}%</p>
        </div>
      )}

      {value && value.length > 0 && (
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {value.map((url, index) => {
            const isVideo = /\.(mp4|mov|avi|webm)/i.test(new URL(url).pathname);
            return (
                <div key={index} className="relative group aspect-square">
                {isVideo ? (
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                        <Video className="h-12 w-12 text-white" />
                    </div>
                ) : (
                    <Image
                        src={url}
                        alt={`Uploaded media ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                    />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(url)
                    }}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
