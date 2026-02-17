"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  
   const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/";
      } else {
        setUser(data.user);
        fetchBookmarks(data.user.id);
      }
    };
    getUser();
  }, []);

 

  const addBookmark = async () => {
    if (!title || !url) return;

    const { error } = await supabase.from("bookmarks" ).insert({
      title,
      url,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      return;
    }

    // No optimistic update — realtime handles BOTH tabs
    setTitle("");
    setUrl("");
  };

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error(error);
    }

 
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      //  Same channel name across tabs = they share the same subscription
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          //  Both tabs receive this and update their own state
          setBookmarks((prev) => {
            const exists = prev.some((item) => item.id === payload.new.id);
            if (exists) return prev;
            return [payload.new as any, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          //  Both tabs receive this and remove the item
          if (payload.old?.id) {
            setBookmarks((prev) =>
              prev.filter((item) => item.id !== payload.old.id),
            );
          }
        },
      )
      // .subscribe((status) => {
      //   console.log("Realtime status:", status);
      // });
      .subscribe((status, err) => {
        console.log("Realtime status:", status);
        if (err) console.error("Realtime error:", err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Bookmarks</h1>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 flex-1"
        />
        <button onClick={addBookmark} className="bg-blue-500 text-white px-4">
          Add
        </button>
      </div>

      <ul>
        {bookmarks.map((b) => (
          <li key={b.id} className="flex justify-between mb-2">
            <a href={b.url} target="_blank" className="text-blue-600">
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
