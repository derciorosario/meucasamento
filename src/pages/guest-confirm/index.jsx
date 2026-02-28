import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { confirmInvitation } from '../../api/client';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function GuestConfirm() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const responseParam = searchParams.get('response');
  
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleConfirmation = async () => {
      if (!token) {
        setError('Token não fornecido');
        setProcessing(false);
        return;
      }

      // If response is already in URL params, auto-submit
      if (responseParam === 'confirm' || responseParam === 'decline') {
        try {
          const response = await confirmInvitation(token, responseParam);
          setResult(response.data);
          toast.success(response.data.message);
        } catch (err) {
          const errorMsg = err.response?.data?.message || 'Erro ao processar confirmação';
          setError(errorMsg);
          toast.error(errorMsg);
        } finally {
          setProcessing(false);
        }
      } else {
        setProcessing(false);
      }
    };

    handleConfirmation();
  }, [token, responseParam]);

  const handleConfirm = async (response) => {
    setProcessing(true);
    setError('');
    
    try {
      const res = await confirmInvitation(token, response);
      setResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erro ao processar confirmação';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processando...</p>
        </div>
      </div>
    );
  }

  // Already confirmed state
  if (result) {
    return (
       <> 
         <Header/>
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {result.guest?.status === 'confirmed' ? 'Presença Confirmada!' : 'Resposta Registrada'}
          </h1>
          <p className="text-gray-600 mb-6">
            {result.message}
          </p>
          <p className="text-sm text-gray-500">
            Nome: {result.guest?.name}
          </p>
        </div>
      </div>
        <Footer/>
       </>
    );
  }

  // Ask for confirmation
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f3] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#9CAF88] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Você está convidado!</h1>
          <p className="text-gray-600 mt-2">
            Por favor, confirme sua presença no casamento.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleConfirm('confirm')}
            disabled={processing}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ✅ Confirmar Presença
          </button>
          
          <button
            onClick={() => handleConfirm('decline')}
            disabled={processing}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            ❌ Não Poderei Ir
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Você recebeu este convite por email.
        </p>
      </div>
    </div>
  );
}
