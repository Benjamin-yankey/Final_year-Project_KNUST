import { useState, useRef } from "react";
import PageLayout from "@/components/PageLayout";
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
    <PageLayout>
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
      {/* Professional Footer Component */}
<footer className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
  <div className="max-w-7xl mx-auto">
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
      
      {/* Company Info */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          <span className="text-xl font-bold text-white">WeedWise</span>
        </div>
        <p className="text-sm leading-relaxed">
          Advanced weed detection and agricultural analytics platform helping farmers optimize crop yields through AI-powered solutions.
        </p>
        <div className="flex space-x-4 pt-2">
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
          </a>
          <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h3>
        <ul className="space-y-2">
          <li><a href="/features" className="hover:text-green-400 transition-colors">Features</a></li>
          <li><a href="/pricing" className="hover:text-green-400 transition-colors">Pricing</a></li>
          <li><a href="/case-studies" className="hover:text-green-400 transition-colors">Case Studies</a></li>
          <li><a href="/blog" className="hover:text-green-400 transition-colors">Blog</a></li>
          <li><a href="/contact" className="hover:text-green-400 transition-colors">Contact Us</a></li>
        </ul>
      </div>

      {/* Resources */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h3>
        <ul className="space-y-2">
          <li><a href="/documentation" className="hover:text-green-400 transition-colors">Documentation</a></li>
          <li><a href="/api" className="hover:text-green-400 transition-colors">API Reference</a></li>
          <li><a href="/help-center" className="hover:text-green-400 transition-colors">Help Center</a></li>
          <li><a href="/webinars" className="hover:text-green-400 transition-colors">Webinars</a></li>
          <li><a href="/community" className="hover:text-green-400 transition-colors">Community Forum</a></li>
        </ul>
      </div>

      {/* Newsletter */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Stay Updated</h3>
        <p className="text-sm">Subscribe to our newsletter for the latest updates and insights.</p>
        <form className="flex flex-col space-y-3">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>

    {/* Footer Bottom */}
    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
      <div className="text-sm text-gray-400">
        © {new Date().getFullYear()} WeedWise Analytics. All rights reserved.
      </div>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <a href="/privacy" className="text-sm hover:text-green-400 transition-colors">Privacy Policy</a>
        <a href="/terms" className="text-sm hover:text-green-400 transition-colors">Terms of Service</a>
        <a href="/cookies" className="text-sm hover:text-green-400 transition-colors">Cookie Policy</a>
      </div>
    </div>
  </div>
</footer>
    </PageLayout>
  );
};

export default UploadImagery;