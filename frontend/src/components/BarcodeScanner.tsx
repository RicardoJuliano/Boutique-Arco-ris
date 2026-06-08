import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopControls: (() => void) | null = null;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err, controls) => {
        if (result) {
          stopControls = () => controls.stop();
          setScanning(false);
          onScan(result.getText());
          controls.stop();
          onClose();
        }
        // ignorar erros de frame sem barcode — são esperados durante o scan contínuo
        if (err && !(err.name === 'NotFoundException')) {
          setError('Erro ao acessar câmera: ' + err.message);
        }
      })
      .catch((e: Error) => {
        setError('Câmera indisponível. Verifique as permissões do navegador. ' + e.message);
      });

    return () => {
      stopControls?.();
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-bg border border-border w-full max-w-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg font-light text-cream">Escanear código de barras</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-cream transition-colors text-xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error ? (
            <p className="error-msg">{error}</p>
          ) : (
            <>
              <div className="relative aspect-[4/3] bg-black overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {/* mira central */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-24 border-2 border-gold/70 relative">
                    <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-gold" />
                    <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-gold" />
                    <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-gold" />
                    <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-gold" />
                  </div>
                </div>
              </div>
              {scanning && (
                <p className="font-body text-sm text-muted text-center">
                  Aponte a câmera para o código de barras
                </p>
              )}
            </>
          )}

          <button type="button" onClick={onClose} className="btn-gold btn-outline w-full">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
