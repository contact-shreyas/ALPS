import { BellIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';

type AlertIcon = {
  [key: number]: {
    icon: typeof BellIcon;
    class: string;
    bgClass: string;
  };
};

export const alertIcons: AlertIcon = {
  1: { icon: CheckCircleIcon, class: 'text-green-500', bgClass: 'bg-green-50 dark:bg-green-900/20' },
  3: { icon: BellIcon, class: 'text-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-900/20' },
  5: { icon: ExclamationTriangleIcon, class: 'text-amber-500', bgClass: 'bg-amber-50 dark:bg-amber-900/20' },
  7: { icon: ExclamationTriangleIcon, class: 'text-red-500', bgClass: 'bg-red-50 dark:bg-red-900/20' },
};