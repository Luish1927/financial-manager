import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoriesFilterProps {
  categories: string[];
  onFilterChange: (category: string) => void;
}

export const CategoriesFilter = ({
  categories,
  onFilterChange,
}: CategoriesFilterProps) => {
  return (
    <Select onValueChange={onFilterChange}>
      <SelectTrigger className="w-[180px] bg-background shadow-none border-none">
        <SelectValue placeholder="Categorias" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as categorias</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
