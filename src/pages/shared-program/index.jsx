import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedProgram } from '../../api/client';
import { Clock, User, MapPin, Heart, Loader2, Calendar, Share2, Printer, QrCode, Download, Copy, X, Image } from 'lucide-react';
import { toast } from '../../lib/toast';

const SharedProgram = () => {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadProgram = async () => {
      try {
        setLoading(true);
        const response = await getSharedProgram(shareCode);
        
        if (response.data.success) {
          setProgram(response.data.data);
        } else {
          setError('Programa não encontrado');
        }
      } catch (err) {
        console.error('Error loading program:', err);
        setError('Erro ao carregar o programa');
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [shareCode]);

  // Calculate timeline sorted by start time
  const calculateTimeline = () => {
    if (!program?.sectionsArray) return [];
    
    const allActivities = [];
    
    program.sectionsArray.forEach((section) => {
      if (section.activities) {
        section.activities.forEach(activity => {
          if (activity.startTime) {
            allActivities.push({
              ...activity,
              sectionTitle: section.title,
            });
          }
        });
      }
    });
    
    // Sort by start time
    allActivities.sort((a, b) => {
      const timeA = a.startTime.replace(':', '');
      const timeB = b.startTime.replace(':', '');
      return parseInt(timeA) - parseInt(timeB);
    });
    
    return allActivities;
  };

  // Get share link
  const getShareLink = () => {
    return `${window.location.origin}/program/shared/${shareCode}`;
  };

  // Get QR code URL
  const getQRCodeUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getShareLink())}`;
  };

  // Copy link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(getShareLink());
    toast.success('Link copiado para a área de transferência!');
  };

  // Download QR code
  const downloadQRCode = async () => {
    const url = getQRCodeUrl();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `qrcode-programa.png`;
      link.click();
      window.URL.revokeObjectURL(link.href);
      toast.success('QR Code descargado com sucesso');
    } catch (err) {
      console.error('Error downloading QR code:', err);
      toast.error('Erro ao descargar QR Code');
    }
  };

  // Print program
  const printProgram = () => {
    window.print();
  };

  const timeline = calculateTimeline();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center p-8">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Ops!</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
            Programa do Casamento
          </h1>
          {program?.userName && (
            <p className="text-gray-600">{program.userName}</p>
          )}
          
        {/* Action Buttons */}
<div className="flex flex-col sm:flex-row justify-center gap-3 mt-4 ignore_in_print w-full">
  <button
    onClick={printProgram}
    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
  >
    <Printer className="w-4 h-4" />
    Imprimir
  </button>

  <button
    onClick={() => setShowShareModal(true)}
    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors w-full sm:w-auto"
  >
    <Share2 className="w-4 h-4" />
    Compartilhar
  </button>

  {program?.userId && (
    <button
      onClick={() => navigate(`/profile/${program.userId}`)}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
    >
      <Image className="w-4 h-4" />
      Ver Fotos
    </button>
  )}
</div>



        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {timeline.map((activity, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-4">
                {/* Time */}
                <div className="w-16 flex-shrink-0 text-center">
                  <span className="text-lg font-bold text-primary-600">{activity.startTime}</span>
                  {activity.endTime && (
                    <>
                      <span className="text-gray-400 mx-1">-</span>
                      <span className="text-sm text-gray-600">{activity.endTime}</span>
                    </>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      {activity.sectionTitle}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{activity.title}</h3>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {activity.responsible && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {activity.responsible}
                      </span>
                    )}
                    {activity.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </span>
                    )}
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {timeline.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma atividade encontrada no programa.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 inline-block mb-4">
            <img 
              src={getQRCodeUrl()} 
              alt="QR Code" 
              className="w-24 h-24 mx-auto rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-2">Escaneie para ver o programa</p>
          </div>
          <p className="text-xs text-gray-400">
            Provided by <a href="https://meucasamento.co.mz" target="_blank" rel="noopener noreferrer" className="text-primary-500 font-medium hover:underline">meucasamento.co.mz</a>
          </p>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-black">Compartilhar Programa</h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <img 
                src={getQRCodeUrl()} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto rounded-lg"
              />
              <button
                onClick={downloadQRCode}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-600 rounded-lg hover:bg-primary-500/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar QR Code
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Escaneie o QR code ou use o link abaixo:
            </p>
            
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 mb-4">
              <input
                type="text"
                value={getShareLink()}
                readOnly
                className="flex-1 bg-transparent text-sm text-black px-2"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedProgram;
