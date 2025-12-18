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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Pencil, Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "@/types/category";
import * as Icons from "lucide-react";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => void;
}

const iconOptions = [
  'Tag', 'Utensils', 'Car', 'Home', 'Heart', 'Film', 'GraduationCap',
  'Wallet', 'Briefcase', 'TrendingUp', 'ShoppingCart', 'Coffee', 'Plane',
  'Book', 'Dumbbell', 'Music', 'Gift', 'Phone', 'Laptop', 'Shirt'
];

export const CategoryManagementDialog = ({
  open,
  onOpenChange,
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
}: CategoryManagementDialogProps) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [newCategoryForm, setNewCategoryForm] = useState<Omit<Category, 'id'>>({
    name: '',
    type: 'both',
    icon: 'Tag',
    color: '#6b7280',
    description: '',
  });

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditForm({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      description: category.description,
    });
  };

  const handleSave = (categoryId: string) => {
    if (!editForm.name?.trim()) {
      toast.error("O nome da categoria não pode estar vazio.");
      return;
    }

    const existingCategory = categories.find(c => c.id === categoryId);
    if (!existingCategory) return;

    // Verificar se o novo nome já existe em outra categoria
    if (
      editForm.name.trim() !== existingCategory.name &&
      categories.some(c => c.name === editForm.name.trim() && c.id !== categoryId)
    ) {
      toast.error("Essa categoria já existe.");
      return;
    }

    // Só enviar campos que foram alterados
    const updates: Partial<Category> = {};
    if (editForm.name && editForm.name !== existingCategory.name) {
      updates.name = editForm.name.trim();
    }
    if (editForm.type && editForm.type !== existingCategory.type) {
      updates.type = editForm.type;
    }
    if (editForm.icon && editForm.icon !== existingCategory.icon) {
      updates.icon = editForm.icon;
    }
    if (editForm.color && editForm.color !== existingCategory.color) {
      updates.color = editForm.color;
    }
    if (editForm.description !== undefined && editForm.description !== existingCategory.description) {
      updates.description = editForm.description;
    }

    if (Object.keys(updates).length === 0) {
      setEditingCategoryId(null);
      return;
    }

    updateCategory(categoryId, updates);
    setEditingCategoryId(null);
    setEditForm({});
    toast.success("Categoria atualizada com sucesso!");
  };

  const handleDelete = (categoryId: string) => {
    deleteCategory(categoryId);
    toast.success("Categoria excluída com sucesso!");
  };

  const handleAddCategory = () => {
    if (!newCategoryForm.name.trim()) {
      toast.error("O nome da categoria não pode estar vazio.");
      return;
    }
    if (categories.some(c => c.name === newCategoryForm.name.trim())) {
      toast.error("Essa categoria já existe.");
      return;
    }
    addCategory({
      ...newCategoryForm,
      name: newCategoryForm.name.trim(),
    });
    setNewCategoryForm({
      name: '',
      type: 'both',
      icon: 'Tag',
      color: '#6b7280',
      description: '',
    });
    toast.success("Categoria adicionada com sucesso!");
  };

  const renderIcon = (iconName: string, className: string = "h-4 w-4") => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className={className} /> : <Icons.Tag className={className} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Gerenciar Categorias</DialogTitle>
          <DialogDescription className="text-sm">
            Crie, edite ou exclua suas categorias com ícones e cores personalizadas.
          </DialogDescription>
        </DialogHeader>

        {/* Formulário de Nova Categoria */}
        <div className="space-y-3 border-b pb-4">
          <h3 className="font-semibold text-sm">Nova Categoria</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <Label htmlFor="new-name" className="text-xs">Nome</Label>
              <Input
                id="new-name"
                value={newCategoryForm.name}
                onChange={(e) => setNewCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Restaurantes"
                autoComplete="off"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="new-type" className="text-xs">Tipo</Label>
              <Select
                value={newCategoryForm.type}
                onValueChange={(value: 'income' | 'expense' | 'both') =>
                  setNewCategoryForm(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger id="new-type" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new-icon" className="text-xs">Ícone</Label>
              <Select
                value={newCategoryForm.icon}
                onValueChange={(value) => setNewCategoryForm(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger id="new-icon" className="h-9">
                  <div className="flex items-center gap-2">
                    {renderIcon(newCategoryForm.icon)}
                    <span>{newCategoryForm.icon}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(icon => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        {renderIcon(icon)}
                        <span>{icon}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="new-color" className="text-xs">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-color"
                  type="color"
                  value={newCategoryForm.color}
                  onChange={(e) => setNewCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  className="h-9 w-16 p-1"
                />
                <Input
                  type="text"
                  value={newCategoryForm.color}
                  onChange={(e) => setNewCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  className="h-9 flex-1 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="new-description" className="text-xs">Descrição</Label>
              <Input
                id="new-description"
                value={newCategoryForm.description}
                onChange={(e) => setNewCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional"
                autoComplete="off"
                className="h-9"
              />
            </div>
          </div>

          <Button onClick={handleAddCategory} className="w-full h-9">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Categoria
          </Button>
        </div>

        {/* Lista de Categorias */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Categorias Existentes</h3>
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-start gap-2 p-3 rounded-md border"
              style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
            >
              {editingCategoryId === category.id ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="h-8 text-sm"
                    placeholder="Nome"
                    autoComplete="off"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={editForm.type}
                      onValueChange={(value: 'income' | 'expense' | 'both') =>
                        setEditForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={editForm.icon}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <div className="flex items-center gap-1">
                          {editForm.icon && renderIcon(editForm.icon, "h-3 w-3")}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(icon => (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center gap-2">
                              {renderIcon(icon, "h-3 w-3")}
                              <span className="text-xs">{icon}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="color"
                    value={editForm.color || '#6b7280'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                    className="h-8 w-full"
                  />
                  <Input
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="h-8 text-xs"
                    placeholder="Descrição"
                    autoComplete="off"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <div style={{ color: category.color }}>
                        {renderIcon(category.icon)}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.type === 'income' ? '📈 Receita' : category.type === 'expense' ? '📉 Despesa' : '💰 Ambos'}
                      </div>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1">
                {editingCategoryId === category.id ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSave(category.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
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
