
import React from "react";
import { Users, Target, Award, Globe } from "lucide-react";

const About = () => {
  const stats = [
    { icon: Users, number: "5+", label: "Happy Clients" },
    { icon: Target, number: "10+", label: "Projects Completed" },
    { icon: Award, number: "5+", label: "Years Experience" },
    { icon: Globe, number: "2+", label: "Countries Served" },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-purple-600">Nesisoft</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We are committed to transforming innovative ideas into practical, impactful digital solutions tailored to meet the evolving needs of businesses across Africa and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our services empower clients to innovate, grow, and thrive in the digital economy. We don't just provide solutions; we create jobs, increase digital inclusion, and build long-term economic value on the continent.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Through our ventures like Agoo, Sua, Adesuapa, and Jua, we actively develop scalable digital platforms that solve local and regional problems while supporting our client-based development work.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-purple-600 rounded-full w-2 h-2 mt-2 mr-4 flex-shrink-0"></div>
                <span className="text-gray-700">Full-cycle development from concept to deployment</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-600 rounded-full w-2 h-2 mt-2 mr-4 flex-shrink-0"></div>
                <span className="text-gray-700">Expert team with proven track record</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-600 rounded-full w-2 h-2 mt-2 mr-4 flex-shrink-0"></div>
                <span className="text-gray-700">Focus on African market understanding</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-600 rounded-full w-2 h-2 mt-2 mr-4 flex-shrink-0"></div>
                <span className="text-gray-700">Innovative solutions for real-world problems</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <stat.icon className="text-purple-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
