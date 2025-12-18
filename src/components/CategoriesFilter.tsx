import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/category";
import * as Icons from "lucide-react";

interface CategoriesFilterProps {
  categories: Category[];
  onFilterChange: (category: string) => void;
}

export const CategoriesFilter = ({
  categories,
  onFilterChange,
}: CategoriesFilterProps) => {
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Icons.Tag className="h-4 w-4" />;
  };

  return (
    <Select onValueChange={onFilterChange}>
      <SelectTrigger className="w-[180px] bg-background shadow-none border-none">
        <SelectValue placeholder="Categorias" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as categorias</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.name}>
            <div className="flex items-center gap-2">
              <div style={{ color: category.color }}>
                {renderIcon(category.icon)}
              </div>
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
