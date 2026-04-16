import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ArrowLeft, ChevronDown, ChevronUp,
  Settings, PlusCircle, MapPin, HeartPulse, 
  DollarSign, BarChart2, BookOpen
} from 'lucide-react';

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started & Setup',
    icon: Settings,
    color: '#8b5cf6',
    bgColor: '#F5F3FF',
    articles: [
      {
        title: 'Setting Up Your Farm Profile',
        content: 'Navigate to Settings to update your farm name, location, and preferred currency. These details appear on your printed reports.'
      },
      {
        title: 'Configuring Units (kg vs lbs)',
        content: 'In Settings > Preferences, you can toggle between Metric (kg) and Imperial (lbs). This will update all animal weights and reports instantly.'
      },
      {
        title: 'Offline Mode & Syncing',
        content: 'HealthyHerd works best with an internet connection to sync data. If you lose connection, wait until you are back online before making bulk changes or attempting imports.'
      }
    ]
  },
  {
    id: 'herd-management',
    title: 'Herd Management',
    icon: PlusCircle,
    color: '#16a34a',
    bgColor: '#F0FDF4',
    articles: [
      {
        title: 'Adding a Single Animal',
        content: 'Go to Herd > Add Animal. Fill in the primary details like Tag ID, Species, Sex, and Date of Birth. The animal will immediately appear in your total inventory.'
      },
      {
        title: 'Bulk Data Imports (CSV)',
        content: 'To migrate from another system, go to the Import/Export page. Download our CSV template, fill in your data, and drop it back in. Avoid changing the column headers.'
      },
      {
        title: 'Traceability Forms',
        content: 'When moving or selling animals, use the Traceability module (available on the animal detail page) to log the transfer of ownership securely.'
      }
    ]
  },
  {
    id: 'pastures-camps',
    title: 'Pastures & Camps',
    icon: MapPin,
    color: '#f59e0b',
    bgColor: '#FFFBEB',
    articles: [
      {
        title: 'Creating and Managing Camps',
        content: 'Navigate to Camps. Click "Create Camp", give it a name, and set a maximum capacity. The system will warn you if you assign too many animals.'
      },
      {
        title: 'Batch Movement',
        content: 'Need to move a whole herd? Use the Batch Movement tool to select multiple animals and reassign them to a new camp in one click.'
      }
    ]
  },
  {
    id: 'health-treatments',
    title: 'Health & Treatments',
    icon: HeartPulse,
    color: '#ef4444',
    bgColor: '#FEF2F2',
    articles: [
      {
        title: 'Logging Individual Treatments',
        content: 'Open an animal\'s profile and go to the Health tab. Log diagnoses, medication types, and dosage amounts here.'
      },
      {
        title: 'Using the Batch Health Tool',
        content: 'For processing days (e.g., dipping or herd-wide vaccinations), go to Batch Health. Select the animals, apply the treatment, and save.'
      },
      {
        title: 'Quarantine & Withdrawal Periods',
        content: 'When logging a treatment with a withdrawal period, the system will flag the animal to prevent accidental sales before the meat/milk is safe.'
      }
    ]
  },
  {
    id: 'transactions',
    title: 'Transactions (Buy & Sell)',
    icon: DollarSign,
    color: '#10b981',
    bgColor: '#D1FAE5',
    articles: [
      {
        title: 'Buying Wizard',
        content: 'Navigate to Buy/Sell > Buying Wizard. This guided flow lets you log the purchase invoice, supplier details, and simultaneously add the newly purchased animals to your herd.'
      },
      {
        title: 'Selling Wizard',
        content: 'The Selling Wizard lets you select animals from your inventory, mark them as Sold, and log the revenue. This automatically updates your Active Herd count.'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: BarChart2,
    color: '#0ea5e9',
    bgColor: '#F0F9FF',
    articles: [
      {
        title: 'Generating Reports',
        content: 'Go to Reports. Select a report type (e.g., Mortality, Weight Gain, Treatments), set your date range, and view the visual charts.'
      },
      {
        title: 'Exporting Data',
        content: 'On the Reports page, after generating a report, click the "Export CSV" button to download raw data for your accountant or veterinary consultant.'
      }
    ]
  }
];

export const HelpGuide = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});

  const toggleArticle = (articleId: string) => {
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  // Filter categories based on search
  const filteredCategories = HELP_CATEGORIES.map(category => {
    const isCategoryMatch = category.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const filteredArticles = category.articles.filter(article => 
      isCategoryMatch || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      ...category,
      articles: filteredArticles
    };
  }).filter(category => category.articles.length > 0);

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'none', border: 'none', color: 'var(--text-muted)', 
          cursor: 'pointer', marginBottom: '20px', fontWeight: 600
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="page-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <BookOpen size={36} color="var(--primary)" />
            Comprehensive Help Guide
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to know about using HealthyHerd, from basic setup to advanced batch processing.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '40px', position: 'sticky', top: '20px', zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search for topics, features, or keywords..." 
            style={{ paddingLeft: '48px', height: '56px', fontSize: '1.1rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', backgroundColor: category.bgColor, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={24} color={category.color} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                    {category.title}
                  </h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {category.articles.map((article, idx) => {
                    const articleId = `${category.id}-${idx}`;
                    const isExpanded = expandedArticles[articleId] || searchQuery.length > 2;

                    return (
                      <div 
                        key={idx} 
                        style={{ borderBottom: idx < category.articles.length - 1 ? '1px solid #F1F5F9' : 'none' }}
                      >
                        <button 
                          type="button"
                          onClick={() => toggleArticle(articleId)}
                          style={{ 
                            width: '100%', padding: '20px 24px', border: 'none', backgroundColor: 'white', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text)' }}>
                            {article.title}
                          </span>
                          {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                        </button>
                        
                        {isExpanded && (
                          <div style={{ padding: '0 24px 24px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1rem', backgroundColor: '#FAFAFA' }}>
                            <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                              {article.content}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Search size={32} color="#94A3B8" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Results Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            We couldn't find any help articles matching "{searchQuery}". Try a different search term or <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} style={{ color: 'var(--primary)', textDecoration: 'none' }}>return to the Support page</a>.
          </p>
        </div>
      )}
    </div>
  );
};
