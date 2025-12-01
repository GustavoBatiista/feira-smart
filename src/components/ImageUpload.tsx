import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string; // URL da imagem atual
  onChange: (url: string) => void; // Callback quando uma nova imagem é enviada
  className?: string;
  maxSize?: number; // Tamanho máximo em MB (padrão: 5MB)
  accept?: string; // Tipos de arquivo aceitos
}

export function ImageUpload({
  value,
  onChange,
  className,
  maxSize = 5,
  accept = 'image/*',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, selecione uma imagem válida',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: `A imagem deve ter no máximo ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }

    // Criar preview imediato
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    setIsUploading(true);
    try {
      const result = await api.upload.image(file);
      onChange(result.fileUrl);
      toast({
        title: 'Upload realizado!',
        description: 'Imagem enviada com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Não foi possível enviar a imagem',
        variant: 'destructive',
      });
      setPreview(value || null); // Restaurar preview anterior em caso de erro
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
        id="image-upload"
      />

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="w-full"
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Enviando...' : 'Trocar Imagem'}
                </span>
              </Button>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label htmlFor="image-upload">
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
              'hover:border-primary/50 transition-colors',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Enviando imagem...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">
                  Clique para fazer upload de uma imagem
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF até {maxSize}MB
                </p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}

