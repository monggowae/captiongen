import React, { useState } from 'react';
import { Send, Copy, CheckCheck } from 'lucide-react';

interface CaptionResponse {
  text?: string;
}

function App() {
  const [keyword, setKeyword] = useState('');
  const [count, setCount] = useState(1);
  const [wordCount, setWordCount] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setCaptions([]);
    setCopiedIndex(null);

    try {
      const response = await fetch('https://hook.us1.make.com/1hbai9stv94mi2aha9majaxmv8ri067n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          count,
          wordCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate caption');
      }

      const contentType = response.headers.get('content-type');
      let captionTexts: string[] = [];

      if (contentType && contentType.includes('application/json')) {
        const data: CaptionResponse = await response.json();
        if (data.text) {
          // Split by double newlines to separate multiple captions
          captionTexts = data.text.split(/\n\n+/).filter(text => text.trim());
        }
      } else {
        const text = await response.text();
        // Split by double newlines to separate multiple captions
        captionTexts = text.split(/\n\n+/).filter(text => text.trim());
      }

      if (captionTexts.length === 0) {
        throw new Error('No captions generated');
      }

      setCaptions(captionTexts);
    } catch (err) {
      setError('Failed to generate caption. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Caption Generator</h1>
          <p className="text-gray-600 mb-6">Generate engaging captions for your content</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter your keyword"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Captions
                </label>
                <input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Words per Caption
                </label>
                <input
                  id="wordCount"
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  min="0"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send size={20} />
                  <span>Generate Caption{count > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {captions.length > 0 && (
            <div className="mt-8 space-y-4">
              {captions.map((caption, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-purple-600 flex items-center gap-2">
                        ✨ Caption {captions.length > 1 ? `#${index + 1}` : ''}
                      </h3>
                      <button
                        onClick={() => handleCopy(caption, index)}
                        className="text-gray-500 hover:text-purple-600 transition p-1 rounded-full hover:bg-gray-100"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? (
                          <CheckCheck size={18} />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;