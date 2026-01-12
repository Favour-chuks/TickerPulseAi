
import React, { useState } from 'react';
import { Palette, Download, Share2, RefreshCw, Wand2, Loader2 } from 'lucide-react';
import { generateCreativeImage } from '../services/geminiService';

const StudioView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const imgUrl = await generateCreativeImage(prompt);
      setImage(imgUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Control Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Creative Director</h3>
          </div>
          <p className="text-slate-500 text-sm mb-6">Describe the visual mood or concept you're thinking of, and Aura will visualize it in 4K.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic workspace on Mars at sunset, synthwave aesthetic..."
                className="w-full h-32 bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Masterpiece...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Generate Visualization
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
          <h4 className="font-bold text-indigo-900 mb-2">AI Pro Tip</h4>
          <p className="text-indigo-700 text-sm leading-relaxed">Try specifying lighting conditions like "cinematic lighting" or "golden hour" for more dramatic results.</p>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm h-full min-h-[500px] flex flex-col">
          <div className="flex-1 rounded-2xl overflow-hidden bg-slate-50 relative group">
            {image ? (
              <img src={image} alt="Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Palette className="w-16 h-16 mb-4 opacity-20" />
                <p>Your creation will appear here</p>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-medium text-indigo-600">Dreaming in pixels...</p>
                </div>
              </div>
            )}
          </div>

          {image && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Download">
                  <Download className="w-5 h-5 text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Share">
                  <Share2 className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">Aura Render Engine v2.5</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioView;
