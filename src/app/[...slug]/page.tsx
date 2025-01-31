"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

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
  const [typingProgress, setTypingProgress] = useState<number>(100);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

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
        <Header
          path={path}
          lastModified={lastModified}
          typingProgress={typingProgress}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          fontColor={fontColor}
          fontSize={fontSize}
          handleFontColorChange={handleFontColorChange}
          handleFontSizeChange={handleFontSizeChange}
        />

        {isEditing ? (
          <textarea
            className={`flex w-full h-full bg-gray-900 p-4 outline-none resize-none ${fontColor} font-mono ${fontSize}`}
            placeholder="Start typing here... (Markdown supported)"
            spellCheck={false}
            value={content}
            onChange={handleContentChange}
            disabled={loading || saving}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const target = e.target as HTMLTextAreaElement;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                
                // Single line - just add spaces at cursor
                const newContent = content.substring(0, start) + '  ' + content.substring(end);
                handleContentChange({ target: { value: newContent } } as React.ChangeEvent<HTMLTextAreaElement>);
                
                // Set cursor position after state update
                setTimeout(() => {
                  target.focus();
                  target.setSelectionRange(start + 2, start + 2);
                }, 0);
              }
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gray-900 p-4 overflow-auto ${fontColor} ${fontSize} font-mono`}>
            <ReactMarkdown
              components={{
                // Style markdown elements
                h1: ({...props}) => <h1 className={`${fontSize === 'text-xs' ? 'text-lg' : fontSize === 'text-sm' ? 'text-xl' : fontSize === 'text-base' ? 'text-2xl' : fontSize === 'text-lg' ? 'text-3xl' : 'text-4xl'} font-bold my-4`} {...props} />,
                h2: ({...props}) => <h2 className={`${fontSize === 'text-xs' ? 'text-base' : fontSize === 'text-sm' ? 'text-lg' : fontSize === 'text-base' ? 'text-xl' : fontSize === 'text-lg' ? 'text-2xl' : 'text-3xl'} font-bold my-3`} {...props} />,
                h3: ({...props}) => <h3 className={`${fontSize === 'text-xs' ? 'text-sm' : fontSize === 'text-sm' ? 'text-base' : fontSize === 'text-base' ? 'text-lg' : fontSize === 'text-lg' ? 'text-xl' : 'text-2xl'} font-bold my-2`} {...props} />,
                p: ({...props}) => <p className="my-2" {...props} />,
                ul: ({...props}) => <ul className="list-disc ml-4 my-1 space-y-0.5" {...props} />,
                ol: ({...props}) => <ol className="list-decimal ml-4 my-1 space-y-0.5" {...props} />,
                a: ({...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                code: ({...props}) => <code className="bg-gray-800 px-1 rounded" {...props} />,
                pre: ({...props}) => <pre className="bg-gray-800 p-2 rounded my-2 overflow-x-auto" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

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