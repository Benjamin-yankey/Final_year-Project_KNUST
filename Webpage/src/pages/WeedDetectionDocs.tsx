import React, { useState, useEffect } from 'react';
import { Search, Book, ExternalLink, Code, Camera, Cpu, Database, Settings, ChevronDown, ChevronRight, FileText, Globe, Github } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  subsections?: DocSection[];
}

interface ExternalResource {
  title: string;
  url: string;
  description: string;
  type: 'api' | 'dataset' | 'paper' | 'tool' | 'library';
}

const WeedDetectionDocs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [filteredSections, setFilteredSections] = useState<DocSection[]>([]);

  const docSections: DocSection[] = [
    {
      id: 'introduction',
      title: 'Introduction to Weed Detection',
      category: 'overview',
      keywords: ['introduction', 'overview', 'basics', 'agriculture', 'computer vision'],
      content: `Weed detection is a critical application of computer vision in precision agriculture. This technology enables automated identification and classification of weeds in crop fields, helping farmers make informed decisions about herbicide application, mechanical weeding, and crop management.

Key benefits include:
- Reduced herbicide usage through targeted application
- Improved crop yield by minimizing weed competition
- Cost reduction in labor and chemical inputs
- Environmental protection through precision spraying
- Real-time field monitoring capabilities`,
      subsections: [
        {
          id: 'challenges',
          title: 'Common Challenges',
          category: 'overview',
          keywords: ['challenges', 'problems', 'difficulties'],
          content: `- Variability in weed species and growth stages
- Environmental conditions (lighting, weather)
- Crop-weed similarity in early growth stages
- Real-time processing requirements
- Dataset quality and annotation accuracy`
        }
      ]
    },
    {
      id: 'technical-approach',
      title: 'Technical Approaches',
      category: 'technical',
      keywords: ['machine learning', 'deep learning', 'cnn', 'yolo', 'segmentation'],
      content: `Modern weed detection systems employ various machine learning and computer vision techniques:

**Deep Learning Models:**
- Convolutional Neural Networks (CNNs) for image classification
- YOLO (You Only Look Once) for real-time object detection
- U-Net and Mask R-CNN for semantic segmentation
- Vision Transformers (ViTs) for improved accuracy

**Traditional Computer Vision:**
- Color-based segmentation using HSV color spaces
- Texture analysis with GLCM features
- Shape analysis using morphological operations
- Edge detection and contour analysis`,
      subsections: [
        {
          id: 'preprocessing',
          title: 'Image Preprocessing',
          category: 'technical',
          keywords: ['preprocessing', 'augmentation', 'normalization'],
          content: `Essential preprocessing steps:
- Image resizing and normalization
- Color space conversion (RGB to HSV/LAB)
- Noise reduction and filtering
- Data augmentation techniques
- Illumination correction`
        }
      ]
    },
    {
      id: 'datasets',
      title: 'Datasets and Training Data',
      category: 'data',
      keywords: ['datasets', 'training', 'annotation', 'labeling'],
      content: `Quality datasets are crucial for training effective weed detection models:

**Popular Public Datasets:**
- DeepWeeds: 17,509 images across 9 weed species
- PlantVillage: Comprehensive plant disease and weed dataset
- Crop/Weed Field Image Dataset (CWFID)
- WeedNet: Large-scale weed identification dataset
- Agricultural Weed Dataset (AWD)

**Data Collection Best Practices:**
- Capture images at different growth stages
- Include various lighting conditions
- Represent different soil types and backgrounds
- Maintain consistent camera angles and distances
- Ensure proper class balance`,
      subsections: [
        {
          id: 'annotation',
          title: 'Data Annotation',
          category: 'data',
          keywords: ['annotation', 'labeling', 'ground truth'],
          content: `Annotation strategies:
- Bounding box annotation for detection tasks
- Pixel-wise segmentation for precise localization
- Multi-class labeling for species identification
- Quality control and validation processes`
        }
      ]
    },
    {
      id: 'implementation',
      title: 'Implementation Guide',
      category: 'implementation',
      keywords: ['code', 'python', 'tensorflow', 'pytorch', 'opencv'],
      content: `**Framework Selection:**
- TensorFlow/Keras for beginners
- PyTorch for research and flexibility
- OpenCV for traditional computer vision
- ONNX for model deployment across platforms

**Basic Implementation Structure:**
\`\`\`python
import cv2
import numpy as np
from tensorflow import keras

class WeedDetector:
    def __init__(self, model_path):
        self.model = keras.models.load_model(model_path)
        
    def preprocess_image(self, image):
        # Resize and normalize
        resized = cv2.resize(image, (224, 224))
        normalized = resized / 255.0
        return np.expand_dims(normalized, axis=0)
        
    def detect_weeds(self, image):
        processed = self.preprocess_image(image)
        predictions = self.model.predict(processed)
        return predictions
\`\`\``,
      subsections: [
        {
          id: 'deployment',
          title: 'Model Deployment',
          category: 'implementation',
          keywords: ['deployment', 'edge', 'mobile', 'raspberry pi'],
          content: `Deployment options:
- Edge devices (Raspberry Pi, NVIDIA Jetson)
- Mobile applications with TensorFlow Lite
- Cloud-based API services
- Embedded systems for agricultural machinery`
        }
      ]
    },
    {
      id: 'evaluation',
      title: 'Model Evaluation and Metrics',
      category: 'evaluation',
      keywords: ['metrics', 'accuracy', 'precision', 'recall', 'iou'],
      content: `**Key Performance Metrics:**
- Accuracy: Overall correctness of predictions
- Precision: True positives / (True positives + False positives)
- Recall: True positives / (True positives + False negatives)
- F1-Score: Harmonic mean of precision and recall
- IoU (Intersection over Union): For segmentation tasks
- mAP (mean Average Precision): For detection tasks

**Evaluation Considerations:**
- Cross-validation for robust assessment
- Test on diverse environmental conditions
- Consider computational efficiency metrics
- Real-world field testing validation`,
      subsections: [
        {
          id: 'benchmarking',
          title: 'Benchmarking Standards',
          category: 'evaluation',
          keywords: ['benchmark', 'standards', 'comparison'],
          content: `Standard evaluation protocols:
- Use of standardized test datasets
- Consistent evaluation metrics
- Statistical significance testing
- Comparison with state-of-the-art methods`
        }
      ]
    }
  ];

  const externalResources: ExternalResource[] = [
    {
      title: 'PlantNet API',
      url: 'https://my.plantnet.org/api',
      description: 'Plant identification API with extensive database',
      type: 'api'
    },
    {
      title: 'DeepWeeds Dataset',
      url: 'https://github.com/AlexOlsen/DeepWeeds',
      description: 'Comprehensive weed species dataset with 17,509 images',
      type: 'dataset'
    },
    {
      title: 'YOLOv5 for Agriculture',
      url: 'https://github.com/ultralytics/yolov5',
      description: 'Real-time object detection optimized for agricultural applications',
      type: 'tool'
    },
    {
      title: 'OpenCV Computer Vision Library',
      url: 'https://opencv.org/',
      description: 'Essential computer vision library for image processing',
      type: 'library'
    },
    {
      title: 'Agricultural Computer Vision Papers',
      url: 'https://paperswithcode.com/task/weed-detection',
      description: 'Latest research papers on weed detection with code',
      type: 'paper'
    },
    {
      title: 'TensorFlow Lite for Mobile',
      url: 'https://www.tensorflow.org/lite',
      description: 'Deploy ML models on mobile and edge devices',
      type: 'tool'
    }
  ];

  const categories = ['all', 'overview', 'technical', 'data', 'implementation', 'evaluation'];

  useEffect(() => {
    const filtered = docSections.filter(section => {
      const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
    setFilteredSections(filtered);
  }, [searchQuery, selectedCategory]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'overview': return <Book className="w-4 h-4" />;
      case 'technical': return <Cpu className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'implementation': return <Code className="w-4 h-4" />;
      case 'evaluation': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'api': return <Globe className="w-4 h-4" />;
      case 'dataset': return <Database className="w-4 h-4" />;
      case 'paper': return <FileText className="w-4 h-4" />;
      case 'tool': return <Settings className="w-4 h-4" />;
      case 'library': return <Github className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Camera className="w-10 h-10 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Weed Detection Documentation</h1>
              <p className="text-gray-600 mt-2">Comprehensive guide to computer vision-based weed detection systems</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Documentation */}
          <div className="lg:col-span-2 space-y-6">
            {filteredSections.map((section) => (
              <div key={section.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(section.category)}
                      <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                    </div>
                    {expandedSections.has(section.id) ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {section.keywords.slice(0, 3).map(keyword => (
                      <span key={keyword} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                {expandedSections.has(section.id) && (
                  <div className="px-6 pb-6">
                    <div className="prose max-w-none">
                      {section.content.split('\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('```')) {
                          return null; // Handle code blocks separately if needed
                        }
                        if (paragraph.startsWith('**') && paragraph.endsWith(':**')) {
                          return <h4 key={idx} className="font-semibold text-gray-800 mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</h4>;
                        }
                        if (paragraph.startsWith('- ')) {
                          return <li key={idx} className="ml-4 text-gray-700">{paragraph.substring(2)}</li>;
                        }
                        if (paragraph.includes('```python')) {
                          const codeMatch = section.content.match(/```python\n([\s\S]*?)\n```/);
                          if (codeMatch) {
                            return (
                              <pre key={idx} className="bg-gray-100 p-4 rounded-lg mt-4 overflow-x-auto">
                                <code className="text-sm">{codeMatch[1]}</code>
                              </pre>
                            );
                          }
                        }
                        return paragraph.trim() ? <p key={idx} className="text-gray-700 mb-3">{paragraph}</p> : null;
                      })}
                    </div>
                    
                    {section.subsections && section.subsections.map(subsection => (
                      <div key={subsection.id} className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">{subsection.title}</h4>
                        <div className="prose max-w-none text-sm text-gray-600">
                          {subsection.content.split('\n').map((paragraph, idx) => 
                            paragraph.trim() ? <p key={idx} className="mb-2">{paragraph}</p> : null
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* External Resources Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                External Resources
              </h3>
              <div className="space-y-4">
                {externalResources.map((resource, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {getResourceIcon(resource.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{resource.title}</h4>
                        <p className="text-gray-600 text-xs mt-1">{resource.description}</p>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs mt-2"
                        >
                          Visit Resource
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {docSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {getIcon(section.category)}
                    <span className="text-sm text-gray-700">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeedDetectionDocs;