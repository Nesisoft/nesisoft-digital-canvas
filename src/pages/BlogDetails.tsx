
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Send, MessageSquare } from "lucide-react";
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
    comment: ""
  });
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      comment: "Great article! This really helped me understand the mobile development landscape in Africa.",
      date: "2024-01-16"
    },
    {
      id: 2,
      name: "Michael Osei",
      comment: "Very insightful. Looking forward to more content like this.",
      date: "2024-01-17"
    }
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
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    category: "Mobile Development",
    author: "John Doe",
    date: "2024-01-15",
    readTime: "5 min read"
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentData.fullName && commentData.comment) {
      const newComment = {
        id: comments.length + 1,
        name: commentData.fullName,
        comment: commentData.comment,
        date: new Date().toISOString().split('T')[0]
      };
      setComments([...comments, newComment]);
      setCommentData({ fullName: "", comment: "" });
      setShowCommentForm(false);
    }
  };

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-purple-600 hover:text-purple-700">
            Return to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Back to Blog
          </Link>
          
          <div className="mb-6">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {blogPost.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {blogPost.title}
          </h1>
          
          <div className="flex items-center text-gray-600 mb-8">
            <User size={20} className="mr-2" />
            <span className="mr-6">{blogPost.author}</span>
            <Calendar size={20} className="mr-2" />
            <span className="mr-6">{new Date(blogPost.date).toLocaleDateString()}</span>
            <span>{blogPost.readTime}</span>
          </div>
          
          <img 
            src={blogPost.image} 
            alt={blogPost.title}
            className="w-full h-80 object-cover rounded-3xl shadow-2xl mb-8"
          />
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="mr-3" size={28} />
              Comments ({comments.length})
            </h3>
            <Button 
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            >
              Add Comment
            </Button>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <Card className="mb-8 rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Leave a Comment</h4>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <Input
                      name="fullName"
                      value={commentData.fullName}
                      onChange={handleCommentChange}
                      className="rounded-xl border-gray-300"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Comment
                    </label>
                    <Textarea
                      name="comment"
                      value={commentData.comment}
                      onChange={handleCommentChange}
                      className="rounded-xl border-gray-300 min-h-[100px]"
                      placeholder="Share your thoughts..."
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                      Post Comment
                      <Send className="ml-2" size={16} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCommentForm(false)}
                      className="rounded-xl border-gray-300"
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
              <Card key={comment.id} className="rounded-3xl border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold mr-4">
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{comment.name}</h5>
                      <p className="text-gray-500 text-sm">{new Date(comment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogDetails;
