'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Search } from 'lucide-react';

interface ImageUploadProps {
  onClose: () => void;
}

export default function ImageUpload({ onClose }: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productName, setProductName] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    loadExistingImages();
  }, []);

  const loadExistingImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      if (data.images) {
        setExistingImages(data.images);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    setIsLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles([...files, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imagePath: string) => {
    if (!confirm('Supprimer cette image ?')) return;

    try {
      const response = await fetch(`/api/images?path=${encodeURIComponent(imagePath)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setExistingImages(existingImages.filter(img => img !== imagePath));
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Veuillez sélectionner au moins une image');
      return;
    }

    if (!productName.trim() || !color.trim()) {
      alert('Veuillez entrer le nom du produit et la couleur');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('productName', productName);
      formData.append('color', color);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`${data.paths.length} image(s) uploadée(s) avec succès !`);
        setFiles([]);
        setProductName('');
        setColor('');
        loadExistingImages();
      } else {
        alert('Erreur: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'upload');
    }

    setIsUploading(false);
  };

  const filteredImages = existingImages.filter(img => 
    img.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-gray-900">Gestion des images</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section Upload */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Uploader de nouvelles images</h3>
            
            {/* Infos produit pour l'upload */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-600 focus:outline-none"
                  placeholder="Crocs Classic, Bape x Crocs..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-600 focus:outline-none"
                  placeholder="Blanc, Noir, Blue Camo..."
                />
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                Glissez vos images ici ou
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold cursor-pointer hover:bg-gray-800 transition-all">
                <Upload className="h-4 w-4" />
                Sélectionner
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Files Preview */}
            {files.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-900 mb-3">
                  {files.length} image{files.length > 1 ? 's' : ''} prête{files.length > 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {files.map((file, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !productName.trim() || !color.trim()}
                  className="mt-4 w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Upload en cours...' : `Uploader ${files.length} image${files.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </div>

          {/* Section Images existantes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Images existantes ({existingImages.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-600">Chargement...</div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Aucune image trouvée' : 'Aucune image dans le dossier'}
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
                {filteredImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeleteExistingImage(image)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                      {image.split('/').pop()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
