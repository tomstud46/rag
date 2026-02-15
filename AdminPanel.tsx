
import React, { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Plus, Database, Info, File, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { vectorStore } from '../services/vectorStore';
import { KnowledgeDocument } from '../types';
import { getEmbedding } from '../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the worker source for PDF.js to a CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

interface UploadTask {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const AdminPanel: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>(vectorStore.getDocuments());
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async (title: string, content: string, taskId?: string) => {
    if (!title || !content) return;
    
    if (taskId) {
      setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'processing' } : t));
    } else {
      setIsProcessing(true);
    }

    try {
      const embedding = await getEmbedding(content);
      
      const newDoc: KnowledgeDocument = {
        id: 'doc_' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: title,
        content: content,
        embedding,
        createdAt: Date.now(),
      };

      vectorStore.addDocument(newDoc);
      setDocs(vectorStore.getDocuments());
      
      if (taskId) {
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      } else {
        setNewTitle('');
        setNewContent('');
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Error adding document:", error);
      if (taskId) {
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', error: 'Embedding failed' } : t));
      } else {
        alert("Failed to process document embeddings.");
      }
    } finally {
      if (!taskId) setIsProcessing(false);
    }
  };

  const handleDelete = (id: string) => {
    vectorStore.deleteDocument(id);
    setDocs(vectorStore.getDocuments());
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // @ts-ignore - items property exists on TextContent
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error("Failed to extract text from PDF.");
    }
  };

  const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (error) {
      console.error("Docx extraction error:", error);
      throw new Error("Failed to extract text from Word document.");
    }
  };

  const extractTextFromHTML = (html: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove scripts and styles
      const scripts = doc.querySelectorAll('script, style');
      scripts.forEach(s => s.remove());
      
      return doc.body.textContent?.trim() || "";
    } catch (error) {
      console.error("HTML extraction error:", error);
      throw new Error("Failed to parse HTML content.");
    }
  };

  const processFile = async (file: File) => {
    const taskId = 'task_' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const title = file.name.replace(/\.[^/.]+$/, "");
    
    const newTask: UploadTask = { id: taskId, name: file.name, status: 'pending' };
    setUploadTasks(prev => [newTask, ...prev]);

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        if (text) {
          await handleAdd(title, text, taskId);
        } else {
          throw new Error("No text found in PDF.");
        }
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromDocx(arrayBuffer);
        if (text) {
          await handleAdd(title, text, taskId);
        } else {
          throw new Error("No text found in Word document.");
        }
      } else if (file.type === "text/html" || file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        const html = await file.text();
        const text = extractTextFromHTML(html);
        if (text) {
          await handleAdd(title, text, taskId);
        } else {
          throw new Error("No text found in HTML file.");
        }
      } else if (file.type === "text/plain" || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const text = await file.text();
        if (text) {
          await handleAdd(title, text, taskId);
        } else {
          throw new Error("File is empty.");
        }
      } else {
        throw new Error("Unsupported file type.");
      }
    } catch (error: any) {
      console.error("File processing error:", error);
      setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', error: error.message } : t));
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setIsProcessing(true);
    const fileArray = Array.from(files);
    
    // Process files concurrently
    await Promise.all(fileArray.map(file => processFile(file)));
    
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const clearCompletedTasks = () => {
    setUploadTasks(prev => prev.filter(t => t.status !== 'completed' && t.status !== 'error'));
  };

  const hasTasks = uploadTasks.length > 0;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="text-[#4ade80]" /> Knowledge Base
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage documents that your AI chatbot uses for answers.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".txt,.md,.pdf,.docx,.html,.htm"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <Upload size={20} /> Upload Files
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            disabled={isProcessing}
            className="bg-[#4ade80] text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm disabled:opacity-50"
          >
            <Plus size={20} /> Manual Entry
          </button>
        </div>
      </div>

      <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 p-5 rounded-2xl mb-8 flex gap-4 text-emerald-900 dark:text-emerald-100">
        <div className="bg-white dark:bg-slate-800 p-2 rounded-xl h-fit text-[#4ade80] shadow-sm">
          <Info size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold">Broad Document Support</p>
          <p className="text-xs opacity-80 mt-1 leading-relaxed">
            Upload PDFs, Word documents (.docx), HTML pages, or text files. Our system intelligently extracts content to provide accurate AI responses.
          </p>
        </div>
      </div>

      {/* Upload Tasks Queue */}
      {hasTasks && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Upload Queue</h3>
            <button 
              onClick={clearCompletedTasks}
              className="text-xs font-semibold text-[#4ade80] hover:brightness-125 transition-colors"
            >
              Clear Finished
            </button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {uploadTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {task.status === 'pending' && <Loader2 className="text-slate-400 animate-spin" size={18} />}
                    {task.status === 'processing' && <Loader2 className="text-[#4ade80] animate-spin" size={18} />}
                    {task.status === 'completed' && <CheckCircle2 className="text-emerald-500" size={18} />}
                    {task.status === 'error' && <AlertCircle className="text-red-500" size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{task.name}</p>
                    {task.error && <p className="text-[10px] text-red-500 font-medium">{task.error}</p>}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    task.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                    task.status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                    'bg-[#4ade80]/10 text-[#4ade80]'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      {!isAdding && (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all mb-8 ${
            dragActive ? 'border-[#4ade80] bg-[#4ade80]/5 dark:bg-[#4ade80]/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:text-[#4ade80] transition-colors">
            <Upload size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Drag & Drop Documents</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Support for .pdf, .docx, .html, .txt, .md</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[#4ade80] font-bold hover:underline"
          >
            Browse files from your computer
          </button>
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
              <FileText className="text-[#4ade80]" size={24} /> 
              Manual Document Entry
            </h2>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Document Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Return Policy 2024"
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#4ade80] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Knowledge Content</label>
              <textarea 
                rows={8}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Paste the detailed information here..."
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#4ade80] outline-none transition-all resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAdd(newTitle, newContent)}
                disabled={isProcessing || !newTitle || !newContent}
                className="bg-[#4ade80] text-black px-8 py-3 rounded-2xl font-black hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : null}
                {isProcessing ? 'Processing...' : 'Add to Knowledge'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <File className="text-slate-300 dark:text-slate-600" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empty Library</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">Your AI doesn't have any custom knowledge yet. Upload a PDF, DOCX, HTML or TXT file to get started.</p>
          </div>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group relative flex flex-col">
              <button 
                onClick={() => handleDelete(doc.id)}
                className="absolute top-6 right-6 text-slate-300 dark:text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
              >
                <Trash2 size={18} />
              </button>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-[#4ade80] w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#4ade80] group-hover:text-black transition-colors">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 truncate pr-10">{doc.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed flex-grow">{doc.content}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-[#4ade80] bg-emerald-50 dark:bg-emerald-900/50 px-2 py-1 rounded-md">RAG INDEXED</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
