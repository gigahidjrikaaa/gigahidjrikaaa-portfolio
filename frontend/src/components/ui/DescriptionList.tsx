import React from 'react';

interface DescriptionListProps {
  description: string;
  className?: string;
}

const DescriptionList = ({ description, className = '' }: DescriptionListProps) => {
  if (!description) return null;

  const lines = description.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const isBulletList = lines.some(line =>
    line.startsWith('-') ||
    line.startsWith('•') ||
    line.startsWith('*') ||
    /^\d+\./.test(line)
  );

  if (!isBulletList || lines.length === 1) {
    return (
      <p className={`leading-relaxed text-gray-600 ${className}`}>
        {description}
      </p>
    );
  }

  const renderLine = (line: string, index: number) => {
    let content = line;
    let icon: React.ReactNode = null;
    const isSubBullet = line.startsWith('  ') || line.startsWith('\t');

    if (line.startsWith('-')) {
      content = line.slice(1).trim();
      icon = <span className="mr-3 h-1.5 w-1.5 mt-2 rounded-full bg-gray-400 flex-shrink-0" />;
    } else if (line.startsWith('•')) {
      content = line.slice(1).trim();
      icon = <span className="mr-3 h-1.5 w-1.5 mt-2 rounded-full bg-gray-400 flex-shrink-0" />;
    } else if (line.startsWith('*')) {
      content = line.slice(1).trim();
      icon = <span className="mr-3 mt-2 text-gray-400 flex-shrink-0">•</span>;
    } else if (/^\d+\./.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      content = line.replace(/^\d+\.\s*/, '').trim();
      icon = <span className="mr-3 mt-1.5 h-5 w-5 flex-shrink-0 rounded-lg bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-600 text-center">{num}</span>;
    } else {
      icon = <span className="mr-3 mt-2 text-gray-400 flex-shrink-0">•</span>;
    }

    return (
      <li
        key={index}
        className={`flex items-start text-sm leading-relaxed text-gray-600 ${isSubBullet ? 'ml-6' : ''}`}
      >
        {icon}
        <span className="flex-1">{content}</span>
      </li>
    );
  };

  return (
    <ul className={`space-y-3 ${className}`}>
      {lines.map((line, index) => renderLine(line, index))}
    </ul>
  );
};

export default DescriptionList;
