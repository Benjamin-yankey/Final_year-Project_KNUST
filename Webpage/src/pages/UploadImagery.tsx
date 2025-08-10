import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Camera, MapPin, X, CheckCircle, AlertCircle } from "lucide-react";
import { saveScan } from "@/lib/scanStorage";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  file: File;
  preview: string;
  location?: string;
  processed?: boolean;
  weedCount?: number;
  accuracy?: string;
}

const UploadImagery = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFiles = (files: FileList) => {
    const newImages: UploadedImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          processed: false
        });
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Update image location
  const updateLocation = (index: number, location: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, location } : img
    ));
  };

  // Simulate image processing
  const processImages = async () => {
    if (images.length === 0) {
      toast({
        title: "No images to process",
        description: "Please upload some images first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock results
      const weedCount = Math.floor(Math.random() * 100) + 1;
      const accuracy = `${Math.floor(Math.random() * 10) + 90}%`;
      
      // Update image with results
      setImages(prev => prev.map((img, idx) => 
        idx === i ? { ...img, processed: true, weedCount, accuracy } : img
      ));

      // Save to local storage
      const now = new Date();
      saveScan({
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].slice(0, 5),
        location: image.location || "Unknown Location",
        imageUrl: image.preview,
        weedCount,
        status: "Completed",
        accuracy
      });

      // Update progress
      setProcessingProgress(((i + 1) / images.length) * 100);
    }

    setIsProcessing(false);
    toast({
      title: "Processing completed!",
      description: `Successfully processed ${images.length} image(s).`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Upload Imagery</h1>
          <nav className="flex space-x-6">
            <a href="/" className="hover:text-green-200 transition-colors">Home</a>
            <a href="/RecentScans" className="hover:text-green-200 transition-colors">Recent Scans</a>
            <a href="#" className="hover:text-green-200 transition-colors">Map</a>
            <a href="#" className="hover:text-green-200 transition-colors">Metrics</a>
            <a href="#" className="hover:text-green-200 transition-colors">Gallery</a>
            <a href="#" className="hover:text-green-200 transition-colors">Settings</a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Upload Field Images</h2>
          <p className="text-muted-foreground">
            Upload images from your field to detect and count weeds automatically.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Image Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-green-500 bg-green-50" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">
                Drag and drop images here, or click to select
              </h3>
              <p className="text-muted-foreground mb-4">
                Supports JPG, PNG, and other image formats
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Processing Progress */}
        {isProcessing && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium mb-2">Processing images...</p>
                  <Progress value={processingProgress} className="w-full" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(processingProgress)}%
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Uploaded Images */}
        {images.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Uploaded Images ({images.length})</CardTitle>
                <Button 
                  onClick={processImages}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? "Processing..." : "Process All Images"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="relative mb-4">
                      <img 
                        src={image.preview} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {image.processed && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`location-${index}`}>Location</Label>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <Input
                            id={`location-${index}`}
                            placeholder="e.g., Field A-North"
                            value={image.location || ""}
                            onChange={(e) => updateLocation(index, e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {image.processed && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Results:</strong> {image.weedCount} weeds detected
                            <br />
                            <strong>Accuracy:</strong> {image.accuracy}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        File: {image.file.name}
                        <br />
                        Size: {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default UploadImagery;