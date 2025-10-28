'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaFire, FaRocket, FaUser, FaHeart } from 'react-icons/fa';
import WalletConnectButton from './WalletConnectButton';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Header */}
      <nav className="hidden md:block border-b border-gray-800 bg-dark/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition">
                <FaHeart className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                DatingDApp
              </span>
            </Link>

            <div className="flex items-center gap-8">
              <Link
                href="/"
                className={`text-gray-300 hover:text-white transition font-medium ${
                  pathname === '/' ? 'text-white' : ''
                }`}
              >
                Discover
              </Link>

              <Link
                href="/boost"
                className={`text-gray-300 hover:text-accent transition font-medium ${
                  pathname === '/boost' ? 'text-accent' : ''
                }`}
              >
                Boost
              </Link>

              <Link
                href="/leaderboard"
                className={`text-gray-300 hover:text-primary transition font-medium ${
                  pathname === '/leaderboard' ? 'text-primary' : ''
                }`}
              >
                Leaderboard
              </Link>

              <Link
                href="/profile"
                className={`text-gray-300 hover:text-secondary transition font-medium ${
                  pathname === '/profile' ? 'text-secondary' : ''
                }`}
              >
                Profile
              </Link>

              <WalletConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <nav className="md:hidden border-b border-gray-800 bg-dark/95 backdrop-blur-md sticky top-0 z-50">
        <div className="px-3 py-2.5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <FaHeart className="text-white text-sm" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DatingDApp
            </span>
          </Link>

          <div className="flex-shrink-0">
            <WalletConnectButton />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark/98 backdrop-blur-md border-t border-gray-800 z-50 safe-area-pb">
        <div className="flex justify-around items-center h-16 px-2">
          <NavLink href="/" icon={<FaHeart />} label="Discover" active={pathname === '/'} />
          <NavLink href="/boost" icon={<FaRocket />} label="Boost" active={pathname === '/boost'} />
          <NavLink href="/leaderboard" icon={<FaFire />} label="Top" active={pathname === '/leaderboard'} />
          <NavLink href="/profile" icon={<FaUser />} label="Profile" active={pathname === '/profile'} />
        </div>
      </div>
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-2 ${
        active ? 'text-primary' : 'text-gray-400 active:text-primary'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
