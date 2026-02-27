import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    ShieldCheck,
    Heart,
    Zap,
    BrainCircuit,
    FileText,
    Settings,
    Bell,
    Search,
    Upload,
    ArrowRight,
    ChevronRight,
    Info,
    CheckCircle2,
    Download,
    Calendar,
    TrendingUp,
    PieChart,
    Lock,
    Sparkles,
    Send,
    X as CloseIcon
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group relative border-r-2 ${active ? 'text-white border-brandBlue bg-brandBlue/5' : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
    >
        <Icon size={18} className={active ? 'text-brandBlue' : 'group-hover:text-slate-300'} />
        <span className="text-[13px] font-medium">{label}</span>
    </div>
);

const StatCard = ({ label, value, subtext, statusColor = "text-brandGreen", icon: Icon }) => (
    <div className="bg-[#151B28] border border-slate-800/40 p-6 rounded-2xl relative overflow-hidden group hover:bg-[#1A2234] transition-all">
        <div className="flex justify-between items-start mb-6">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</div>
            {Icon && (
                <div className="text-slate-600 group-hover:text-brandBlue transition-colors">
                    <Icon size={16} />
                </div>
            )}
        </div>
        <div className={`text-3xl font-bold mb-2 tracking-tight ${statusColor}`}>{value || "0"}</div>
        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">{subtext}</div>
    </div>
);

