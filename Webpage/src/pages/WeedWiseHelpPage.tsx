import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Home, BarChart3, Camera, Upload, HelpCircle, Star, Send, X, Moon, Sun } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const WeedWiseHelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const faqs: FAQ[] = [
    {
      id: 1,
      question: "How do I use the weed detection camera?",
      answer: "Simply point your device camera at the crop area and tap the 'Scan' button. Our AI will automatically identify weeds and highlight them in real-time. Make sure you have good lighting and hold the camera steady for best results.",
      category: "Detection"
    },
    {
      id: 2,
      question: "What should I do if the model misclassifies a plant?",
      answer: "You can report misclassifications by tapping the 'Report Issue' button after a scan. This helps improve our AI accuracy. You can also manually correct the classification and our system will learn from your feedback.",
      category: "Accuracy"
    },
    {
      id: 3,
      question: "Can I upload a custom dataset?",
      answer: "Yes! Premium users can upload custom plant datasets through the 'Data Management' section in your dashboard. Supported formats include JPEG, PNG, and CSV annotation files. Maximum file size is 50MB per upload.",
      category: "Data"
    },
    {
      id: 4,
      question: "How accurate is the weed detection system?",
      answer: "Our AI model achieves 94% accuracy on common weeds and crops. Accuracy may vary based on lighting conditions, plant growth stage, and image quality. We continuously update our models with new data.",
      category: "Accuracy"
    },
    {
      id: 5,
      question: "What crops are currently supported?",
      answer: "WeedWise currently supports corn, wheat, soybeans, cotton, tomatoes, and lettuce. We're constantly adding new crop types based on user requests. Contact us if you need support for a specific crop.",
      category: "Crops"
    },
    {
      id: 6,
      question: "How do I export detection reports?",
      answer: "Go to your dashboard, select 'Reports' from the menu, choose your date range, and click 'Export'. Reports can be downloaded as PDF or Excel files containing detection statistics and recommendations.",
      category: "Reports"
    },
    {
      id: 7,
      question: "Is my farm data secure?",
      answer: "Absolutely. All data is encrypted end-to-end and stored on secure servers. We comply with agricultural data privacy standards and never share your farm information with third parties without your explicit consent.",
      category: "Security"
    },
    {
      id: 8,
      question: "How do I calibrate the system for my specific farm?",
      answer: "Use the 'Farm Setup' wizard in your dashboard. Input your crop types, planting patterns, and take 10-15 sample photos of your field. Our system will automatically calibrate for optimal detection in your specific environment.",
      category: "Setup"
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFAQToggle = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-green-50'}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              
              <span className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-green-100 text-green-700'}`}>Help Center</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <a href="/" className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-green-100'}`}>
                <Home className="w-4 h-4" />
                <span className="hidden sm:block">Home</span>
              </a>
              <a href="#" className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-green-100'}`}>
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            How can we help you today?
          </h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Get answers to common questions about WeedWise and learn how to maximize your crop protection
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search for help articles, features, or troubleshooting..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <HelpCircle className="w-6 h-6 mr-2 text-green-500" />
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className={`border rounded-lg transition-all duration-200 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button
                      onClick={() => handleFAQToggle(faq.id)}
                      className={`w-full px-6 py-4 text-left flex justify-between items-center hover:bg-opacity-50 transition-colors ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-green-50'
                      }`}
                    >
                      <div className="flex-1">
                        <span className={`text-sm px-2 py-1 rounded-full mr-3 ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-green-100 text-green-700'
                        }`}>
                          {faq.category}
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faq.question}</span>
                      </div>
                      {expandedFAQ === faq.id ? 
                        <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} /> : 
                        <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      }
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className={`px-6 pb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} animate-in slide-in-from-top-2 duration-200`}>
                        <p className="leading-relaxed">{faq.answer}</p>
                        <div className="flex items-center mt-4 space-x-4">
                          <span className="text-sm">Was this helpful?</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} className="text-gray-300 hover:text-yellow-400 transition-colors">
                                <Star className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <Search className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No results found for "{searchTerm}"</p>
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Try different keywords or browse all FAQs</p>
                </div>
              )}
            </section>

            {/* Video Tutorial Section */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Video Tutorials</h2>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="WeedWise Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Getting Started with WeedWise</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Learn the basics of setting up your farm profile and running your first weed detection scan.</p>
              </div>
            </section>

            {/* Contact Form */}
            <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Mail className="w-6 h-6 mr-2 text-green-500" />
                Contact Support
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500 focus:ring-green-500/20' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:ring-green-500/20'
                      }`}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500 focus:ring-green-500/20' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:ring-green-500/20'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500 focus:ring-green-500/20' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                    placeholder="Describe your issue or question in detail..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={submitStatus === 'loading'}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitStatus === 'loading' ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
                
                {submitStatus === 'success' && (
                  <div className="text-green-600 text-center py-2 animate-in fade-in duration-200">
                    ✅ Message sent successfully! We'll get back to you within 24 hours.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="text-red-600 text-center py-2 animate-in fade-in duration-200">
                    Failed to send message. Please try again or contact us directly.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
              <div className="space-y-3">
                <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}>
                  <Camera className="w-5 h-5" />
                  <span>Start Detection</span>
                </button>
                <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                  <Upload className="w-5 h-5" />
                  <span>Upload Dataset</span>
                </button>
                <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                  <BarChart3 className="w-5 h-5" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Need More Help?</h3>
              <div className="space-y-4">
                <div className={`flex items-center space-x-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Phone className="w-5 h-5 text-green-500" />
                  <span>+233 (240) 061-132</span>
                </div>
                <div className={`flex items-center space-x-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Mail className="w-5 h-5 text-green-500" />
                  <span>support@weedwise.com</span>
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Support Hours:</p>
                  <p>Mon-Fri: 8AM-6PM GMT</p>
                  <p>Sat-Sun: 9AM-3PM GMT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Live Chat Widget */}
      {showChat ? (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 flex flex-col z-50">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Live Support</h4>
                <p className="text-xs opacity-90">Usually responds in minutes</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Chat widget coming soon! For now, please use the contact form above.
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      <footer className="bg-green-600 text-white py-8 px-6 mt-16">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} Weed Detection Dashboard. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="/docs" className="hover:underline hover:text-green-200 transition-colors">📄 Documentation</a>
            <a href="/support" className="hover:underline hover:text-green-200 transition-colors">🛠 Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeedWiseHelpPage;