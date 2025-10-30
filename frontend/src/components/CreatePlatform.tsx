import { useState } from 'react';
import { PlusCircle, Building2, Users } from 'lucide-react';
import { useLanguageContext } from '../contexts/LanguageContext';

interface CreatePlatformProps {
  createPlatform: (name: string, memberLimit: number) => Promise<any>;
  onSuccess: () => void;
}

export function CreatePlatform({ createPlatform, onSuccess }: CreatePlatformProps) {
  const { t } = useLanguageContext();
  const [name, setName] = useState('');
  const [memberLimit, setMemberLimit] = useState('100');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.errorEnterPlatformName);
      return;
    }

    const limit = parseInt(memberLimit);
    if (isNaN(limit) || limit < 1) {
      setError(t.errorMemberLimitPositive);
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createPlatform(name.trim(), limit);
      setName('');
      setMemberLimit('100');
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
            <Building2 size={20} color="white" />
          </div>
          <h3 className="card-title" style={{ margin: 0 }}>{t.createPlatform}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <Building2 size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {t.platformName}
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.platformNamePlaceholder}
              disabled={creating}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Users size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {t.memberLimit}
            </label>
            <input
              type="number"
              className="form-input"
              value={memberLimit}
              onChange={(e) => setMemberLimit(e.target.value)}
              placeholder={t.memberLimitPlaceholder}
              min="1"
              disabled={creating}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={creating}
          style={{ width: '100%' }}
        >
          <PlusCircle size={18} />
          {creating ? t.creating : t.createPlatform}
        </button>
      </form>
    </div>
  );
}

