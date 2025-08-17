import React from 'react';
import Card from '../components/Card';
import { PhoneCallIcon, EmailIcon, BranchIcon } from '../components/icons/InterfaceIcons';

const ContactPage: React.FC = () => {
    const primaryBgClass = "bg-[hsl(var(--accent-hue)_var(--accent-saturation)_var(--accent-lightness))]";
    const primaryHoverBgClass = "hover:opacity-90";
    
    return (
        <div className="py-12 lg:py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl font-serif">
                        Contáctenos
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Estamos aquí para ayudarle. Envíenos un mensaje o llámenos para agendar una consulta.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <Card>
                            <h2 className="text-2xl font-bold mb-4">Información de Contacto</h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                <p className="flex items-center"><BranchIcon className="h-5 w-5 mr-3 text-purple-500"/> Ibarra, Ecuador</p>
                                <p className="flex items-center"><PhoneCallIcon className="h-5 w-5 mr-3 text-purple-500"/> +593 98 883 5269</p>
                                <p className="flex items-center"><EmailIcon className="h-5 w-5 mr-3 text-purple-500"/> info@abgipiales.com</p>
                            </div>
                        </Card>
                         <Card>
                            <h2 className="text-2xl font-bold mb-4">Horario de Atención</h2>
                            <div className="space-y-2 text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between"><span>Lunes - Viernes:</span> <span>9:00 AM - 6:00 PM</span></div>
                                <div className="flex justify-between"><span>Sábado:</span> <span>10:00 AM - 1:00 PM</span></div>
                                <div className="flex justify-between"><span>Domingo:</span> <span>Cerrado</span></div>
                            </div>
                        </Card>
                    </div>
                    
                    <Card>
                        <h2 className="text-2xl font-bold mb-4">Envíenos un Mensaje</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">Nombre</label>
                                <input type="text" id="name" placeholder="Su Nombre" className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
                            </div>
                             <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input type="email" id="email" placeholder="Su Email" className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
                            </div>
                             <div>
                                <label htmlFor="message" className="sr-only">Mensaje</label>
                                <textarea id="message" rows={5} placeholder="Su Mensaje" className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
                            </div>
                            <div>
                                <button type="submit" className={`w-full px-6 py-3 text-lg font-semibold text-white rounded-lg shadow-lg transition-transform hover:scale-105 ${primaryBgClass} ${primaryHoverBgClass}`}>
                                    Enviar Mensaje
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
