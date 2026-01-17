import React, { useState, useRef, useEffect } from 'react';
import { chatWithKurdAIStream } from '../services/geminiService';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  timestamp: Date;
}

const Agent: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentThinking, setAgentThinking] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [tasks, agentThinking]);

  const executeTask = async (taskDescription: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      description: taskDescription,
      status: 'pending',
      timestamp: new Date()
    };

    setTasks(prev => [...prev, newTask]);
    setTaskInput('');
    setIsProcessing(true);

    try {
      // Update task status to running
      setTasks(prev => prev.map(t => 
        t.id === newTask.id ? { ...t, status: 'running' } : t
      ));

      const agentPrompt = `تۆ ئەیجێنتێکی زیرەک و توانایی بەجێگەیاندنی ئەرکەکانت. ئەرکی دراو: ${taskDescription}

تکایە بە وردی بیشکۆیەوە و وەڵامێکی تەواو و بەکەڵک بدەرەوە. ئەگەر ئەرکەکە پێویستی بە چەند هەنگاوێک هەیە، بەشێوەیەکی ڕێکوپێک ڕوونی بکەرەوە.`;

      setAgentThinking('خەریکی شیکاری و پڕۆسێسکردنی ئەرکەکە...');

      const stream = await chatWithKurdAIStream(agentPrompt, []);
      
      let fullResult = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResult += chunk.text;
          setAgentThinking(fullResult);
        }
      }

      // Update task with result
      setTasks(prev => prev.map(t => 
        t.id === newTask.id 
          ? { ...t, status: 'completed', result: fullResult } 
          : t
      ));

      setAgentThinking('');
      
    } catch (error) {
      console.error("Agent Error:", error);
      setTasks(prev => prev.map(t => 
        t.id === newTask.id 
          ? { ...t, status: 'failed', result: 'هەڵەیەک لە جێبەجێکردنی ئەرکەکە ڕوویدا' } 
          : t
      ));
      setAgentThinking('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!taskInput.trim() || isProcessing) return;
    executeTask(taskInput);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '⚙️';
      case 'completed': return '✅';
      case 'failed': return '❌';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'text-slate-500';
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">
          ئەیجێنتی <span className="text-purple-500">زیرەک</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] font-['Noto_Sans_Arabic']">
          ئەیجێنتی ژیرە بۆ جێبەجێکردنی ئەرک و چارەسەرکردنی کێشەکان
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Task Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-8 rounded-[3rem] border border-white/5 shadow-2xl bg-[#050507] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-['Noto_Sans_Arabic']">پانێڵی ئەرک</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Task Assignment Panel</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] px-4">
                  وەسفی ئەرکەکە
                </label>
                <textarea 
                  value={taskInput} 
                  onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                  className="w-full h-48 bg-white/[0.02] p-6 rounded-[2rem] text-white text-lg border border-white/5 font-['Noto_Sans_Arabic'] focus:border-purple-500/30 outline-none transition-all resize-none shadow-inner placeholder:opacity-20"
                  placeholder="بۆ نموونە: لیستێک دروست بکە لە باشترین شوێنە گەشتیاریەکانی کوردستان..."
                  disabled={isProcessing}
                />
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={isProcessing || !taskInput.trim()}
                className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black text-base uppercase tracking-[0.2em] font-['Noto_Sans_Arabic'] shadow-2xl shadow-purple-600/20 hover:bg-purple-500 disabled:opacity-20 transition-all active:scale-95"
              >
                {isProcessing ? 'خەریکی جێبەجێکردنە...' : 'دەستپێکردنی ئەرک'}
              </button>

              {/* Agent Stats */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
                <div className="text-center p-4 bg-white/[0.02] rounded-2xl">
                  <div className="text-2xl font-black text-green-500">{tasks.filter(t => t.status === 'completed').length}</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">تەواو</div>
                </div>
                <div className="text-center p-4 bg-white/[0.02] rounded-2xl">
                  <div className="text-2xl font-black text-blue-500">{tasks.filter(t => t.status === 'running').length}</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">جێبەجێکراو</div>
                </div>
                <div className="text-center p-4 bg-white/[0.02] rounded-2xl">
                  <div className="text-2xl font-black text-slate-500">{tasks.length}</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">گشتی</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task History Panel */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-[3rem] flex flex-col overflow-hidden bg-black/40 border border-white/5 shadow-2xl h-[700px]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-lg font-black text-white font-['Noto_Sans_Arabic']">مێژووی ئەرکەکان</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Execution History</p>
                </div>
              </div>
              <button 
                onClick={() => setTasks([])} 
                className="text-[9px] font-black text-slate-700 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                پاککردنەوە
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
              {tasks.length === 0 && !agentThinking && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-lg font-black text-white font-['Noto_Sans_Arabic']">هێشتا هیچ ئەرکێک دیاری نەکراوە</p>
                  <p className="text-xs text-slate-600 mt-2 font-['Noto_Sans_Arabic']">ئەرکێک زیاد بکە بۆ دەستپێکردن</p>
                </div>
              )}

              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getStatusIcon(task.status)}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusColor(task.status)}`}>
                          {task.status === 'pending' && 'چاوەڕوان'}
                          {task.status === 'running' && 'جێبەجێکراو'}
                          {task.status === 'completed' && 'تەواوبووە'}
                          {task.status === 'failed' && 'شکستی هێنا'}
                        </span>
                      </div>
                      <p className="text-white font-bold text-base font-['Noto_Sans_Arabic'] leading-relaxed">
                        {task.description}
                      </p>
                      <p className="text-[8px] text-slate-600 mt-2">
                        {task.timestamp.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {task.result && (
                    <div className="pt-4 border-t border-white/5">
                      <div className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-3 font-['Noto_Sans_Arabic']">
                        ئەنجام
                      </div>
                      <div className="text-slate-300 font-['Noto_Sans_Arabic'] leading-[2] text-sm text-justify whitespace-pre-wrap">
                        {task.result}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {agentThinking && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-3xl p-6 animate-pulse">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl animate-spin">⚙️</span>
                    <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">
                      ئەیجێنت خەریکی کارکردنە...
                    </span>
                  </div>
                  <div className="text-slate-300 font-['Noto_Sans_Arabic'] leading-[2] text-sm text-justify whitespace-pre-wrap">
                    {agentThinking}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-4xl mx-auto p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl flex gap-4 items-center">
        <span className="text-3xl">💡</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-purple-300 leading-relaxed font-['Noto_Sans_Arabic']">
            ئەیجێنتی زیرەک دەتوانێت ئەرکە جۆراوجۆرەکان جێبەجێ بکات، لە شیکاری داتاوە تا دروستکردنی لیست و پلان و چارەسەرکردنی کێشەکان.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Agent;
