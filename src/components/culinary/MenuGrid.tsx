import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { MenuItem } from '../../types/database';

interface Props {
  siteId: string;
  primaryColor: string;
}

export default function MenuGrid({ siteId, primaryColor }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('menu_items')
      .select('*')
      .eq('site_id', siteId)
      .eq('is_available', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setItems((data ?? []) as unknown as MenuItem[]);
        setLoading(false);
      });
  }, [siteId]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} />
    </div>
  );

  if (items.length === 0) return null;

  // Group by category, preserving insertion order
  const categories = Array.from(new Set(items.map(i => i.category ?? 'Menu')));
  const grouped = Object.fromEntries(
    categories.map(cat => [cat, items.filter(i => (i.category ?? 'Menu') === cat)])
  );

  return (
    <div className="space-y-14">
      {categories.map(category => (
        <div key={category}>
          {/* Category header */}
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{category}</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped[category].map(item => (
              <MenuCard key={item.id} item={item} primaryColor={primaryColor} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuCard({ item, primaryColor }: { item: MenuItem; primaryColor: string }) {
  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      {item.image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${primaryColor}10` }}>
          🍽️
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</h4>
          {item.price !== null && (
            <span className="text-sm font-bold flex-shrink-0" style={{ color: primaryColor }}>
              ${Number(item.price).toFixed(2)}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{item.description}</p>
        )}
      </div>
    </div>
  );
}
