"use client";

import { useEffect, useState } from "react";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const TYPING_INTERVAL_SECONDS = 6;
const PROGRESS_UPDATE_INTERVAL_MS = 50;

export default function DynamicPage({ params }: Props) {
  const [path, setPath] = useState<string>("");
  const [content, setContent] = useState("");
  const [lastModified, setLastModified] = useState<string>("");	
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [typingProgress, setTypingProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  async function saveContent(path: string, content: string) {
    setSaving(true);
    try {
      if((content && content.length > 5) || content === "") {

        const response = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            path: path.replace(/\//g, "-"),
            content 
          }),
        });
      
        if (!response.ok) {
          throw new Error("Failed to save content");
        }

        const data = await response.json();
        setLastModified(data?.lastModified || new Date().toISOString());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (typingTimeout) {
      return () => clearTimeout(typingTimeout);
    }
  }, [typingTimeout]);

  useEffect(() => {
    async function defineParamsAndLoadData() {
      setLoading(true);

      const { slug } = await params;
      const loadedPath = slug ? slug.join("/") : "notFound";

      setPath(loadedPath);

      try {
        const response = await fetch(`/api/load?path=${encodeURIComponent(loadedPath.replace(/\//g, "-"))}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setContent(data?.content || "");
          setLastModified(data?.lastModified || new Date().toISOString());
        } else {
          console.error("Failed to load content");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    defineParamsAndLoadData()
  }, [params]);


  const [fontColor, setFontColor] = useState<string>('text-white');
  const [fontSize, setFontSize] = useState<string>((): string => {
    if (typeof window !== 'undefined'){
      const from_localStorage = window.localStorage.getItem('user_selected_font_size')
      if (from_localStorage === null || from_localStorage === undefined){
        return 'text-xs'
      }

      return `${from_localStorage}` ? from_localStorage : 'text-xs'
    }
    return 'text-xs'
  });


  useEffect(() => {
    setIsClient(true); // Marca como cliente

    const loadLocalFontItem = (key: string, defaultValue: string): string => {
      if (typeof window === 'undefined') return defaultValue; // Garante que está no cliente
      const fromLocalStorage = window.localStorage.getItem(key) || null;
      return fromLocalStorage ? fromLocalStorage : defaultValue;
    };
  
    setFontColor(loadLocalFontItem('user_selected_font_color', 'text-white'));
    setFontSize(loadLocalFontItem('user_selected_font_size', 'text-xs'));
  }, []);

  const handleFontColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedColor = e.target.value;
    setFontColor(selectedColor);
    if (typeof window !== 'undefined'){
      window.localStorage.setItem('user_selected_font_color', selectedColor)
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSize = e.target.value;
    setFontSize(selectedSize);
    if (typeof window !== 'undefined'){
      window.localStorage.setItem('user_selected_font_size', selectedSize)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setTypingProgress(0);

    // Clear existing timeouts/intervals
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Calculate interval steps to reach 100% just before save occurs
    const progressStep = 100 / ((TYPING_INTERVAL_SECONDS * 1000) / PROGRESS_UPDATE_INTERVAL_MS); // Update every 50ms

    // Set up progress bar update
    const interval = setInterval(() => {
      setTypingProgress(prev => {
        const newProgress = prev + progressStep;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, PROGRESS_UPDATE_INTERVAL_MS);
    setProgressInterval(interval);

    const timeout = setTimeout(() => {
      saveContent(path, e.target.value);
      clearInterval(interval); // Clear the progress interval when saving starts
      setTypingProgress(100); // Ensure progress is at 100% when saving
    }, TYPING_INTERVAL_SECONDS * 1000);
    
    setTypingTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [progressInterval, typingTimeout]);

  if (!isClient) {
    // Renderiza um fallback para evitar inconsistências entre SSR e CSR
    return null;
  }

  return (
    <>
      <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-center gap-16">
          <p className="text-sm font-mono text-green-400 truncate">
            Editing: {path || "/"} - Last Modified: {new Date(lastModified).toLocaleString()}
          </p>

          <div className="flex items-center font-mono text-gray-300">
            <label htmlFor="fontColor" className="mr-2 text-sm">
              Font Color:
            </label>
            <select
              id="fontColor"
              className="bg-gray-700 rounded-md p-1"
              value={fontColor}
              onChange={handleFontColorChange}
            >
              <option value="text-white">White</option>
              <option value="text-green-400">Light Green</option>
              <option value="text-blue-400">Light Blue</option>
            </select>
          </div>
          <div className="flex items-center font-mono text-gray-300">
            <label htmlFor="fontSize" className="mr-2 text-sm">
              Font Size:
            </label>
            <select
              id="fontSize"
              className="bg-gray-700 rounded-md p-1"
              value={fontSize}
              onChange={handleFontSizeChange}
            >
              <option value="text-xs">Extra Small</option>
              <option value="text-sm">Small</option>
              <option value="text-base">Base</option>
              <option value="text-lg">Large</option>
              <option value="text-xl">Extra Large</option>
            </select>
          </div>

          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-100"
              style={{ width: `${typingProgress}%` }}
            />
          </div>
        </div>

        <textarea
          className={`flex w-full h-full bg-gray-900 p-4 outline-none resize-none ${fontColor} font-mono ${fontSize}`}
          placeholder="Start typing here..."
          spellCheck={false}
          value={content}
          onChange={handleContentChange}
          disabled={loading || saving}
        ></textarea>

        {saving && (
          <div className="absolute flex p-2 bg-green-600 items-center justify-center gap-2 top-4 right-4 flex-row border-4 border-gray-800 rounded-xl opacity-80">
            <div className="w-4 h-4 border-2 border-t-2 border-white rounded-full animate-spin"></div>
            <p className="text-white text-sm">Saving changes...</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="absolute flex p-5 bg-gray-900 items-center justify-center gap-2 self-center flex-row border-4 border-gray-500 rounded-xl">
          <div className="w-6 h-6 border-2 border-t-2 border-white rounded-full animate-spin"></div>
          <p className="text-white">Loading text data...</p>
        </div>
      )}

    </>
  );
}