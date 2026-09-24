import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Carregado dinamicamente porque a biblioteca acessa `document`/`navigator`
// diretamente — evita problemas em qualquer cenário de server-side rendering
// e mantém o bundle inicial menor.
let Html5QrcodeClassPromise = null;
function loadHtml5Qrcode() {
  if (!Html5QrcodeClassPromise) {
    Html5QrcodeClassPromise = import("html5-qrcode").then((mod) => mod.Html5Qrcode);
  }
  return Html5QrcodeClassPromise;
}

const SCANNER_ELEMENT_ID = "qr-scanner-viewport";

export default function QrScannerModal({ open, onClose, onScan }) {
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    hasScannedRef.current = false;
    let cancelled = false;

    loadHtml5Qrcode().then((Html5Qrcode) => {
      if (cancelled) return;

      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Só processa a primeira leitura — a câmera continua mandando
            // frames enquanto a gente ainda está fechando o scanner.
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;
            onScan(decodedText);
          },
          () => {
            // erro de leitura de frame individual — normal e frequente
            // enquanto o QR ainda não está enquadrado, não precisa tratar
          }
        )
        .catch((err) => {
          console.error("[qr-scanner] não foi possível iniciar a câmera:", err);
        });
    });

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
            // já parado ou nunca chegou a iniciar — sem problema
          });
      }
    };
  }, [open, onScan]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="qr-scanner-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="card__title">Aponte para o QR Code da nota</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="qr-scanner-body">
          <div id={SCANNER_ELEMENT_ID} className="qr-scanner-viewport" />
          <p className="card__subtitle" style={{ textAlign: "center", marginTop: 12 }}>
            Geralmente fica no rodapé do cupom fiscal
          </p>
        </div>
      </div>
    </div>
  );
}