const TimelineStep = ({ month, title, description, amount, icon: Icon, color }) => (
    <div className="flex gap-6 relative group">
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white z-10 shadow-lg`}>
                <Icon size={18} />
            </div>
            <div className="w-px h-full bg-slate-800 absolute top-10 group-last:hidden"></div>
        </div>
        <div className="bg-[#151B28] border border-slate-800/40 p-6 rounded-2xl flex-1 mb-8 hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-brandBlue uppercase tracking-widest">{month}</span>
                <span className={`text-[12px] font-bold text-brandGreen`}>₹{amount}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-2">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg">{description}</p>
        </div>
    </div>
);

function App() {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I can help you optimize your taxes. Try asking me about Section 80C investments or regime comparison.' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, showChat]);

    const [profile, setProfile] = useState({
        name: 'Akhil', salary: 1200000, age: 28, risk_appetite: 'moderate', financial_year: '2024-25'
    });

    // Simulator State
    const [sim80C, setSim80C] = useState(90000);
    const [sim80D, setSim80D] = useState(15000);
    const [simNPS, setSimNPS] = useState(25000);
    const [simGrowth, setSimGrowth] = useState(8);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_profile", JSON.stringify(profile));
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            alert("Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/v1/chat", {
                message: userMsg,
                history: messages,
                user_context: results ? {
                    salary: profile.salary,
                    age: profile.age,
                    tax_analysis: results.tax_analysis
                } : null
            });

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't reach the server. Please ensure the backend is running and you have a valid API key." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold mb-1 tracking-tight text-white">Good morning, Akhil</h1>
                <p className="text-slate-500 text-[13px]">Here's your tax optimization overview for FY 2024-25</p>
            </div>

            <div className="bg-[#1C1616] border border-red-900/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500"><Info size={20} /></div>
                    <div>
                        <div className="text-sm font-bold text-red-500">March Panic Alert</div>
                        <div className="text-xs text-red-500/60 font-medium">Risk of last-minute tax panic investing detected. 80C is only 35% utilized.</div>
                    </div>
                </div>
                <button onClick={() => setActiveTab('Tax Optimizer')} className="bg-red-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2">
                    Optimize Now <ArrowRight size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="TAX SAVED"
                    value={results?.tax_analysis?.savings ? `₹${results.tax_analysis.savings.toLocaleString()}` : "₹84,500"}
                    subtext="This financial year"
                    statusColor="text-brandGreen"
                    icon={TrendingUp}
                />

                <div className="bg-[#151B28] border border-slate-800/40 p-6 rounded-2xl flex justify-between relative shadow-sm">
                    <div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">TAX EFFICIENCY SCORE</div>
                        <div className="text-3xl font-bold mb-2 tracking-tight text-brandBlue">
                            {results?.tax_analysis?.health_metrics?.score ?? "62"}/100
                        </div>
                        <div className="text-slate-600 text-[10px] uppercase font-bold tracking-tighter">Room for improvement</div>
                    </div>
                    <div className="w-12 h-12">
                        <Doughnut data={{ datasets: [{ data: [results?.tax_analysis?.health_metrics?.score ?? 62, 100 - (results?.tax_analysis?.health_metrics?.score ?? 62)], backgroundColor: ['#3B82F6', '#1E293B'], borderWidth: 0 }] }} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                <StatCard
                    label="SAVINGS GAP"
                    value={results?.tax_analysis?.deductions?.['80C'] ? `₹${(150000 - results.tax_analysis.deductions['80C'].allowed).toLocaleString()}` : "₹65,500"}
                    subtext="Remaining to optimize"
                    statusColor="text-yellow-500"
                />

                <StatCard
                    label="RECOMMENDED REGIME"
                    value={results?.tax_analysis?.recommended ?? "Old Regime"}
                    subtext={results?.tax_analysis?.recommended ? `${results.tax_analysis.recommended} saves more` : "Old Regime saves more"}
                    statusColor="text-accentCyan"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#151B28] border border-slate-800/40 p-8 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-lg font-bold tracking-tight">Regime Comparison</h3>
                            <p className="text-xs text-slate-500 font-medium">Old vs New Tax Regime Analysis</p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0B0F19] p-1 rounded-lg">
                            <span className="text-[10px] font-bold px-3 py-1.5 text-slate-400 uppercase">Old Regime</span>
                            <div className="w-8 h-4 bg-slate-800 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                            <span className="text-[10px] font-bold px-3 py-1.5 text-slate-600 uppercase">New Regime</span>
                        </div>
                    </div>
                    <div className="h-72">
                        <Bar data={{
                            labels: ['Gross Income', 'Deductions', 'Taxable', 'Tax Payable'],
                            datasets: [
                                { label: 'Old', data: results?.tax_analysis ? [results.tax_analysis.income, 200000, results.tax_analysis.old_regime.taxable_income, results.tax_analysis.old_regime.tax] : [1200000, 200000, 1000000, 100000], backgroundColor: '#3B82F6', borderRadius: 4, barThickness: 24 },
                                { label: 'New', data: results?.tax_analysis ? [results.tax_analysis.income, 75000, results.tax_analysis.new_regime.taxable_income, results.tax_analysis.new_regime.tax] : [1200000, 75000, 1125000, 75000], backgroundColor: '#0F766E', borderRadius: 4, barThickness: 24 }
                            ]
                        }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#1E293B', display: true, drawBorder: false }, ticks: { color: '#475569', font: { size: 10 } } }, x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10, weight: 'bold' } } } }, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                <div className="bg-[#151B28] border border-slate-800/40 p-8 rounded-3xl flex flex-col items-center shadow-sm">
                    <h3 className="text-lg font-bold w-full mb-10 text-left">Financial Health Score</h3>
                    <div className="relative w-44 h-44 mb-10">
                        <Doughnut data={{ datasets: [{ data: [results?.tax_analysis?.health_metrics?.score ?? 62, 100 - (results?.tax_analysis?.health_metrics?.score ?? 62)], backgroundColor: ['#3B82F6', '#1E293B'], borderWidth: 0 }] }} options={{ cutout: '82%', plugins: { legend: { display: false } } }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-4xl font-black">{results?.tax_analysis?.health_metrics?.score ?? "62"}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase mt-2">out of 100</div>
                        </div>
                    </div>
                    <div className="w-full space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold"><span className="text-slate-400 uppercase">80C Utilization</span><span className="text-slate-300">{results?.tax_analysis?.health_metrics?.utilization_80c?.toFixed(0) ?? "72"}%</span></div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-brandBlue" style={{ width: `${results?.tax_analysis?.health_metrics?.utilization_80c ?? 72}%` }}></div></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold"><span className="text-slate-400 uppercase">80D Coverage</span><span className="text-slate-300">{results?.tax_analysis?.health_metrics?.utilization_80d?.toFixed(0) ?? "45"}%</span></div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-accentCyan" style={{ width: `${results?.tax_analysis?.health_metrics?.utilization_80d ?? 45}%` }}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTaxOptimizer = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-[#151B28] border border-slate-800/40 p-8 rounded-[40px] shadow-sm">
                <h3 className="text-lg font-bold mb-8">Monthly Income vs Expenses</h3>
                <div className="h-80">
                    <Line data={{
                        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                        datasets: [
                            { label: 'Income', data: [95, 95, 98, 105, 105, 108, 105, 108, 112, 112, 112, 115], borderColor: '#3B82F6', tension: 0.4, fill: true, backgroundColor: 'rgba(59,130,246,0.1)', pointRadius: 0 },
                            { label: 'Expenses', data: [65, 62, 70, 68, 62, 72, 65, 75, 72, 70, 72, 75], borderColor: '#06B6D4', tension: 0.4, fill: true, backgroundColor: 'rgba(6,182,212,0.1)', pointRadius: 0 }
                        ]
                    }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#1E293B' }, ticks: { color: '#666', callback: v => `${v}K` } }, x: { grid: { display: false }, ticks: { color: '#666' } } }, plugins: { legend: { display: false } } }} />
                </div>
            </div>
            <div className="bg-[#151B28] border border-slate-800/40 p-8 rounded-[40px] shadow-sm">
                <h3 className="text-lg font-bold mb-8">Savings Rate Trend</h3>
                <div className="h-80">
                    <Line data={{
                        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                        datasets: [{ label: 'Savings Rate', data: [38, 42, 30, 40, 48, 35, 45, 32, 43, 48, 45, 42], borderColor: '#10B981', tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10B981', fill: false }]
                    }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#1E293B' }, ticks: { color: '#666', callback: v => `${v}%` } }, x: { grid: { display: false }, ticks: { color: '#666' } } }, plugins: { legend: { display: false } } }} />
                </div>
            </div>
        </div>
    );

    const renderWhatIf = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold mb-1 tracking-tight text-white">What-If Simulator</h1>
                <p className="text-slate-500 text-[13px]">Adjust your investments and see real-time tax impact</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#151B28] border border-slate-800/40 p-10 rounded-[40px] space-y-12 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Investment Controls</h3>
                    <div className="space-y-10">
                        <div>
                            <div className="flex justify-between mb-4"><span className="text-sm font-medium text-slate-300">80C Investment</span><span className="font-bold text-white text-lg">₹{sim80C.toLocaleString()}</span></div>
                            <input type="range" min="0" max="150000" step="5000" value={sim80C} onChange={(e) => setSim80C(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-brandBlue cursor-pointer" />
                            <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase"><span>₹0</span><span>₹1,50,000</span></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-4"><span className="text-sm font-medium text-slate-300">80D Insurance</span><span className="font-bold text-white text-lg">₹{sim80D.toLocaleString()}</span></div>
                            <input type="range" min="0" max="50000" step="1000" value={sim80D} onChange={(e) => setSim80D(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-brandBlue cursor-pointer" />
                            <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase"><span>₹0</span><span>₹50,000</span></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-4"><span className="text-sm font-medium text-slate-300">NPS Contribution</span><span className="font-bold text-white text-lg">₹{simNPS.toLocaleString()}</span></div>
                            <input type="range" min="0" max="50000" step="5000" value={simNPS} onChange={(e) => setSimNPS(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-brandBlue cursor-pointer" />
                            <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase"><span>₹0</span><span>₹50,000</span></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-4"><span className="text-sm font-medium text-slate-300">Expected Salary Growth</span><span className="font-bold text-white text-lg">{simGrowth}%</span></div>
                            <input type="range" min="0" max="25" step="1" value={simGrowth} onChange={(e) => setSimGrowth(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-brandBlue cursor-pointer" />
                            <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase"><span>0%</span><span>25%</span></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#151B28] border border-slate-800/40 p-6 rounded-2xl flex flex-col justify-between">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">TAX SAVED (OLD)</div>
                            <div className="text-3xl font-bold text-brandGreen">₹39,000</div>
                        </div>
                        <div className="bg-[#151B28] border border-slate-800/40 p-6 rounded-2xl flex flex-col justify-between">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">TAX SAVED (NEW)</div>
                            <div className="text-3xl font-bold text-accentCyan">₹6,500</div>
                        </div>
                    </div>

                    <div className="bg-[#151B28] border border-slate-800/40 p-8 rounded-[32px] space-y-6 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SAVINGS GAP REMAINING</div>
                        <div className="text-4xl font-black text-yellow-500">₹1,20,000</div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brandBlue to-accentCyan" style={{ width: '60%' }}></div></div>
                        <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase"><span>Invested</span><span>₹2,50,000 limit</span></div>
                    </div>

                    <div className="bg-[#151B28] border border-slate-800/40 p-8 rounded-[32px] space-y-8 shadow-sm">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">INVESTMENT ALLOCATION</h4>
                        <div className="h-44">
                            <Bar data={{
                                labels: ['80C', '80D', 'NPS'],
                                datasets: [{ data: [sim80C, sim80D, simNPS], backgroundColor: ['#3B82F6', '#1E293B', '#334155'], borderRadius: 4, barThickness: 12 }]
                            }} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { display: false } }, y: { grid: { display: false }, ticks: { color: '#666', font: { size: 11, weight: 'bold' } } } } }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAIStrategy = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold mb-1 tracking-tight text-white">AI Strategy Plan</h1>
                <p className="text-slate-500 text-[13px]">Your personalized 6-month optimization blueprint</p>
            </div>
            <div className="max-w-4xl space-y-4">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">6-Month Optimization Timeline</h3>
                    <button className="flex items-center gap-2 text-[10px] font-black text-brandBlue uppercase tracking-widest"><Zap size={14} /> Regenerate Strategy</button>
                </div>
                <TimelineStep month="MONTH 1-2" title="Start SIP in ELSS" description="Begin a monthly SIP of ₹5,000 in a tax-saving ELSS fund for Section 80C benefits." amount="5,000/month" icon={TrendingUp} color="bg-brandBlue" />
                <TimelineStep month="MONTH 3" title="Buy Health Insurance" description="Secure comprehensive health coverage of ₹20,000 for Section 80D." amount="20,000" icon={ShieldCheck} color="bg-brandGreen" />
                <TimelineStep month="MONTH 4-6" title="Invest in PPF" description="Allocate ₹10,000 monthly to Public Provident Fund for safe returns." amount="10,000/month" icon={Zap} color="bg-accentCyan" />

                <div className="mt-20 pt-10 border-t border-slate-800/30">
                    <h3 className="text-lg font-bold mb-2 text-white">Future Tax Projection</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-10">3-year income growth and regime threshold</p>
                    <div className="h-64 bg-[#151B28] p-8 rounded-[40px] border border-slate-800/40">
                        <Line data={{ labels: ['Year 0', 'Year 1', 'Year 2'], datasets: [{ data: [1.2, 1.35, 1.55], borderColor: '#3B82F6', tension: 0.4 }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => `${v}M` } } } }} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderChatWindow = () => (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-10 w-[380px] h-[520px] bg-[#0B0F19] border border-slate-800/80 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-[100]"
        >
            {/* Header */}
            <div className="bg-[#111622] px-6 py-5 flex items-center justify-between border-b border-slate-800/40">
                <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-brandBlue" />
                    <span className="font-bold text-slate-100 tracking-tight">OPAX AI Assistant</span>
                </div>
                <div onClick={() => setShowChat(false)} className="text-slate-500 cursor-pointer hover:text-white transition-colors">
                    <CloseIcon size={18} />
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col pt-8 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-brandBlue/10 flex items-center justify-center mr-3 shrink-0 mt-1">
                                <Sparkles size={14} className="text-brandBlue" />
                            </div>
                        )}
                        <div className={`p-4 rounded-2xl max-w-[85%] text-[13px] leading-relaxed ${msg.role === 'user'
                                ? 'bg-brandBlue text-white rounded-tr-sm'
                                : 'bg-[#151B28] text-slate-300 border border-slate-800/50 rounded-tl-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-brandBlue/10 flex items-center justify-center mr-3 shrink-0 mt-1">
                            <Sparkles size={14} className="text-brandBlue" />
                        </div>
                        <div className="bg-[#151B28] border border-slate-800/50 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#111622] border-t border-slate-800/40">
                <div className="bg-[#0B0F19] border border-slate-800/80 rounded-2xl p-2 pl-5 flex items-center gap-3 shadow-inner">
                    <input
                        type="text"
                        placeholder="Ask about tax optimization..."
                        className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-200 placeholder:text-slate-600"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <div
                        onClick={handleSendMessage}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${chatInput.trim() ? 'bg-brandBlue cursor-pointer hover:bg-brandBlue/80' : 'bg-slate-800 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Send size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard': return renderDashboard();
            case 'Tax Optimizer': return renderTaxOptimizer();
            case 'What-If Simulator': return renderWhatIf();
            case 'AI Strategy Plan': return renderAIStrategy();
            default: return renderDashboard();
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0B0F19] text-slate-200 font-sans tracking-tight">
            <div className="w-64 border-r border-slate-800/50 flex flex-col pt-8 shrink-0 z-50 bg-[#0B0F19]">
                <div className="px-8 mb-12 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
                    <div className="w-10 h-10 bg-brandBlue rounded-xl flex items-center justify-center font-black text-white shadow-2xl shadow-brandBlue/30 text-lg italic">O</div>
                    <div>
                        <div className="font-black text-xl tracking-tighter leading-none uppercase">OPAX</div>
                        <div className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-1">OpenTax AI</div>
                    </div>
                </div>
                <nav className="flex-1 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
                    <SidebarItem icon={ShieldCheck} label="Tax Optimizer" active={activeTab === 'Tax Optimizer'} onClick={() => setActiveTab('Tax Optimizer')} />
                    <SidebarItem icon={Heart} label="Financial Health" active={activeTab === 'Financial Health'} onClick={() => setActiveTab('Financial Health')} />
                    <SidebarItem icon={Zap} label="What-If Simulator" active={activeTab === 'What-If Simulator'} onClick={() => setActiveTab('What-If Simulator')} />
                    <SidebarItem icon={BrainCircuit} label="AI Strategy Plan" active={activeTab === 'AI Strategy Plan'} onClick={() => setActiveTab('AI Strategy Plan')} />
                    <SidebarItem icon={FileText} label="Reports" active={activeTab === 'Reports'} onClick={() => setActiveTab('Reports')} />
                    <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
                </nav>
                <div className="p-8 border-t border-slate-800/40 text-[10px] font-bold text-slate-700 flex items-center gap-2 uppercase tracking-widest italic">
                    <Lock size={12} /> Running Locally – Privacy First
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-10 bg-[#0B0F19]/90 backdrop-blur-xl z-40 shrink-0">
                    <div className="flex items-center bg-[#151B28] border border-slate-800 rounded-xl px-4 py-2 gap-2 cursor-pointer shadow-sm">
                        <Calendar size={14} className="text-brandBlue" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">FY 2024-25</span>
                        <ChevronRight size={10} className="text-slate-600" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Bell size={20} className="text-slate-600" />
                        <div className="w-8 h-8 rounded-full bg-brandBlue shadow-lg shadow-brandBlue/20 flex items-center justify-center text-[10px] font-black">AK</div>
                        <button onClick={() => setShowReportModal(true)} className="bg-brandBlue text-white py-2.5 px-6 rounded-xl text-[11px] font-black shadow-xl shadow-brandBlue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                            <FileText size={14} /> Generate Report
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 bg-[#0B0F19]">
                    {!results && activeTab === 'Dashboard' && !isAnalyzing ? (
                        <div className="max-w-4xl mx-auto mt-10 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-4xl font-black text-white tracking-tighter">Good morning, Akhil</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="bg-[#151B28] border border-slate-800/40 p-10 rounded-[40px] shadow-3xl">
                                    <h3 className="text-xl font-bold mb-10 text-white italic tracking-tight">1. Profile Details</h3>
                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3 block">Annual Income</label>
                                            <input type="number" className="w-full bg-[#0B0F19] border border-slate-800/50 rounded-2xl p-5 text-2xl font-black outline-none focus:border-brandBlue transition-all text-white" value={profile.salary} onChange={(e) => setProfile({ ...profile, salary: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3 block">Age</label>
                                            <input type="number" className="w-full bg-[#0B0F19] border border-slate-800/50 rounded-2xl p-5 text-2xl font-black outline-none focus:border-brandBlue transition-all text-white" value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#151B28] border border-slate-800/40 p-10 rounded-[40px] shadow-3xl flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-brandBlue/5 rounded-[32px] flex items-center justify-center text-brandBlue mb-8 shadow-inner border border-brandBlue/10"><Upload size={40} /></div>
                                    <h3 className="text-xl font-bold mb-3 text-white">Bank Statement</h3>
                                    <input type="file" id="fup" className="hidden" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                                    <label htmlFor="fup" className="cursor-pointer w-full bg-brandBlue/5 border border-dashed border-brandBlue/20 text-brandBlue py-5 rounded-3xl font-black mb-8 px-8 truncate block tracking-widest hover:bg-brandBlue/10 transition-colors">{file ? file.name : 'UPLOAD CSV'}</label>
                                    <button onClick={handleUpload} disabled={!file} className="w-full bg-brandBlue py-6 rounded-3xl font-black text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] disabled:opacity-30 uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all">Process & Analyze</button>
                                </div>
                            </div>
                        </div>
                    ) : isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 border-[6px] border-brandBlue/10 border-t-brandBlue rounded-full animate-spin"></div>
                            <h2 className="text-xl font-black uppercase tracking-widest text-white animate-pulse">Analyzing Intelligence</h2>
                        </div>
                    ) : renderContent()}
                </main>
            </div>

            <AnimatePresence>
                {showReportModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center" onClick={() => setShowReportModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#151B28] p-12 rounded-[48px] border border-slate-800/50 text-center max-w-lg w-full shadow-3xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-10 w-full">
                                <h3 className="text-2xl font-black tracking-tight text-white">Generate Tax Report</h3>
                                <div onClick={() => setShowReportModal(false)} className="text-slate-600 cursor-pointer hover:text-white transition-colors">✕</div>
                            </div>
                            <p className="text-slate-500 text-sm mb-12 text-left">Your comprehensive tax optimization report preview</p>
                            <div className="space-y-4 mb-12">
                                {['Income Summary', 'Deduction Gap Analysis', 'Regime Comparison', 'AI Strategy Plan', 'Financial Health Score'].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-[#0B0F19] p-5 rounded-3xl border border-slate-800/40 group hover:border-brandBlue/30 transition-all shadow-inner">
                                        <span className="text-[13px] font-black text-slate-300">{item}</span>
                                        <div className="flex items-center gap-2"><span className="text-[10px] font-black text-brandGreen uppercase">Ready</span><CheckCircle2 className="text-brandGreen" size={16} /></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 w-full">
                                <button onClick={() => setShowReportModal(false)} className="flex-1 bg-slate-800/40 py-5 rounded-3xl font-black text-slate-500 hover:text-white transition-all">Cancel</button>
                                <button className="flex-2 bg-brandBlue py-5 px-10 rounded-3xl font-black text-white flex items-center justify-center gap-3 shadow-xl shadow-brandBlue/20 hover:scale-[1.02] active:scale-95 transition-all"><Download size={18} /> Download PDF</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating AI Chatbot Agent */}
            <AnimatePresence>
                {showChat && renderChatWindow()}
            </AnimatePresence>

            <div
                onClick={() => setShowChat(!showChat)}
                className={`fixed bottom-10 right-10 w-16 h-16 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-95 transition-all z-[100] group ${showChat ? 'bg-gradient-to-tr from-[#3B82F6] to-[#06B6D4]' : 'bg-brandBlue'}`}
            >
                {showChat ? (
                    <CloseIcon size={28} className="transition-transform" />
                ) : (
                    <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
                )}
            </div>
        </div>
    );
}

export default App;
