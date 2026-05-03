interface StatsCardProps {
  title:  string;
  value:  string | number;
  icon:   string;
  color:  string;
  change?: string;
}

export default function StatsCard({ title, value, icon, color, change }: StatsCardProps) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {change && (
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
    </div>
  );
}