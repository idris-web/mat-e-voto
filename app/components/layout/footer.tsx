import { Link } from "react-router";
import type { Translations } from "~/locales";

interface FooterProps {
  t: Translations;
}

export function Footer({ t }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Premtimet
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-md">
              {t.home.subtitle}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t.nav.promises}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/promises"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t.nav.promises}
                </Link>
              </li>
              <li>
                <Link
                  to="/politicians"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t.nav.politicians}
                </Link>
              </li>
              <li>
                <Link
                  to="/parties"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t.nav.parties}
                </Link>
              </li>
              <li>
                <Link
                  to="/topics"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t.nav.topics}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t.footer.about}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  to="/methodology"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t.footer.methodology}
                </Link>
              </li>
              <li>
                <Link
                  to="/submit-tip"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t.home.submitTip}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            &copy; {currentYear} Premtimet. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}
