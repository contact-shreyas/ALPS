import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { locales, localeNames, Locale } from '@/lib/i18n/translations';

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex space-x-2">
      {locales.map((l) => (
        <Button
          key={l}
          variant={l === locale ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLocale(l as Locale)}
        >
          {localeNames[l]}
        </Button>
      ))}
    </div>
  );
}