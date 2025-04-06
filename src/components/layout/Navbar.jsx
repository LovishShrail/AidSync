import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { account, isOwner, connectWallet } = useContext(Web3Context);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const isActive = (path) => {
    return location.pathname === path || (path === '/admin' && location.pathname.startsWith('/admin')) 
      ? 'text-blue-600' 
      : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/AidsyncLogo.png"
                alt="AidSync3D Logo"
                className="h-18 w-72 object-contain ml-[-30px]"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/disasters" className={`font-medium ${isActive('/disasters')}`}>
              Disasters
            </Link>
            <Link to="/organizations" className={`font-medium ${isActive('/organizations')}`}>
              Organizations
            </Link>
            <Link to="/leaderboard" className={`font-medium ${isActive('/leaderboard')}`}>
              Leaderboard
            </Link>
            <Link to="/emergency-fund" className={`font-medium ${isActive('/emergency-fund')}`}>
              Emergency Fund
            </Link>

            {isOwner && (
              <div className="relative group">
                <Link 
                  to="/admin" 
                  className={`flex items-center font-medium ${isActive('/admin')}`}
                >
                  Admin <ChevronDown size={16} className="ml-1" />
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/admin/create-disaster" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">
                    Create Disaster
                  </Link>
                  <Link to="/admin/manage-organizations" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">
                    Manage Organizations
                  </Link>
                  <Link to="/admin/withdraw" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">
                    Withdraw Funds
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {account ? (
              <div className="flex items-center">
                <Link to="/profile" className="mr-4 font-medium text-gray-700 hover:text-blue-600">
                  My Profile
                </Link>
                <div className="bg-blue-50 text-blue-700 py-2 px-4 rounded-full text-sm font-medium">
                  {formatAddress(account)}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pt-2 pb-4 px-4">
          <div className="flex flex-col space-y-3">
            <Link
              to="/disasters"
              className={`py-2 px-2 rounded-md ${isActive('/disasters')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Disasters
            </Link>
            <Link
              to="/organizations"
              className={`py-2 px-2 rounded-md ${isActive('/organizations')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Organizations
            </Link>
            <Link
              to="/leaderboard"
              className={`py-2 px-2 rounded-md ${isActive('/leaderboard')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              to="/emergency-fund"
              className={`py-2 px-2 rounded-md ${isActive('/emergency-fund')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Emergency Fund
            </Link>

            {isOwner && (
              <>
                <div className="border-t border-gray-200 pt-2 my-1"></div>
                <Link
                  to="/admin"
                  className={`font-medium py-2 px-2 rounded-md ${isActive('/admin')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
                <Link
                  to="/admin/create-disaster"
                  className="py-2 px-2 rounded-md text-gray-700 hover:text-blue-600 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Disaster
                </Link>
                <Link
                  to="/admin/manage-organizations"
                  className="py-2 px-2 rounded-md text-gray-700 hover:text-blue-600 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Organizations
                </Link>
                <Link
                  to="/admin/withdraw"
                  className="py-2 px-2 rounded-md text-gray-700 hover:text-blue-600 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Withdraw Funds
                </Link>
              </>
            )}

            <div className="border-t border-gray-200 pt-2 my-1"></div>

            {account ? (
              <>
                <Link
                  to="/profile"
                  className="py-2 px-2 rounded-md text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <div className="bg-blue-50 text-blue-700 py-2 px-4 rounded-md text-sm">
                  {formatAddress(account)}
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  setIsMenuOpen(false);
                }}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;