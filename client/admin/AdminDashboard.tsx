import { useAdminData } from '../hooks/useApi';
import { BarChart3, FileText, Briefcase, MessageSquareQuote, HelpCircle, Image, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
  const { data, loading } = useAdminData<any>('dashboard', {});

  const stats = [
    { label: 'Services', value: data.servicesCount ?? 0, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { label: 'Programs', value: data.programsCount ?? 0, icon: FolderOpen, color: 'from-emerald-500 to-teal-500' },
    { label: 'Blog Posts', value: data.blogPostsCount ?? 0, icon: FileText, color: 'from-purple-500 to-pink-500' },
    { label: 'Testimonials', value: data.testimonialsCount ?? 0, icon: MessageSquareQuote, color: 'from-amber-500 to-orange-500' },
    { label: 'FAQs', value: data.faqsCount ?? 0, icon: HelpCircle, color: 'from-rose-500 to-red-500' },
    { label: 'Gallery Images', value: data.galleryCount ?? 0, icon: Image, color: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your site content</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-20 mb-4"></div>
              <div className="h-8 bg-white/5 rounded w-12"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Info */}
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Content Management</h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Use the sidebar navigation to manage all sections of your website. Changes you make here will be reflected on the public site immediately. Each section provides full CRUD operations — create, edit, reorder, and delete content items.
        </p>
      </div>
    </div>
  );
}
