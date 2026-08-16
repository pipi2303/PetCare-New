import React, { useState } from 'react';
import { LucideIcon, Printer, Sliders } from 'lucide-react';
import { QuickPrintConfigModal, QuickPrintData } from './QuickPrintConfigModal';

export interface HeaderBadge {
  label: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'rose' | 'blue' | 'purple' | 'amber' | 'neutral';
  icon?: LucideIcon;
  pulse?: boolean;
}

export interface HeaderTabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number | string;
  badge?: string;
  badgeVariant?: 'gold' | 'emerald' | 'rose' | 'blue' | 'purple' | 'amber';
}

export interface HeaderStatItem {
  label: string;
  value: string | number;
  variant?: 'default' | 'rose' | 'amber' | 'emerald' | 'blue' | 'purple';
}

export interface SystemNotificationHeaderProps {
  icon?: LucideIcon | React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  badges?: (HeaderBadge | React.ReactNode)[];
  actions?: React.ReactNode;
  tabs?: HeaderTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  stats?: HeaderStatItem[];
  children?: React.ReactNode;
  className?: string;
  enableQuickPrint?: boolean;
  quickPrintData?: QuickPrintData;
}

const badgeVariants: Record<string, string> = {
  gold: 'bg-[#B8905A]/20 text-[#D9B98A] border-[#B8905A]/30 font-semibold',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-semibold',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold',
  neutral: 'bg-white/10 text-[#EDE6D6] border-white/15 font-medium'
};

const statVariants: Record<string, { bg: string; text: string }> = {
  default: { bg: 'bg-[#101A2C]/70 border-white/10', text: 'text-[#FFFDF9]' },
  rose: { bg: 'bg-rose-950/40 border-rose-500/30', text: 'text-rose-300' },
  amber: { bg: 'bg-amber-950/40 border-amber-500/30', text: 'text-amber-300' },
  emerald: { bg: 'bg-emerald-950/40 border-emerald-500/30', text: 'text-emerald-300' },
  blue: { bg: 'bg-blue-950/40 border-blue-500/30', text: 'text-blue-300' },
  purple: { bg: 'bg-purple-950/40 border-purple-500/30', text: 'text-purple-300' }
};

export const SystemNotificationHeader: React.FC<SystemNotificationHeaderProps> = ({
  icon,
  title,
  subtitle,
  description,
  badges,
  actions,
  tabs,
  activeTab,
  onTabChange,
  stats,
  children,
  className = '',
  enableQuickPrint = true,
  quickPrintData
}) => {
  const [showQuickPrintModal, setShowQuickPrintModal] = useState(false);

  const desc = description || subtitle;
  const hasBottomContent = (tabs && tabs.length > 0) || (stats && stats.length > 0) || Boolean(children);

  const activeTabItem = tabs?.find((t) => t.id === activeTab);

  // Helper to extract a display title string for printable sheet
  const getTitleString = (): string => {
    if (typeof title === 'string') return title;
    return 'Laporan Ringkasan Modul';
  };

  const getSubtitleString = (): string | undefined => {
    if (typeof desc === 'string') return desc;
    return undefined;
  };

  const renderIconElement = (
    item: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode | undefined,
    cls: string
  ) => {
    if (!item) return null;
    if (React.isValidElement(item)) {
      return item;
    }
    if (
      typeof item === 'function' ||
      (typeof item === 'object' && item !== null && ('$$typeof' in item || 'render' in item))
    ) {
      const Component = item as React.ComponentType<{ className?: string }>;
      return <Component className={cls} />;
    }
    return null;
  };

  const renderBadge = (badge: HeaderBadge | React.ReactNode, index: number) => {
    if (React.isValidElement(badge)) {
      return <React.Fragment key={index}>{badge}</React.Fragment>;
    }
    if (typeof badge === 'object' && badge !== null && 'label' in badge) {
      const b = badge as HeaderBadge;
      const variantClass = badgeVariants[b.variant || 'gold'] || badgeVariants.gold;
      return (
        <span
          key={index}
          className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border ${variantClass}`}
        >
          {b.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
          {renderIconElement(b.icon, 'w-3 h-3')}
          <span>{b.label}</span>
        </span>
      );
    }
    return null;
  };

  const quickPrintButton = enableQuickPrint ? (
    <button
      type="button"
      onClick={() => setShowQuickPrintModal(true)}
      className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#101A2C]/80 hover:bg-[#101A2C] text-[#D9B98A] hover:text-[#FFFDF9] border border-[#B8905A]/40 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
      title="Cetak ringkasan data modul saat ini secara instan (Quick Print Config)"
    >
      <Printer className="w-3.5 h-3.5 text-[#B8905A] group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline">Quick Print Config</span>
      <span className="sm:hidden">Print</span>
    </button>
  ) : null;

  return (
    <>
      <div
        className={`p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#1B2A45] via-[#16233B] to-[#101A2C] border border-[#B8905A]/40 text-[#FFFDF9] shadow-md ${
          hasBottomContent ? 'space-y-3' : 'flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5'
        } ${className}`}
      >
        <div className={hasBottomContent ? 'flex flex-col md:flex-row items-start md:items-center justify-between gap-3' : 'flex items-center gap-3'}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2.5 bg-gradient-to-br from-[#B8905A] to-[#9E7848] text-[#101A2C] rounded-xl font-black shadow-xs border border-amber-300/30 shrink-0">
                {renderIconElement(icon, 'w-5 h-5')}
              </div>
            )}

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold font-display text-[#FFFDF9] tracking-tight">
                  {title}
                </h2>
                {badges && badges.map((badge, idx) => renderBadge(badge, idx))}
              </div>
              {desc && (
                <p className="text-[11px] sm:text-xs text-[#EDE6D6]/80 leading-snug">
                  {desc}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end flex-wrap">
            {quickPrintButton}
            {actions}
          </div>
        </div>

        {/* Stats Bar */}
        {stats && stats.length > 0 && (
          <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(stats.length, 4)} gap-2 pt-2.5 border-t border-white/10`}>
            {stats.map((st, i) => {
              const style = statVariants[st.variant || 'default'] || statVariants.default;
              return (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-lg border flex items-center justify-between ${style.bg}`}
                >
                  <span className="text-[10px] text-[#EDE6D6]/70 uppercase font-semibold">{st.label}</span>
                  <span className={`text-xs font-black font-mono ${style.text}`}>{st.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs Navigation Strip */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2.5 border-t border-white/10 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#B8905A] text-[#101A2C] shadow-xs font-black'
                      : 'bg-[#101A2C]/70 text-[#EDE6D6]/80 hover:bg-[#1F2E47] hover:text-[#FFFDF9] border border-white/10'
                  }`}
                >
                  {renderIconElement(tab.icon, 'w-3.5 h-3.5')}
                  <span>
                    {tab.label}
                    {tab.count !== undefined ? ` (${tab.count})` : ''}
                  </span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                        tab.badgeVariant === 'rose'
                          ? 'bg-rose-500/30 text-rose-300 animate-pulse'
                          : 'bg-[#B8905A]/30 text-[#D9B98A]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Nested Bottom Content */}
        {children}
      </div>

      {/* Quick Print Config Modal */}
      <QuickPrintConfigModal
        isOpen={showQuickPrintModal}
        onClose={() => setShowQuickPrintModal(false)}
        moduleTitle={getTitleString()}
        moduleSubtitle={getSubtitleString()}
        badges={badges}
        stats={stats}
        activeTabLabel={activeTabItem?.label}
        quickPrintData={quickPrintData}
      />
    </>
  );
};

