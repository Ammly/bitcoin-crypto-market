'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: '📊' },
  { name: 'Price Trends', href: '/dashboard?tab=trends', icon: '📈' },
  { name: 'Volatility', href: '/dashboard?tab=volatility', icon: '📉' },
  { name: 'Correlations', href: '/dashboard?tab=correlations', icon: '🔗' },
  { name: 'Dominance', href: '/dashboard?tab=dominance', icon: '👑' },
  { name: 'Seasonal Patterns', href: '/dashboard?tab=seasonal', icon: '📅' },
  { name: 'Predictions', href: '/dashboard?tab=predictions', icon: '🔮' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 z-40 w-64 h-screen transition-transform">
      <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r border-gray-200">
        <ul className="space-y-2 font-medium">
          {navigation.map((item) => {
            const isActive = pathname === item.href.split('?')[0];
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <span className="flex-1 whitespace-nowrap">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-8 p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quick Stats
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Data Range: 2013-2021</div>
            <div>Cryptocurrencies: 23</div>
            <div>Total Records: 37K+</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
