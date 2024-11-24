"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const [path, setPath] = useState<string>("");
    const router = useRouter();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (path.trim()) {
            router.push(`/${path.trim()}`);
        }
    };

    return (
        <div className="text-center flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-6">
                Favaro&apos;s Online NotePad
            </h1>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center"
            >
                <input
                    type="text"
                    placeholder="Enter path like 'foo/bar/...'"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="p-3 rounded-lg border border-gray-700 bg-gray-800 text-white w-80 mb-4"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
                >
                    Go
                </button>
            </form>
        </div>
    );
}
