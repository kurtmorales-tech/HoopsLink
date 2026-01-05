
import React from 'react';
import { ICONS } from '../constants';
import { User, UserRole } from '../types';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  hasNotifications?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage, hasNotifications }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Logo */}
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => onNavigate('home')}>
              <div className="bg-orange-600 text-white p-2 rounded-lg group-hover:bg-orange-700 transition-all shadow-md">
                <ICONS.Basketball />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">HoopsLink</span>
            </div>

            {/* Navigation Menu (Shadcn UI) */}
            <div className="hidden sm:flex items-center flex-1 justify-center px-8">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <button
                      onClick={() => onNavigate('home')}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "font-bold text-gray-700 hover:text-orange-600",
                        currentPage === 'home' && "text-orange-600 bg-orange-50/50"
                      )}
                    >
                      Discover
                    </button>
                  </NavigationMenuItem>
                  {user && (
                    <NavigationMenuItem>
                      <button
                        onClick={() => onNavigate('my-games')}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "font-bold text-gray-700 hover:text-orange-600",
                          currentPage === 'my-games' && "text-orange-600 bg-orange-50/50"
                        )}
                      >
                        My Games
                      </button>
                    </NavigationMenuItem>
                  )}
                  {user?.role === UserRole.ORGANIZER && (
                    <>
                      <NavigationMenuItem>
                        <button
                          onClick={() => onNavigate('dashboard')}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "font-bold text-gray-700 hover:text-orange-600",
                            currentPage === 'dashboard' && "text-orange-600 bg-orange-50/50"
                          )}
                        >
                          Dashboard
                        </button>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <button
                          onClick={() => onNavigate('player-directory')}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "font-bold text-gray-700 hover:text-orange-600",
                            currentPage === 'player-directory' && "text-orange-600 bg-orange-50/50"
                          )}
                        >
                          Players
                        </button>
                      </NavigationMenuItem>
                    </>
                  )}
                  
                  {/* Resources Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="font-bold text-gray-700 hover:text-orange-600">Resources</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <button
                              onClick={() => onNavigate('rules')}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 text-left w-full"
                            >
                              <div className="text-sm font-bold leading-none">Court Rules</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500 mt-1">Standard etiquette and rules for organized pickup runs.</p>
                            </button>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <button
                              onClick={() => onNavigate('about')}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 text-left w-full"
                            >
                              <div className="text-sm font-bold leading-none">About HoopsLink</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500 mt-1">Our mission to eliminate chaos from local pickup basketball.</p>
                            </button>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <button
                              onClick={() => window.open('mailto:support@hoopslink.com')}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 text-left w-full"
                            >
                              <div className="text-sm font-bold leading-none">Contact Support</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500 mt-1">Need help with your account or hosting? We're here.</p>
                            </button>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Auth/Profile Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onNavigate('profile')}
                    className={cn(
                      "p-2 rounded-full relative transition-all group",
                      currentPage === 'profile' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    aria-label="Profile"
                  >
                    <ICONS.User />
                  </button>
                  
                  {hasNotifications && (
                    <div className="relative">
                      <div className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full animate-pulse ring-2 ring-white"></div>
                      <button 
                        onClick={() => onNavigate('my-games')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-all"
                        title="You have new notifications"
                      >
                        <ICONS.Bell />
                      </button>
                    </div>
                  )}

                  <div className="text-right hidden md:block mx-2 cursor-pointer" onClick={() => onNavigate('profile')}>
                    <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{user.role}</p>
                  </div>
                  
                  <button 
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Log Out"
                  >
                    <ICONS.LogOut />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onNavigate('login')}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2 opacity-60">
              <ICONS.Basketball />
              <span className="font-black tracking-tight text-gray-900">HoopsLink</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => onNavigate('home')} className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors">Discover</button>
              <button onClick={() => onNavigate('rules')} className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors">Rules</button>
              <button onClick={() => onNavigate('about')} className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors">About</button>
              <button onClick={() => window.open('mailto:support@hoopslink.com')} className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors">Support</button>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">© 2024 HoopsLink. Play Basketball. No Chaos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
