import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Tag, ArrowRight, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LabeledDivider } from "@/components/ui/labeled-divider";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);
  const categories = [
    "All",
    "Technology",
    "Mobile Development",
    "Web Development",
    "AI & Machine Learning",
    "Industry Insights",
  ];

  const blogPosts = [
    {
      id: "1",
      title: "The Future of Mobile App Development in Africa",
      excerpt:
        "Exploring the trends and opportunities shaping mobile development across the African continent.",
      content: "Mobile technology is revolutionizing Africa...",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=300&fit=crop",
      category: "Mobile Development",
      author: "John Doe",
      date: "2024-01-15",
      readTime: "5 min read",
    },
    {
      id: "2",
      title: "Building Scalable Web Applications with Modern Technologies",
      excerpt:
        "A comprehensive guide to creating web applications that can grow with your business.",
      content: "Scalability is crucial for modern web applications...",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop",
      category: "Web Development",
      author: "Jane Smith",
      date: "2024-01-10",
      readTime: "7 min read",
    },
    {
      id: "3",
      title: "AI Integration in African Business Solutions",
      excerpt:
        "How artificial intelligence is transforming business operations across Africa.",
      content: "Artificial Intelligence is becoming increasingly important...",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
      category: "AI & Machine Learning",
      author: "Michael Johnson",
      date: "2024-01-05",
      readTime: "6 min read",
    },
    {
      id: "4",
      title: "The Rise of E-commerce in Africa: Opportunities and Challenges",
      excerpt:
        "Understanding the e-commerce landscape and its potential for growth in African markets.",
      content: "E-commerce is experiencing unprecedented growth...",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop",
      category: "Industry Insights",
      author: "Sarah Wilson",
      date: "2024-01-01",
      readTime: "8 min read",
    },
    {
      id: "5",
      title: "React Native vs Native Development: Making the Right Choice",
      excerpt:
        "Comparing cross-platform and native development approaches for mobile applications.",
      content: "Choosing the right development approach is crucial...",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=300&fit=crop",
      category: "Technology",
      author: "David Brown",
      date: "2023-12-28",
      readTime: "4 min read",
    },
    {
      id: "6",
      title: "Building Progressive Web Apps for African Markets",
      excerpt:
        "Creating web applications that work offline and provide native-like experiences.",
      content: "Progressive Web Apps offer unique advantages...",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop",
      category: "Web Development",
      author: "Lisa Anderson",
      date: "2023-12-25",
      readTime: "6 min read",
    },
  ];

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

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

        {/* Hero Section */}
        <section className="relative pt-24 pb-12 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-purple-500/20">
              Insights & Updates
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
                Blog
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay updated with the latest insights, trends, and innovations in
              software development and technology.
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="relative py-8 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 backdrop-blur-sm border ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white border-purple-500/50 shadow-lg shadow-purple-500/20"
                      : "bg-white/10 text-gray-300 border-white/10 hover:bg-white/15 hover:border-purple-500/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="relative py-20 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:bg-white/15 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-gray-400 mb-3 flex-wrap gap-3">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-purple-400" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-purple-400" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2 text-purple-400" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <Link to={`/blog/${post.id}`}>
                      <Button
                        variant="ghost"
                        className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 p-0 group/btn"
                      >
                        Read More{" "}
                        <ArrowRight
                          size={16}
                          className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                        />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No posts found
                </h3>
                <p className="text-gray-400">
                  Try selecting a different category
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="relative py-20 z-10">
          <div className="mb-12">
            <LabeledDivider label="Newsletter" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                Subscribe to our newsletter to receive the latest tech insights
                and updates directly in your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full px-8 py-3">
                  Subscribe
                </Button>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Blog;
