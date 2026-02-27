import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onSave }) => {
  const [taskTitle, setTaskTitle] = useState('Visitar segunda opção de salão');
  const [selectedCategory, setSelectedCategory] = useState('Salão');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [addToBudget, setAddToBudget] = useState(true);

  const categories = [
    'Salão',
    'Registro Civil',
    'Lua de Mel',
    'Vestido & Traje',
    'Música & DJ',
    'Fotografia & Vídeo',
    'Outros'
  ];

  const handleSave = () => {
    onSave({
      title: taskTitle,
      category: selectedCategory,
      addToBudget
    });
    onClose();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 animate-modalIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-serif text-gray-800">Criar nova Tarefa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-5">
          {/* Task Title Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Título da tarefa
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Digite o título da tarefa"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Categoria
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-gray-700">{selectedCategory}</span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden animate-fadeIn">
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        category === selectedCategory ? 'bg-primary-500 bg-opacity-20' : ''
                      } ${index !== categories.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <span className={`${category === selectedCategory ? 'text-gray-800 font-medium' : 'text-gray-700'}`}>
                        {category}
                      </span>
                      {category === selectedCategory && (
                        <Check className="w-5 h-5 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add to Budget Checkbox */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={addToBudget}
                  onChange={(e) => setAddToBudget(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  addToBudget 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'bg-white border-gray-300 group-hover:border-primary-500'
                }`}>
                  {addToBudget && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-gray-700">Adicionar automaticamente ao orçamento</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Salvar tarefa
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-3 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-modalIn {
          animation: modalIn 0.2s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateTaskModal;