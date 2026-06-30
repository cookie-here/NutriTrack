import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBabyContext } from '../context/BabyContext';
import {
  uploadDocument as uploadDocApi,
  getDocuments,
  deleteDocument as deleteDocApi,
  getDocumentFileBlob,
} from '../api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/DocumentManager.css';

const CATEGORY_CONFIG = {
  discharge_summary: { icon: '🏥', title: 'Hospital Discharge Summary', desc: 'Upload and manage your baby\'s Hospital Discharge Summary documents.' },
  immunization_card: { icon: '💉', title: 'Immunization Card (खोप कार्ड)', desc: 'Upload and manage your baby\'s Immunization Card documents.' },
  birth_registration: { icon: '📜', title: 'Birth Registration Certificate (जन्म दर्ता)', desc: 'Upload and manage your baby\'s Birth Registration Certificate documents.' },
  medical_records: { icon: '📁', title: 'Medical Records', desc: 'Upload and manage your baby\'s Medical Records documents.' },
};

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getFileIcon(mimeType) {
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType?.startsWith('image/')) return '🖼️';
  return '📄';
}

export default function DocumentManager({ category }) {
  const navigate = useNavigate();
  const { babies, selectedBaby, setSelectedBaby } = useBabyContext();
  const config = CATEGORY_CONFIG[category];

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showViewer, setShowViewer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    document_name: '',
    notes: '',
    files: [],
  });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchDocs = useCallback(async () => {
    if (!selectedBaby) return;
    setLoading(true);
    try {
      const data = await getDocuments(selectedBaby.id, category);
      setDocs(data || []);
    } catch (e) {
      console.error(e);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBaby, category, showToast]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const handleUpload = async () => {
    if (!formData.document_name.trim()) {
      showToast('Please enter a document name', 'error');
      return;
    }
    if (formData.files.length === 0) {
      showToast('Please select at least one file', 'error');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('baby_id', selectedBaby.id);
      fd.append('category', category);
      fd.append('document_name', formData.document_name.trim());
      fd.append('notes', formData.notes.trim());
      formData.files.forEach(f => fd.append('files', f));

      await uploadDocApi(selectedBaby.id, fd);
      showToast('Upload successful');
      setShowUpload(false);
      setFormData({ document_name: '', notes: '', files: [] });
      fetchDocs();
    } catch (e) {
      showToast(e.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDocApi(deleteConfirm);
      showToast('Deleted successfully');
      setDeleteConfirm(null);
      if (showViewer?.id === deleteConfirm) setShowViewer(null);
      fetchDocs();
    } catch (e) {
      showToast(e.message || 'Delete failed', 'error');
    }
  };

  const handleView = async (doc) => {
    try {
      const blob = await getDocumentFileBlob(doc.id);
      const url = URL.createObjectURL(blob);
      setShowViewer({ ...doc, blobUrl: url });
    } catch (e) {
      showToast('Failed to open file', 'error');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await getDocumentFileBlob(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      showToast('Failed to download file', 'error');
    }
  };

  const filteredDocs = docs
    .filter(d => d.document_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.uploaded_at).getTime();
      const dateB = new Date(b.uploaded_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  if (!selectedBaby) {
    return (
      <div className="dm-container">
        <div className="dm-empty-state">
          <p>No baby selected. Please go back and select a baby.</p>
          <button className="dm-btn dm-btn-secondary" onClick={() => navigate('/home')}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dm-container">
      {toast && (
        <div className={`dm-toast dm-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="dm-topbar">
        <button className="dm-back-btn" onClick={() => navigate('/home')}>← Back</button>
        <div className="dm-topbar-titles">
          <h1 className="dm-title">{config.icon} {config.title}</h1>
          <p className="dm-desc">{config.desc}</p>
          <div className="dm-baby-select-row">
            <p className="dm-baby-name">For: {selectedBaby?.name || 'Unknown'}</p>
            {babies.length > 1 && (
              <select
                className="dm-baby-select"
                value={selectedBaby?.id || ''}
                onChange={e => {
                  const baby = babies.find(b => b.id === parseInt(e.target.value));
                  if (baby) setSelectedBaby(baby);
                }}
              >
                {babies.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="dm-search-sort">
        <input
          type="text"
          className="dm-search-input"
          placeholder="Search documents by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select className="dm-sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="dm-upload-card" onClick={() => setShowUpload(true)}>
        <div className="dm-upload-card-content">
          <span className="dm-upload-icon">+</span>
          <div>
            <p className="dm-upload-title">Add Document</p>
            <p className="dm-upload-hint">PDF, JPG, JPEG, PNG • Max 20 MB</p>
          </div>
        </div>
      </div>

      {showUpload && (
        <div className="dm-overlay" onClick={() => { if (!uploading) setShowUpload(false) }}>
          <div className="dm-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2>Upload Document</h2>
              <button className="dm-modal-close" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <div className="dm-modal-body">
              <label className="dm-field-label">Document Name *</label>
              <input
                type="text"
                className="dm-input"
                placeholder="e.g. Discharge Summary"
                value={formData.document_name}
                onChange={e => setFormData(prev => ({ ...prev, document_name: e.target.value }))}
              />

              <label className="dm-field-label">Notes (optional)</label>
              <textarea
                className="dm-textarea"
                placeholder="e.g. NICU stay for 3 days"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />

              <label className="dm-field-label">Files *</label>
              <div className="dm-file-zone">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="dm-file-input"
                  id="dm-file-input"
                />
                <label htmlFor="dm-file-input" className="dm-file-label">
                  {formData.files.length > 0
                    ? `${formData.files.length} file(s) selected`
                    : 'Click to select files'}
                </label>
              </div>

              <button
                className="dm-btn dm-btn-primary dm-btn-full"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dm-section-header">
        <h2>Uploaded Documents</h2>
        <span className="dm-count">{filteredDocs.length}</span>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading documents..." />
      ) : filteredDocs.length === 0 ? (
        <div className="dm-empty-state">
          <p>No {config.title} uploaded yet.</p>
          <p className="dm-empty-hint">Tap "Add Document" to upload one.</p>
        </div>
      ) : (
        <div className="dm-doc-list">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="dm-doc-card">
              <div className="dm-doc-icon">{getFileIcon(doc.mime_type)}</div>
              <div className="dm-doc-info">
                <p className="dm-doc-name">{doc.document_name}</p>
                <p className="dm-doc-meta">
                  {doc.mime_type} • {formatDate(doc.uploaded_at)} • {doc.file_size_formatted}
                </p>
                {doc.notes && <p className="dm-doc-notes">{doc.notes}</p>}
              </div>
              <div className="dm-doc-actions">
                <button className="dm-action-btn" title="View" onClick={() => handleView(doc)}>👁️</button>
                <button className="dm-action-btn" title="Download" onClick={() => handleDownload(doc)}>⬇️</button>
                <button className="dm-action-btn dm-action-delete" title="Delete" onClick={() => setDeleteConfirm(doc.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showViewer && (
        <div className="dm-overlay dm-viewer-overlay" onClick={() => { URL.revokeObjectURL(showViewer.blobUrl); setShowViewer(null) }}>
          <div className="dm-viewer" onClick={e => e.stopPropagation()}>
            <div className="dm-viewer-header">
              <h3>{showViewer.document_name}</h3>
              <button className="dm-modal-close" onClick={() => { URL.revokeObjectURL(showViewer.blobUrl); setShowViewer(null) }}>✕</button>
            </div>
            <div className="dm-viewer-body">
              {showViewer.mime_type === 'application/pdf' ? (
                <iframe src={showViewer.blobUrl} className="dm-pdf-viewer" title={showViewer.document_name} />
              ) : (
                <img src={showViewer.blobUrl} alt={showViewer.document_name} className="dm-img-viewer" />
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="dm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="dm-confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Delete Document</h3>
            <p>Are you sure you want to delete this document? This action cannot be undone.</p>
            <div className="dm-confirm-actions">
              <button className="dm-btn dm-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="dm-btn dm-btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
