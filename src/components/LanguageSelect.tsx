
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];

interface LanguageSelectProps {
  onSelect: (language: string) => void;
}

export const LanguageSelect = ({ onSelect }: LanguageSelectProps) => {
  return (
    <div className="w-full animate-fade-in">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Target Language for Translation
      </label>
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Choose language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
