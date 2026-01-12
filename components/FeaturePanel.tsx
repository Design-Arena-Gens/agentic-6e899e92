"use client";

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { features, featureCategories } from '@/lib/features';

interface FeaturePanelProps {
  onFeatureSelect: (feature: string) => void;
  currentFeature: string | null;
}

export function FeaturePanel({ onFeatureSelect, currentFeature }: FeaturePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Productivity']));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredFeatures = features.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorizedFeatures = featureCategories.reduce((acc, category) => {
    acc[category] = filteredFeatures.filter(f => f.category === category);
    return acc;
  }, {} as Record<string, typeof features>);

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <h3 className="text-xl font-bold text-white mb-2">Features ({features.length})</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="h-[600px] overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {featureCategories.map(category => {
          const categoryFeatures = categorizedFeatures[category];
          if (categoryFeatures.length === 0) return null;

          return (
            <div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 flex items-center justify-between transition"
              >
                <span className="text-white font-semibold">
                  {category} ({categoryFeatures.length})
                </span>
                {expandedCategories.has(category) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedCategories.has(category) && (
                <div className="p-2 space-y-1 bg-gray-800">
                  {categoryFeatures.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => onFeatureSelect(feature.name)}
                      className={`w-full p-3 rounded-lg text-left transition ${
                        currentFeature === feature.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <div className="font-medium text-sm">{feature.name}</div>
                      <div className="text-xs opacity-75 mt-1">{feature.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredFeatures.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No features found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
