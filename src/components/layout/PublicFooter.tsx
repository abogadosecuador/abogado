import React from 'react';
import { NexusProIcon, FacebookIcon, InstagramIcon, XIcon, LinkedInIcon } from '../icons/InterfaceIcons';
import { legalServices } from '../../data/servicesData';

interface PublicFooterProps {
    onNavigate: (page: string) => void;
}

const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        const email = (e.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement;
        alert(`Gracias por suscribirte, ${email.value}!`);
        email.value = '';
    };

    return (
        <footer className="bg-[var(--card)] border-t border-[var(--border)]">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex items-center">
                            <NexusProIcon className="h-8 w-auto text-[var(--accent-color)]" />
                            <span className="text-xl font-black ml-2 tracking-tighter">Abg. W. Ipiales</span>
                        </a>
                        <p className="text-sm text-[var(--muted-foreground)]">Soluciones legales integrales para proteger sus intereses y asegurar su tranquilidad.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-gray-500"><FacebookIcon className="h-6 w-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-gray-500"><InstagramIcon className="h-6 w-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-gray-500"><XIcon className="h-6 w-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-gray-500"><LinkedInIcon className="h-6 w-6" /></a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Servicios</h3>
                        <ul className="mt-4 space-y-2">
                            {legalServices.slice(0, 5).map(service => (
                                <li key={service.id}>
                                    <a href={`#/service-detail/${service.slug}`} onClick={(e) => {e.preventDefault(); onNavigate(`service-detail/${service.slug}`)}} className="text-base text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{service.title}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Legal</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#/privacy-policy" onClick={(e) => {e.preventDefault(); onNavigate('privacy-policy')}} className="text-base text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Política de Privacidad</a></li>
                            <li><a href="#/terms-of-service" onClick={(e) => {e.preventDefault(); onNavigate('terms-of-service')}} className="text-base text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Términos de Servicio</a></li>
                            <li><a href="#/contact" onClick={(e) => {e.preventDefault(); onNavigate('contact')}} className="text-base text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Contacto</a></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Suscríbete</h3>
                        <p className="mt-4 text-base text-[var(--muted-foreground)]">Recibe recursos y noticias legales.</p>
                        <form className="mt-4 sm:flex sm:max-w-md" onSubmit={handleSubscribe}>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input type="email" name="email" id="email-address" required className="appearance-none min-w-0 w-full bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm py-2 px-4 text-base placeholder-gray-500 focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" placeholder="Tu email"/>
                            <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                                <button type="submit" className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center border border-transparent rounded-md py-2 px-4 text-base font-medium hover:opacity-90">Unirse</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="mt-8 border-t border-[var(--border)] pt-8 text-center text-sm text-[var(--muted-foreground)]">
                    <p>&copy; {new Date().getFullYear()} Abg. Wilson Alexander Ipiales. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;