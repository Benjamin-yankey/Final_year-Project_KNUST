import React, { useState, useEffect } from "react";
import { 
  Search, Filter, Grid3x3, List, Upload, Download, 
  Camera, Eye, Trash2, Star, Share2, Calendar,
  MapPin, Tag, SortAsc, SortDesc, RefreshCw,
  ZoomIn, ZoomOut, RotateCw, Heart, BookmarkPlus,
  ExternalLink, Database, Globe, Settings,
  ChevronLeft, ChevronRight, X, Info, AlertTriangle,
  CheckCircle, Clock, Users, TrendingUp
} from "lucide-react";

export default function Gallery() {
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Mock data - in real app, this would come from API
  const [images, setImages] = useState([
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
      thumbnail: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200",
      title: "Wheat Field Analysis",
      description: "Detected 15 broadleaf weeds in wheat crop",
      date: "2024-08-08",
      time: "14:30",
      location: "Kumasi Farm, Ghana",
      tags: ["wheat", "broadleaf", "detection"],
      weedCount: 15,
      confidence: 0.92,
      status: "processed",
      detectionModel: "YOLOv5",
      resolution: "1920x1080",
      fileSize: "2.3MB",
      photographer: "Huey Yankey",
      weather: "Sunny, 28°C",
      soilType: "Clay Loam",
      cropStage: "Flowering",
      treatmentRecommended: true,
      externalId: "plantnet_12345"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
      thumbnail: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200",
      title: "Corn Field Survey",
      description: "Grass weed identification in maize plantation",
      date: "2024-08-07",
      time: "09:15",
      location: "Accra Agricultural Center",
      tags: ["corn", "maize", "grass-weeds"],
      weedCount: 8,
      confidence: 0.87,
      status: "processing",
      detectionModel: "YOLOv8",
      resolution: "1080x1920",
      fileSize: "1.8MB",
      photographer: "Sarah Mensah",
      weather: "Cloudy, 25°C",
      soilType: "Sandy Loam",
      cropStage: "Vegetative",
      treatmentRecommended: false,
      externalId: "plantnet_67890"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
      title: "Soybean Weed Detection",
      description: "Multiple weed species identified",
      date: "2024-08-06",
      time: "16:45",
      location: "Tamale Research Station",
      tags: ["soybean", "multiple-species", "research"],
      weedCount: 23,
      confidence: 0.94,
      status: "completed",
      detectionModel: "Mask R-CNN",
      resolution: "2048x1536",
      fileSize: "3.1MB",
      photographer: "Dr. Kwame Asante",
      weather: "Partly Cloudy, 30°C",
      soilType: "Loamy",
      cropStage: "Pod Formation",
      treatmentRecommended: true,
      externalId: "deepweeds_abc123"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1592394675300-1ba1dbd0e56c?w=400",
      thumbnail: "https://images.unsplash.com/photo-1592394675300-1ba1dbd0e56c?w=200",
      title: "Rice Field Monitoring",
      description: "Aquatic weed detection in paddy field",
      date: "2024-08-05",
      time: "11:20",
      location: "Volta Region Rice Farm",
      tags: ["rice", "aquatic-weeds", "paddy"],
      weedCount: 12,
      confidence: 0.89,
      status: "completed",
      detectionModel: "U-Net",
      resolution: "1600x1200",
      fileSize: "2.7MB",
      photographer: "Emmanuel Tetteh",
      weather: "Humid, 26°C",
      soilType: "Clay",
      cropStage: "Tillering",
      treatmentRecommended: true,
      externalId: "cwfid_456789"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
      thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200",
      title: "Tomato Greenhouse Scan",
      description: "Indoor weed detection analysis",
      date: "2024-08-04",
      time: "13:10",
      location: "Greenhouse Complex, Kumasi",
      tags: ["tomato", "greenhouse", "indoor"],
      weedCount: 5,
      confidence: 0.96,
      status: "completed",
      detectionModel: "YOLOv5",
      resolution: "1920x1080",
      fileSize: "1.9MB",
      photographer: "Grace Osei",
      weather: "Controlled Environment",
      soilType: "Soilless Medium",
      cropStage: "Fruiting",
      treatmentRecommended: false,
      externalId: "plantvillage_789123"
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400",
      thumbnail: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200",
      title: "Sugarcane Field Study",
      description: "Large scale weed mapping",
      date: "2024-08-03",
      time: "07:30",
      location: "Northern Region Plantation",
      tags: ["sugarcane", "large-scale", "mapping"],
      weedCount: 45,
      confidence: 0.91,
      status: "completed",
      detectionModel: "YOLOv8",
      resolution: "4096x3072",
      fileSize: "5.2MB",
      photographer: "Joseph Banda",
      weather: "Clear, 32°C",
      soilType: "Alluvial",
      cropStage: "Mature",
      treatmentRecommended: true,
      externalId: "awd_dataset_001"
    }
  ]);

  const filters = [
    { id: 'all', label: 'All Images', count: images.length },
    { id: 'completed', label: 'Completed', count: images.filter(img => img.status === 'completed').length },
    { id: 'processing', label: 'Processing', count: images.filter(img => img.status === 'processing').length },
    { id: 'high-confidence', label: 'High Confidence (>90%)', count: images.filter(img => img.confidence > 0.9).length },
    { id: 'treatment-needed', label: 'Treatment Needed', count: images.filter(img => img.treatmentRecommended).length },
    { id: 'favorites', label: 'Favorites', count: favorites.size }
  ];

  const sortOptions = [
    { id: 'date', label: 'Date' },
    { id: 'confidence', label: 'Confidence' },
    { id: 'weedCount', label: 'Weed Count' },
    { id: 'title', label: 'Title' }
  ];

  const externalDatabases = [
    {
      name: "PlantNet",
      url: "https://my.plantnet.org/",
      description: "Plant identification database",
      icon: Globe,
      connected: true
    },
    {
      name: "DeepWeeds Dataset",
      url: "https://github.com/AlexOlsen/DeepWeeds",
      description: "Comprehensive weed species dataset",
      icon: Database,
      connected: true
    },
    {
      name: "PlantVillage",
      url: "https://plantvillage.psu.edu/",
      description: "Plant disease and pest identification",
      icon: ExternalLink,
      connected: false
    }
  ];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const filteredAndSortedImages = images
    .filter(image => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'completed') return image.status === 'completed';
      if (selectedFilter === 'processing') return image.status === 'processing';
      if (selectedFilter === 'high-confidence') return image.confidence > 0.9;
      if (selectedFilter === 'treatment-needed') return image.treatmentRecommended;
      if (selectedFilter === 'favorites') return favorites.has(image.id);
      return true;
    })
    .filter(image => 
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(a.date + ' ' + (a.time || '00:00'));
        bValue = new Date(b.date + ' ' + (b.time || '00:00'));
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const toggleFavorite = (imageId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(imageId)) {
      newFavorites.delete(imageId);
    } else {
      newFavorites.add(imageId);
    }
    setFavorites(newFavorites);
  };

  const toggleImageSelection = (imageId) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'download':
        downloadMultiple(Array.from(selectedImages));
        break;
      case 'delete':
        if (confirm(`Delete ${selectedImages.size} selected images?`)) {
          setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
          setSelectedImages(new Set());
        }
        break;
      case 'export':
        alert(`Exporting ${selectedImages.size} images to external database...`);
        break;
      default:
        break;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setZoom(1);
    setRotation(0);
    // lock body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  // keyboard escape to close modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeImageModal();
      if (!selectedImage) return;
      if (e.key === 'ArrowLeft') showPrevInModal();
      if (e.key === 'ArrowRight') showNextInModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, filteredAndSortedImages]);

  const connectToDatabase = async (dbName) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Connected to ${dbName}!`);
      setIsLoading(false);
    }, 1000);
  };

  const refreshGallery = async () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const downloadImage = (image) => {
    // Simple client-side download by creating an anchor
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.title || 'image'}-${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadMultiple = (idsArray) => {
    // Basic behavior: download each image in sequence (browser will handle)
    const imgs = images.filter(img => idsArray.includes(img.id));
    imgs.forEach(img => downloadImage(img));
  };

  const shareImage = async (image) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: image.title, text: image.description, url: image.url });
      } catch (err) {
        // user cancelled or not supported
      }
    } else {
      // fallback: copy URL
      navigator.clipboard?.writeText(image.url);
      alert("Image URL copied to clipboard.");
    }
  };

  const deleteSingle = (imageId) => {
    if (!confirm("Delete this image?")) return;
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage?.id === imageId) closeImageModal();
  };

  const bookmarkImage = (imageId) => {
    // for demo, same as favorite toggle but could be different
    toggleFavorite(imageId);
  };

  const showPrevInModal = () => {
    if (!selectedImage) return;
    const currentIndex = filteredAndSortedImages.findIndex(i => i.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredAndSortedImages.length) % filteredAndSortedImages.length;
    const nextImage = filteredAndSortedImages[prevIndex];
    if (nextImage) openImageModal(nextImage);
  };

  const showNextInModal = () => {
    if (!selectedImage) return;
    const currentIndex = filteredAndSortedImages.findIndex(i => i.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredAndSortedImages.length;
    const nextImage = filteredAndSortedImages[nextIndex];
    if (nextImage) openImageModal(nextImage);
  };

  const rotateImage = (dir = 'cw') => {
    setRotation(prev => (dir === 'cw' ? prev + 90 : prev - 90));
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshGallery}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{images.length}</div>
              <div className="text-sm text-gray-500">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {images.filter(img => img.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {images.reduce((sum, img) => sum + img.weedCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Weeds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((images.reduce((sum, img) => sum + img.confidence, 0) / images.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Avg. Confidence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search images, tags, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>

              {/* Upload Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedImages.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {selectedImages.size} image{selectedImages.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('download')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    Download
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    Export
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedImages(new Set())}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Filter Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              <div className="space-y-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* External Databases */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                External Databases
              </h3>
              <div className="space-y-3">
                {externalDatabases.map((db, index) => {
                  const Icon = db.icon;
                  return (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium text-sm">{db.name}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${db.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{db.description}</p>
                      <div className="flex space-x-2">
                        <a
                          href={db.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Visit
                        </a>
                        {!db.connected && (
                          <button
                            onClick={() => connectToDatabase(db.name)}
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">This Week</span>
                  <span className="font-medium">+12 images</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">High Confidence</span>
                  <span className="font-medium text-green-600">
                    {images.filter(img => img.confidence > 0.9).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Need Treatment</span>
                  <span className="font-medium text-orange-600">
                    {images.filter(img => img.treatmentRecommended).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
                  <span className="font-medium">23.4 GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="lg:col-span-3">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedImages.map(image => (
                  <div
                    key={image.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
                  >
                    {/* Select checkbox */}
                    <label className="absolute left-3 top-3 z-20">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        className="form-checkbox h-5 w-5 text-green-600"
                      />
                    </label>

                    {/* Favorite */}
                    <button
                      onClick={() => toggleFavorite(image.id)}
                      className={`absolute right-3 top-3 z-20 p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-colors ${favorites.has(image.id) ? 'text-red-500' : 'text-gray-700'}`}
                      title={favorites.has(image.id) ? "Unfavorite" : "Favorite"}
                    >
                      <Heart className={favorites.has(image.id) ? 'w-5 h-5 fill-current' : 'w-5 h-5'} />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openImageModal(image)}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => downloadImage(image)}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => shareImage(image)}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => deleteSingle(image.id)}
                            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{image.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{image.location} • {image.date}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className={`text-sm font-medium ${getConfidenceColor(image.confidence)}`}>
                            {(image.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{image.weedCount} weeds</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(image.status === 'processed' ? 'completed' : image.status)}
                          <span className="text-xs text-gray-600 dark:text-gray-300">{image.detectionModel}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => bookmarkImage(image.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300"
                            title="Bookmark"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Open
                          </a>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {image.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-4">
                {filteredAndSortedImages.map(image => (
                  <div key={image.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 w-3/4">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        className="form-checkbox h-5 w-5 text-green-600"
                      />
                      <img src={image.thumbnail} alt={image.title} className="w-28 h-20 object-cover rounded" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{image.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{image.description}</p>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{image.location} • {image.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`text-sm font-medium ${getConfidenceColor(image.confidence)}`}>
                        {(image.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm">{image.weedCount} weeds</div>
                      <button onClick={() => openImageModal(image)} className="p-2 bg-white rounded hover:shadow">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => downloadImage(image)} className="p-2 bg-white rounded hover:shadow">
                        <Download className="w-5 h-5" />
                      </button>
                      <button onClick={() => toggleFavorite(image.id)} className={`p-2 rounded ${favorites.has(image.id) ? 'text-red-500' : ''}`}>
                        <Heart className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteSingle(image.id)} className="p-2 rounded text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={closeImageModal} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full overflow-hidden shadow-xl z-50">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button onClick={showPrevInModal} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedImage.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{selectedImage.location} • {selectedImage.date} • {selectedImage.time}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={() => downloadImage(selectedImage)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Download className="w-5 h-5" />
                </button>
                <button onClick={() => shareImage(selectedImage)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Share2 className="w-5 h-5" />
                </button>
                <button onClick={() => toggleFavorite(selectedImage.id)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Heart className={`w-5 h-5 ${favorites.has(selectedImage.id) ? 'fill-current text-red-500' : ''}`} />
                </button>
                <button onClick={() => deleteSingle(selectedImage.id)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={closeImageModal} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex items-center justify-center overflow-auto">
                  <div className="relative">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s',
                        maxHeight: '70vh',
                        maxWidth: '100%',
                      }}
                    />
                    {/* zoom & rotate controls */}
                    <div className="absolute right-2 bottom-2 flex space-x-2">
                      <button onClick={zoomIn} className="p-2 bg-white rounded shadow"> <ZoomIn className="w-4 h-4" /> </button>
                      <button onClick={zoomOut} className="p-2 bg-white rounded shadow"> <ZoomOut className="w-4 h-4" /> </button>
                      <button onClick={() => rotateImage('ccw')} className="p-2 bg-white rounded shadow"> <RotateCw className="w-4 h-4 transform rotate-180" /> </button>
                      <button onClick={() => rotateImage('cw')} className="p-2 bg-white rounded shadow"> <RotateCw className="w-4 h-4" /> </button>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-800 rounded p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{selectedImage.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{selectedImage.description}</p>

                  <div className="text-xs space-y-2">
                    <div><span className="font-medium">Location:</span> {selectedImage.location}</div>
                    <div><span className="font-medium">Captured:</span> {selectedImage.date} {selectedImage.time}</div>
                    <div><span className="font-medium">Photographer:</span> {selectedImage.photographer}</div>
                    <div><span className="font-medium">Model:</span> {selectedImage.detectionModel}</div>
                    <div><span className="font-medium">Resolution / Size:</span> {selectedImage.resolution} • {selectedImage.fileSize}</div>
                    <div><span className="font-medium">Weed Count:</span> {selectedImage.weedCount}</div>
                    <div><span className="font-medium">Confidence:</span> <span className={getConfidenceColor(selectedImage.confidence)}>{(selectedImage.confidence * 100).toFixed(0)}%</span></div>
                    <div><span className="font-medium">Soil Type:</span> {selectedImage.soilType}</div>
                    <div><span className="font-medium">Crop Stage:</span> {selectedImage.cropStage}</div>
                    <div><span className="font-medium">Treatment Recommended:</span> {selectedImage.treatmentRecommended ? 'Yes' : 'No'}</div>
                    <div className="mt-2">
                      <a href={selectedImage.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600">Open original</a>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button onClick={showPrevInModal} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">Prev</button>
                      <button onClick={showNextInModal} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">Next</button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { navigator.clipboard?.writeText(selectedImage.externalId); alert('External ID copied'); }} className="px-3 py-1 rounded bg-green-600 text-white">Copy ID</button>
                      <a href={selectedImage.externalId ? `https://example.org/lookup/${selectedImage.externalId}` : '#'} className="px-3 py-1 rounded bg-blue-600 text-white">Lookup</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
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
    </div>
  );
}
