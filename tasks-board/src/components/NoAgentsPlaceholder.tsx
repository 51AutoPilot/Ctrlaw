'use client';

import Link from 'next/link';
import { useT } from '../lib/i18n';

interface Props {
  message?: string;
}

export function NoAgentsPlaceholder({ message }: Props) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">
        ?
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('placeholder.title')}</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {message || t('placeholder.default')}
      </p>
      <Link
        href="/settings"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        {t('placeholder.goSettings')}
      </Link>
    </div>
  );
}
