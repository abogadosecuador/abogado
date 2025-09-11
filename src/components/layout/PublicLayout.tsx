import React from 'react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import WhatsAppButton from '../WhatsAppButton';
import CookiesBanner from '../CookiesBanner';

interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, onNavigate, isLoggedIn, onLogout }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)]">
            <PublicHeader onNavigate={onNavigate} isLoggedIn={isLoggedIn} onLogout={onLogout} />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <PublicFooter onNavigate={onNavigate} />
            
            {/* Floating Action Buttons */}
            <WhatsAppButton />
            <CookiesBanner />
        </div>
    );
};

export default PublicLayout;