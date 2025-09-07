import React from 'react';
import { Link, Eye, Clock, CheckCircle } from 'lucide-react';
import { Link as LinkType } from '../types';

interface StatisticsProps {
  links: LinkType[];
}

export default function Statistics({ links }: StatisticsProps) {
  const stats = React.useMemo(() => {
    const totalLinks = links.length;
    const activeLinks = links.filter(link => link.isActive && !link.isExpired).length;
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    const expiredLinks = links.filter(link => link.isExpired).length;

    return {
      totalLinks,
      activeLinks,
      totalClicks,
      expiredLinks,
    };
  }, [links]);

  const statItems = [
    {
      label: 'ลิงก์ทั้งหมด',
      value: stats.totalLinks,
      icon: Link,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'ลิงก์ที่ใช้งานได้',
      value: stats.activeLinks,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'คลิกทั้งหมด',
      value: stats.totalClicks.toLocaleString(),
      icon: Eye,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'ลิงก์หมดอายุ',
      value: stats.expiredLinks,
      icon: Clock,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`p-4 rounded-xl border ${item.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <Icon className="h-6 w-6 opacity-60" />
            </div>
          </div>
        );
      })}
    </div>
  );
}