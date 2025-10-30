import { useState } from 'react';
import { PlusCircle, X, Vote, List } from 'lucide-react';
import { useLanguageContext } from '../contexts/LanguageContext';

interface CreatePollProps {
  platformId: number;
  createPoll: (platformId: number, title: string, options: string[]) => Promise<any>;
  onSuccess: () => void;
}

export function CreatePoll({ platformId, createPoll, onSuccess }: CreatePollProps) {
  const { t } = useLanguageContext();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError(t.errorEnterPollTitle);
      return;
    }

    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      setError(t.errorAtLeastTwoOptions);
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createPoll(platformId, title.trim(), validOptions);
      setTitle('');
      setOptions(['', '']);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="card create-form-card">
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <Vote size={20} color="white" />
          </div>
          <h3 className="card-title" style={{ margin: 0 }}>{t.createPoll}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        
        <div className="form-group">
          <label className="form-label">
            <Vote size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
            {t.pollTitle}
          </label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.pollTitlePlaceholder}
            disabled={creating}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <List size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
            {t.pollOptions}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {options.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary-color)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`${t.optionPlaceholder} ${String.fromCharCode(65 + index)}`}
                  disabled={creating}
                  style={{ flex: 1 }}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleRemoveOption(index)}
                    disabled={creating}
                    style={{ 
                      padding: '0.75rem',
                      minWidth: 'auto',
                      background: 'var(--danger-light)',
                      borderColor: 'rgba(239, 68, 68, 0.3)'
                    }}
                    title={t.deleteOption}
                  >
                    <X size={18} color="var(--danger-color)" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddOption}
              disabled={creating}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                background: 'var(--info-light)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                color: 'var(--info-color)'
              }}
            >
              <PlusCircle size={18} />
              {t.addOption}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={creating}
          style={{ width: '100%' }}
        >
          <PlusCircle size={18} />
          {creating ? t.creating : t.createPoll}
        </button>
      </form>
    </div>
  );
}

