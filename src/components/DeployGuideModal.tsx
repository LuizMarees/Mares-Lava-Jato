import React, { useState } from "react";
import { X, Github, Cloud, Download, Upload, Trash2, Check, Copy } from "lucide-react";

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => void;
  onClearDayData: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
  onExportBackup,
  onImportBackup,
  onClearDayData,
}) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [importText, setImportText] = useState("");
  const [showImportArea, setShowImportArea] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 1500);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    onImportBackup(importText.trim());
    setShowImportArea(false);
    setImportText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-blue-700 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
              Deploy Railway & Gestão de Dados
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white bg-blue-800 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Section: Railway Deploy Guide */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-blue-900 text-sm uppercase flex items-center gap-2 border-b border-slate-200 pb-2">
              <Github className="w-4 h-4 text-slate-700" />
              Como colocar no GitHub e subir no Railway (Passo a Passo)
            </h4>

            <ol className="space-y-3 list-decimal list-inside font-medium text-xs sm:text-sm text-slate-700">
              <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">1. Subir o projeto para o GitHub:</span>
                <p className="text-slate-600 mt-1">
                  Crie um novo repositório no seu GitHub (ex: <code>mares-lava-jato</code>). Baixe os arquivos do app e rode os comandos no seu terminal:
                </p>
                <div className="mt-2 bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px] flex justify-between items-center">
                  <code>git init && git add . && git commit -m "Mares Lava Jato"</code>
                  <button
                    onClick={() =>
                      copyToClipboard("git init && git add . && git commit -m \"Mares Lava Jato\"", 1)
                    }
                    className="text-xs text-blue-400 hover:text-blue-300 ml-2"
                  >
                    {copiedStep === 1 ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>

              <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">2. Conectar ao Railway:</span>
                <p className="text-slate-600 mt-1">
                  Acesse <a href="https://railway.app" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">railway.app</a>, faça login com o GitHub, clique em <strong>New Project</strong> → <strong>Deploy from GitHub repo</strong> e selecione o repositório <code>mares-lava-jato</code>.
                </p>
              </li>

              <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">3. Configurar Variável de Porta (Opcional):</span>
                <p className="text-slate-600 mt-1">
                  O Railway detecta o <code>package.json</code> e roda automaticamente <code>npm run build</code> e <code>npm start</code>. Nas variáveis do projeto, garanta que a porta <code>PORT=3000</code> está liberada ou o Railway atribuirá dinamicamente.
                </p>
              </li>
            </ol>
          </div>

          {/* Section: Backup and Persistence */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-blue-900 text-sm uppercase flex items-center gap-2 border-b border-slate-200 pb-2">
              <Download className="w-4 h-4 text-emerald-600" />
              Backup & Dados Locais
            </h4>

            <p className="text-xs text-slate-600">
              Seus registros ficam salvos no banco de dados do servidor e sincronizados com o navegador. Você pode baixar um backup em JSON ou restaurar a qualquer momento.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onExportBackup}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup (JSON)</span>
              </button>

              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restaurar Backup</span>
              </button>

              <button
                onClick={onClearDayData}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Limpar Dados de Hoje</span>
              </button>
            </div>

            {showImportArea && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block text-xs font-bold text-slate-700">Cole o conteúdo do backup JSON:</label>
                <textarea
                  rows={3}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"washes": [...], "expenses": [...]}'
                  className="w-full p-2 text-xs font-mono bg-white border border-slate-300 rounded outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowImportArea(false)}
                    className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImportSubmit}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                  >
                    Restaurar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-700 hover:bg-blue-800 text-white font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
