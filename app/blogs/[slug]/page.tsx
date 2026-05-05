"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

type Blog = {
  title: string;
  content: string;
  author: string;
  image: string;
  category: string;
  createdAt: string;
};

export default function BlogDetail() {
  const params = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!params?.slug) return;
      try {
        const res = await fetch(`/api/blogs?slug=${params.slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setBlog(data);
      } catch (err: unknown) {
        console.error("Blog detail fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-32 flex justify-center">
        <Spinner className="w-10 h-10 text-[#F97316]" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-32 flex flex-col items-center">
        <p className="text-[#64748B] text-xl font-playfair mb-6">Article not found.</p>
        <Link href="/blogs" className="text-[#F97316] font-bold hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-[#0F172A] py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Link href="/blogs" className="inline-flex items-center text-white/60 hover:text-white text-sm font-bold mb-8 transition-colors uppercase tracking-wider">
            &larr; Back to all articles
          </Link>
          <div className="mb-6 flex justify-center gap-3">
            <span className="bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {blog.category || "Astrology"}
            </span>
          </div>
          <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/70 text-sm font-medium">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              By {blog.author}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
            <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E2E8F0]">
          {/* Featured Image */}
          {blog.image && (
            <div className="w-full h-64 md:h-96 relative">
              <img 
                src={blog.image || "https://picsum.photos/seed/default/600/400"} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            <div 
              className="max-w-none text-[#334155] text-base md:text-lg leading-relaxed [&_h1]:font-playfair [&_h1]:text-[#0F172A] [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:font-playfair [&_h2]:text-[#0F172A] [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:font-playfair [&_h3]:text-[#0F172A] [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-[#F97316] [&_a:hover]:text-[#EA6C0A] [&_a]:underline [&_strong]:text-[#0F172A] [&_strong]:font-bold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-[#F97316] [&_blockquote]:bg-[#FFF7ED] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:my-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_hr]:border-[#E2E8F0] [&_hr]:my-8 [&_code]:bg-[#F1F5F9] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-[#1E293B] [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>

        {/* Share / Footer */}
        <div className="mt-12 text-center">
          <p className="font-playfair text-xl font-bold text-[#0F172A] mb-4">Share this article</p>
          <div className="flex justify-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#64748B] hover:text-[#0077b5] hover:border-[#0077b5] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#64748B] hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#64748B] hover:text-[#1877F2] hover:border-[#1877F2] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
