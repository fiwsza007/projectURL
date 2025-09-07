import React, { useState } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Eye, 
  Calendar, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Link } from '../types';

interface LinkCardProps {
  link: Link;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function LinkCard({ link, onToggleStatus, onDelete }: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link.shortUrl || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = link.isExpired || false;
  const isActive = link.isActive && !isExpired;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              /{link.shortCode}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-emerald-100 text-emerald-700'
                : isExpired
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isActive ? 'ใช้งานได้' : isExpired ? 'หมดอายุ' : 'ปิดใช้งาน'}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 break-all">
            <span className="font-medium">ปลายทาง:</span> {link.originalUrl}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{link.clickCount} ครั้ง</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>สร้างเมื่อ {formatDate(link.createdAt)}</span>
            </div>
          </div>

          {link.expiresAt && (
            <div className={`flex items-center gap-1 text-sm mb-4 ${
              isExpired ? 'text-red-600' : 'text-orange-600'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <span>
                {isExpired ? 'หมดอายุแล้ว' : 'หมดอายุ'} {formatDate(link.expiresAt)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono">
              {link.shortUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="คัดลอกลิงก์"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="เปิดลิงก์"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onToggleStatus(link.id)}
          disabled={isExpired}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isExpired
              ? 'text-gray-400 cursor-not-allowed'
              : link.isActive
              ? 'text-orange-700 bg-orange-50 hover:bg-orange-100'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
          title={isExpired ? 'ลิงก์หมดอายุแล้ว' : link.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
        >
          {link.isActive ? (
            <ToggleRight className="h-4 w-4" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
          {link.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
        </button>

        <button
          onClick={() => onDelete(link.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
          title="ลบลิงก์"
        >
          <Trash2 className="h-4 w-4" />
          ลบ
        </button>
      </div>
    </div>
  );
}