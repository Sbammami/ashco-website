import { Facebook, Twitter, Instagram, Linkedin, ArrowUp, Fuel } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  const services = [
    'Bulk Diesel Supply',
    'POL Distribution',
    'Storage Solutions',
    'Logistics Services',
    'Fuel Consulting',
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative bg-ashco-black text-white overflow-hidden">
      {/* Main Footer */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-14 h-14 bg-white rounded-lg p-1">
                <img
                  src="/logo.png"
                  alt="Ashco Energy Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="font-body text-sm text-white/70 leading-relaxed mb-6">
              Ashco Energy Ltd. is a reliable petroleum supplier providing bulk
              diesel solutions, POL distribution, and fuel services across
              Nigeria.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-ashco-yellow flex items-center justify-center transition-all duration-300 group"
                >
                  <social.icon className="w-4 h-4 text-white group-hover:text-ashco-black transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-6 text-ashco-yellow">
              QUICK LINKS
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-white/70 hover:text-ashco-yellow transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-ashco-yellow transition-all duration-300 group-hover:w-3" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-6 text-ashco-yellow">
              OUR SERVICES
            </h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <div className="font-body text-sm text-white/70 flex items-center gap-2">
                    <Fuel className="w-3 h-3 text-ashco-green" />
                    {service}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-6 text-ashco-yellow">
              CONTACT INFO
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-body text-sm text-white/50 mb-1">Address</p>
                <p className="font-body text-sm text-white/70">
                  Dantata & Sawoe Yard, Murtala Mohammed Expressway, Gudu, Abuja.
                </p>
              </div>
              <div>
                <p className="font-body text-sm text-white/50 mb-1">Phone</p>
                <a
                  href="tel:09055000086"
                  className="font-body text-sm text-white/70 hover:text-ashco-yellow transition-colors duration-300"
                >
                  0905 5000 086
                </a>
              </div>
              <div>
                <p className="font-body text-sm text-white/50 mb-1">Email</p>
                <a
                  href="mailto:ashcoenergyltd@gmail.com"
                  className="font-body text-sm text-white/70 hover:text-ashco-yellow transition-colors duration-300"
                >
                  ashcoenergyltd@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-sm text-white/50 text-center sm:text-left">
              © {new Date().getFullYear()} Ashco Energy Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="font-body text-sm text-white/50 hover:text-ashco-yellow transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="font-body text-sm text-white/50 hover:text-ashco-yellow transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-ashco-yellow text-ashco-black shadow-lg hover:bg-ashco-green hover:text-white transition-all duration-300 flex items-center justify-center z-40 group"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
      </button>
    </footer>
  );
};

export default Footer;
