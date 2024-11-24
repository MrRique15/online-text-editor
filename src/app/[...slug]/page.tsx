"use client";

import { useEffect, useState } from "react";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export default function DynamicPage({ params }: Props) {
  const [path, setPath] = useState<string>("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [fontColor, setFontColor] = useState<string>("text-white");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  async function saveContent(path: string, content: string) {
    setSaving(true);
    try {
      if(content && content.length > 5) {

        const response = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content }),
        });
      
        if (!response.ok) {
          throw new Error("Failed to save content");
        }
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
          setContent(data.content || "");
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


  const handleFontColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedColor = e.target.value;
    setFontColor(selectedColor);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        saveContent(path, e.target.value);
      }, 2000)
    );
  };

  return (
    <>
      <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-center gap-16">
          <p className="text-sm font-mono text-green-400 truncate">
            Editing: {path || "/"}
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
        </div>

        <textarea
          className={`flex w-full h-full bg-gray-900 p-4 outline-none resize-none ${fontColor} font-mono`}
          placeholder="Start typing here..."
          spellCheck={false}
          value={content}
          onChange={handleContentChange}
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