import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Pencil, Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  addCategory: (category: string) => void;
  updateCategory: (oldCategory: string, newCategory: string) => void;
  deleteCategory: (category: string) => void;
}

export const CategoryManagementDialog = ({
  open,
  onOpenChange,
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
}: CategoryManagementDialogProps) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const handleEdit = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(category);
  };

  const handleSave = (oldCategory: string) => {
    if (!newCategoryName.trim()) {
      toast.error("O nome da categoria não pode estar vazio.");
      return;
    }
    if (
      categories.includes(newCategoryName.trim()) &&
      newCategoryName.trim() !== oldCategory
    ) {
      toast.error("Essa categoria já existe.");
      return;
    }
    if (newCategoryName.trim() === oldCategory) {
      setEditingCategory(null);
      return;
    }
    updateCategory(oldCategory, newCategoryName.trim());
    setEditingCategory(null);
    toast.success("Categoria atualizada com sucesso!");
  };

  const handleDelete = (category: string) => {
    deleteCategory(category);
    toast.success("Categoria excluída com sucesso!");
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("O nome da categoria não pode estar vazio.");
      return;
    }
    if (categories.includes(newCategory.trim())) {
      toast.error("Essa categoria já existe.");
      return;
    }
    addCategory(newCategory.trim());
    setNewCategory("");
    toast.success("Categoria adicionada com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Crie, edite ou exclua suas categorias existentes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nova categoria"
            />
            <Button onClick={handleAddCategory} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between p-2 rounded-md border"
            >
              {editingCategory === category ? (
                <div className="flex-1 mr-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-8"
                  />
                </div>
              ) : (
                <Label className="flex-1">{category}</Label>
              )}
              <div className="flex items-center space-x-2">
                {editingCategory === category ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSave(category)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(category)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
