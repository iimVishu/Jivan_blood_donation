import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "The Importance of Blood Donation",
    excerpt: "Every drop counts. Learn why donating blood is crucial for saving lives and how it benefits the donor as well.",
    date: "October 15, 2023",
    author: "Dr. Sarah Smith",
    category: "Education"
  },
  {
    id: 2,
    title: "Preparing for Your First Donation",
    excerpt: "Nervous about your first time? Here are some tips to help you prepare physically and mentally for a smooth experience.",
    date: "October 20, 2023",
    author: "John Doe",
    category: "Tips"
  },
  {
    id: 3,
    title: "Blood Types Explained",
    excerpt: "Understanding blood types is essential for safe transfusions. Discover the science behind A, B, AB, and O blood groups.",
    date: "October 25, 2023",
    author: "Medical Team",
    category: "Science"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Our Blog</h1>
          <p className="mt-4 text-gray-600">Latest news, updates, and educational content about blood donation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300">
              <div className="h-48 bg-red-100 w-full flex items-center justify-center text-red-300">
                {/* Placeholder for Blog Image */}
                <span className="text-4xl font-bold">IMAGE</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                <Link href={`/blog/${post.id}`} className="text-red-600 font-medium hover:text-red-700 text-sm">
                  Read More &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
