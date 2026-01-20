import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Send,
  MessageSquare,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogDetails = () => {
  const { postId } = useParams();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentData, setCommentData] = useState({
    fullName: "",
    comment: "",
  });
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      comment:
        "Great article! This really helped me understand the mobile development landscape in Africa.",
      date: "2024-01-16",
    },
    {
      id: 2,
      name: "Michael Osei",
      comment: "Very insightful. Looking forward to more content like this.",
      date: "2024-01-17",
    },
  ]);

  const blogPost = {
    id: postId,
    title: "The Future of Mobile App Development in Africa",
    content: `
      <p>Mobile technology is revolutionizing Africa in unprecedented ways. From mobile banking solutions that serve the unbanked population to agricultural apps that help farmers optimize their yields, mobile applications are at the forefront of Africa's digital transformation.</p>
      
      <h2>The Current Landscape</h2>
      <p>Africa's mobile-first approach to technology adoption has created unique opportunities for developers and businesses. With over 747 million mobile subscribers across the continent, the potential for mobile applications is enormous.</p>
      
      <h2>Key Trends Shaping the Future</h2>
      <p>Several trends are emerging that will define the future of mobile development in Africa:</p>
      <ul>
        <li><strong>Progressive Web Apps (PWAs):</strong> Offering app-like experiences without requiring app store downloads</li>
        <li><strong>5G Connectivity:</strong> Enabling more sophisticated applications with real-time capabilities</li>
        <li><strong>AI Integration:</strong> Making apps smarter and more personalized</li>
        <li><strong>Blockchain Technology:</strong> Enhancing security and enabling new business models</li>
      </ul>
      
      <h2>Challenges and Opportunities</h2>
      <p>While there are challenges such as varying internet speeds and device capabilities, these constraints often drive innovation. Developers are creating lightweight, efficient applications that work well even in low-connectivity environments.</p>
      
      <h2>The Road Ahead</h2>
      <p>The future of mobile development in Africa is bright. As infrastructure continues to improve and more people gain access to smartphones, the opportunities for creating impactful mobile solutions will only grow.</p>
    `,
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    category: "Mobile Development",
    author: "John Doe",
    date: "2024-01-15",
    readTime: "5 min read",
  };

  const handleCommentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCommentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentData.fullName && commentData.comment) {
      const newComment = {
        id: comments.length + 1,
        name: commentData.fullName,
        comment: commentData.comment,
        date: new Date().toISOString().split("T")[0],
      };
      setComments([...comments, newComment]);
      setCommentData({ fullName: "", comment: "" });
      setShowCommentForm(false);
    }
  };

  if (!blogPost) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-violet-950" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Navbar />
        <div className="relative pt-24 pb-20 text-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Post Not Found
            </h1>
            <Link to="/blog" className="text-purple-300 hover:text-purple-200">
              Return to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-violet-950" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <Navbar />

        {/* Header */}
        <section className="relative pt-24 pb-12 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/blog"
              className="inline-flex items-center text-purple-300 hover:text-purple-200 mb-8 group"
            >
              <ArrowLeft
                size={20}
                className="mr-2 group-hover:-translate-x-1 transition-transform"
              />
              Back to Blog
            </Link>

            <div className="mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border border-purple-500/50">
                {blogPost.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {blogPost.title}
            </h1>

            <div className="flex items-center text-gray-300 mb-8 flex-wrap gap-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <User size={20} className="mr-3 text-purple-400" />
                <span>{blogPost.author}</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar size={20} className="mr-3 text-purple-400" />
                <span>{new Date(blogPost.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock size={20} className="mr-3 text-purple-400" />
                <span>{blogPost.readTime}</span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-500"></div>
              <img
                src={blogPost.image}
                alt={blogPost.title}
                className="relative w-full h-80 object-cover rounded-3xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="relative pb-20 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="prose prose-lg max-w-none leading-relaxed text-gray-300"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
              style={{
                "--tw-prose-body": "#d1d5db",
                "--tw-prose-headings": "#ffffff",
                "--tw-prose-links": "#a78bfa",
                "--tw-prose-bold": "#ffffff",
                "--tw-prose-bullets": "#a78bfa",
              }}
            />
          </div>
        </section>

        {/* Comments Section */}
        <section className="relative py-20 bg-white/5 backdrop-blur-sm z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <MessageSquare className="mr-3 text-purple-400" size={28} />
                Comments ({comments.length})
              </h3>
              <Button
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-full px-6 py-3"
              >
                Add Comment
              </Button>
            </div>

            {/* Comment Form */}
            {showCommentForm && (
              <Card className="mb-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mr-4 border border-purple-500/30">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">
                      Leave a Comment
                    </h4>
                  </div>
                  <form onSubmit={handleCommentSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <Input
                        name="fullName"
                        value={commentData.fullName}
                        onChange={handleCommentChange}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Comment
                      </label>
                      <Textarea
                        name="comment"
                        value={commentData.comment}
                        onChange={handleCommentChange}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl min-h-[120px] focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Share your thoughts..."
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl"
                      >
                        Post Comment
                        <Send className="ml-2" size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCommentForm(false)}
                        className="border-white/20 text-gray-300 hover:bg-white/10 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <Card
                  key={comment.id}
                  className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold mr-4 flex-shrink-0">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-white">
                            {comment.name}
                          </h5>
                          <p className="text-gray-400 text-sm">
                            {new Date(comment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Empty comments state */}
              {comments.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    No comments yet
                  </h4>
                  <p className="text-gray-400">
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Share Section */}
        <section className="relative py-12 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/10">
              <h4 className="text-xl font-semibold text-white mb-4">
                Share this article
              </h4>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10 rounded-full"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10 rounded-full"
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10 rounded-full"
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10 rounded-full"
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default BlogDetails;
