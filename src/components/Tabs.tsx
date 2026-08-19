import React, { useState } from 'react';
import { Tab } from '@headlessui/react';

interface TabsProps {
  tabs: {
    name: string;
    content: React.ReactNode;
  }[];
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex gap-1 rounded-xl bg-indigo-50 border border-rose-light p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-semibold leading-5 transition-colors focus:outline-none
                 ${selected
                  ? 'bg-white text-burgundy shadow-sm'
                  : 'text-ink-60 hover:text-burgundy hover:bg-white/50'
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {tabs.map((tab, idx) => (
            <Tab.Panel key={idx} className="focus:outline-none">
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
