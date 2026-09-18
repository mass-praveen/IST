import { FileBarChart2, Download, ExternalLink } from 'lucide-react';

export default function Reports() {
  return (
    <div className="glass-panel-premium" style={{padding: '3rem', maxWidth: '800px', margin: '0 auto'}}>
      <div className="space-between" style={{marginBottom: '2rem'}}>
        <h1 className="flex-center" style={{gap: '0.75rem'}}>
          <FileBarChart2 className="text-gradient" size={32} />
          Interview Report
        </h1>
        <button className="btn btn-secondary">
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div style={{background: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-strong)'}}>
        <div style={{display: 'flex', gap: '3rem', marginBottom: '2rem'}}>
           <div>
             <p style={{color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Date</p>
             <h4>{new Date().toLocaleDateString()}</h4>
           </div>
           <div>
             <p style={{color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Type</p>
             <h4>Full Stack Developer Mock</h4>
           </div>
           <div>
             <p style={{color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Duration</p>
             <h4>45 mins</h4>
           </div>
        </div>

        <hr style={{borderColor: 'var(--border-subtle)', marginBottom: '2rem'}} />

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem'}}>
           <div className="glass-panel-premium" style={{padding: '1.5rem', textAlign: 'center'}}>
             <h3>Overall Score</h3>
             <div style={{fontSize: '3rem', fontWeight: '700', color: 'var(--accent-primary)', margin: '1rem 0'}}>84%</div>
             <p style={{color: 'var(--success)'}}>Strong Hire Potential</p>
           </div>
           
           <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center'}}>
             <div className="space-between">
                <span>Technical Knowledge</span>
                <strong>88%</strong>
             </div>
             <div className="bar-bg"><div className="bar-fill" style={{width: '88%', background: 'var(--success)'}}></div></div>
             
             <div className="space-between mt-2">
                <span>Communication</span>
                <strong>75%</strong>
             </div>
             <div className="bar-bg"><div className="bar-fill" style={{width: '75%', background: 'var(--warning)'}}></div></div>
             
             <div className="space-between mt-2">
                <span>Problem Solving</span>
                <strong>90%</strong>
             </div>
             <div className="bar-bg"><div className="bar-fill" style={{width: '90%', background: 'var(--success)'}}></div></div>
           </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
           <div>
             <h3 style={{marginBottom: '1rem', color: 'var(--success)'}}>Key Strengths</h3>
             <ul style={{listStylePosition: 'inside', color: 'var(--text-secondary)', lineHeight: '1.8'}}>
               <li>Excellent grasp of React fundamentals</li>
               <li>Clear explanation of architectural decisions</li>
               <li>Strong coding problem-solving speed</li>
             </ul>
           </div>
           <div>
             <h3 style={{marginBottom: '1rem', color: 'var(--warning)'}}>Areas to Improve</h3>
             <ul style={{listStylePosition: 'inside', color: 'var(--text-secondary)', lineHeight: '1.8'}}>
               <li>Provide more quantifiable metrics in STAR answers</li>
               <li>Reduce filler words ("um", "like")</li>
               <li>Review Docker containerization basics</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
