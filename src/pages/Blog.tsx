
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Tag, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Technology", "Mobile Development", "Web Development", "AI & Machine Learning", "Industry Insights"];

  const blogPosts = [
    {
      id: "1",
      title: "The Future of Mobile App Development in Africa",
      excerpt: "Exploring the trends and opportunities shaping mobile development across the African continent.",
      content: "Mobile technology is revolutionizing Africa...",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=300&fit=crop",
      category: "Mobile Development",
      author: "John Doe",
      date: "2024-01-15",
      readTime: "5 min read"
    },
    {
      id: "2",
      title: "Building Scalable Web Applications with Modern Technologies",
      excerpt: "A comprehensive guide to creating web applications that can grow with your business.",
      content: "Scalability is crucial for modern web applications...",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop",
      category: "Web Development",
      author: "Jane Smith",
      date: "2024-01-10",
      readTime: "7 min read"
    },
    {
      id: "3",
      title: "AI Integration in African Business Solutions",
      excerpt: "How artificial intelligence is transforming business operations across Africa.",
      content: "Artificial Intelligence is becoming increasingly important...",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
      category: "AI & Machine Learning",
      author: "Michael Johnson",
      date: "2024-01-05",
      readTime: "6 min read"
    },
    {
      id: "4",
      title: "The Rise of E-commerce in Africa: Opportunities and Challenges",
      excerpt: "Understanding the e-commerce landscape and its potential for growth in African markets.",
      content: "E-commerce is experiencing unprecedented growth...",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop",
      category: "Industry Insights",
      author: "Sarah Wilson",
      date: "2024-01-01",
      readTime: "8 min read"
    },
    {
      id: "5",
      title: "React Native vs Native Development: Making the Right Choice",
      excerpt: "Comparing cross-platform and native development approaches for mobile applications.",
      content: "Choosing the right development approach is crucial...",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=300&fit=crop",
      category: "Technology",
      author: "David Brown",
      date: "2023-12-28",
      readTime: "4 min read"
    },
    {
      id: "6",
      title: "Building Progressive Web Apps for African Markets",
      excerpt: "Creating web applications that work offline and provide native-like experiences.",
      content: "Progressive Web Apps offer unique advantages...",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop",
      category: "Web Development",
      author: "Lisa Anderson",
      date: "2023-12-25",
      readTime: "6 min read"
    }
  ];

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-purple-600">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights, trends, and innovations in software development and technology.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden border-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={16} className="mr-2" />
                    <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
                    <User size={16} className="mr-2" />
                    <span className="mr-4">{post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <Link to={`/blog/${post.id}`}>
                    <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0">
                      Read More <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
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

export default Blog;
