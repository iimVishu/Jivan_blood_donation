import { Users, Heart, Globe, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24">
      {/* Hero Section */}
      <section className="py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-gray-900">ABOUT<br/>US.</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl font-light leading-relaxed">
            Bridging the gap between donors and recipients. <br/>
            Creating a world where no life is lost due to shortage.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <div className="space-y-16">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 text-red-600">Our Mission</h2>
                <p className="text-3xl font-light leading-tight text-gray-800">
                  To provide a reliable, safe, and efficient platform for blood donation. Connecting voluntary donors with those in need.
                </p>
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 text-red-600">Our Vision</h2>
                <p className="text-3xl font-light leading-tight text-gray-800">
                  A world where every patient has access to safe blood when they need it, regardless of location or status.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200">
              <div className="bg-white p-10 flex flex-col items-center justify-center aspect-square hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-red-600 mb-6" />
                <h3 className="font-medium tracking-tight text-gray-900">Community</h3>
              </div>
              <div className="bg-white p-10 flex flex-col items-center justify-center aspect-square hover:bg-gray-50 transition-colors">
                <Heart className="h-8 w-8 text-red-600 mb-6" />
                <h3 className="font-medium tracking-tight text-gray-900">Compassion</h3>
              </div>
              <div className="bg-white p-10 flex flex-col items-center justify-center aspect-square hover:bg-gray-50 transition-colors">
                <Globe className="h-8 w-8 text-red-600 mb-6" />
                <h3 className="font-medium tracking-tight text-gray-900">Access</h3>
              </div>
              <div className="bg-white p-10 flex flex-col items-center justify-center aspect-square hover:bg-gray-50 transition-colors">
                <Award className="h-8 w-8 text-red-600 mb-6" />
                <h3 className="font-medium tracking-tight text-gray-900">Excellence</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
