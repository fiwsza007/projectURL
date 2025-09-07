import React, { useState } from 'react';
import { Link, Plus } from 'lucide-react';
import { CreateLinkRequest } from '../types';

interface CreateLinkFormProps {
  onSubmit: (data: CreateLinkRequest) => void;
  isLoading: boolean;
}

export default function CreateLinkForm({ onSubmit, isLoading }: CreateLinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!originalUrl) {
      newErrors.originalUrl = 'กรุณาระบุ URL';
    } else {
      try {
        const url = new URL(originalUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.originalUrl = 'URL ต้องขึ้นต้นด้วย http:// หรือ https://';
        }
      } catch {
        newErrors.originalUrl = 'รูปแบบ URL ไม่ถูกต้อง';
      }
    }

    if (!shortCode) {
      newErrors.shortCode = 'กรุณาระบุรหัสย่อ';
    } else if (shortCode.length < 3 || shortCode.length > 20) {
      newErrors.shortCode = 'รหัสย่อต้องมี 3-20 ตัวอักษร';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      newErrors.shortCode = 'ใช้ได้เฉพาะตัวอักษร ตัวเลข - และ _';
    }

    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      if (expiryDate <= now) {
        newErrors.expiresAt = 'วันหมดอายุต้องเป็นวันในอนาคต';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      originalUrl,
      shortCode,
      expiresAt: expiresAt || undefined,
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Link className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">สร้างลิงก์ย่อใหม่</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-2">
            URL เดิม <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="originalUrl"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.originalUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.originalUrl && (
            <p className="text-red-600 text-sm mt-1">{errors.originalUrl}</p>
          )}
        </div>

        <div>
          <label htmlFor="shortCode" className="block text-sm font-medium text-gray-700 mb-2">
            รหัสย่อที่ต้องการ <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
              short.ly/
            </span>
            <input
              type="text"
              id="shortCode"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="my-link"
              className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                errors.shortCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.shortCode && (
            <p className="text-red-600 text-sm mt-1">{errors.shortCode}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            ใช้ได้เฉพาะตัวอักษร ตัวเลข - และ _ (3-20 ตัวอักษร)
          </p>
        </div>

        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
            วันหมดอายุ (ไม่บังคับ)
          </label>
          <input
            type="datetime-local"
            id="expiresAt"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={getTomorrowDate()}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.expiresAt ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.expiresAt && (
            <p className="text-red-600 text-sm mt-1">{errors.expiresAt}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          {isLoading ? 'กำลังสร้าง...' : 'สร้างลิงก์ย่อ'}
        </button>
      </form>
    </div>
  );
}