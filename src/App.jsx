import { useState, useMemo } from 'react'
import fabricData from './data.json'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMode, setSearchMode] = useState('all') // 'all', 'sgs', 'supplier'
  const [selectedFabric, setSelectedFabric] = useState(null)

  const filteredFabrics = useMemo(() => {
    if (!searchTerm.trim()) return fabricData;

    const lowerTerm = searchTerm.toLowerCase();

    return fabricData.filter(fabric => {
      const sgsCode = String(fabric['SGS Kodu'] || '').toLowerCase();
      const supplierCode = String(fabric['Bocanlar Kodu'] || '').toLowerCase();
      const content = String(fabric['İçerik'] || '').toLowerCase();
      const width = String(fabric['En (cm)'] || '').toLowerCase();
      const weight = String(fabric['Gramaj (Gr)'] || '').toLowerCase();
      const supplierName = "bocanlar tekstil"; // Hardcoded supplier name for search

      if (searchMode === 'sgs') {
        return sgsCode.includes(lowerTerm);
      }
      if (searchMode === 'supplier') {
        return supplierCode.includes(lowerTerm) || supplierName.includes(lowerTerm);
      }
      // 'all'
      return (
        sgsCode.includes(lowerTerm) ||
        supplierCode.includes(lowerTerm) ||
        content.includes(lowerTerm) ||
        width.includes(lowerTerm) ||
        weight.includes(lowerTerm) ||
        supplierName.includes(lowerTerm)
      );
    });
  }, [searchTerm, searchMode]);

  return (
    <div className="container">
      <header className="header">
        <h1>SGS Kumaşçılık</h1>
        <p>Kumaş Takip Sistemi</p>
      </header>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Kumaş kodu veya tedarikçi kodu ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="search-options">
          <button
            className={`filter-btn ${searchMode === 'all' ? 'active' : ''}`}
            onClick={() => setSearchMode('all')}
          >
            Tümü
          </button>
          <button
            className={`filter-btn ${searchMode === 'sgs' ? 'active' : ''}`}
            onClick={() => setSearchMode('sgs')}
          >
            SGS Kodu
          </button>
          <button
            className={`filter-btn ${searchMode === 'supplier' ? 'active' : ''}`}
            onClick={() => setSearchMode('supplier')}
          >
            Tedarikçi Kodu
          </button>
        </div>
      </div>

      <div className="results-grid">
        {filteredFabrics.length > 0 ? (
          filteredFabrics.map((fabric, index) => (
            <div
              key={index}
              className="fabric-card"
              onClick={() => setSelectedFabric(fabric)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-header">
                <div className="card-title">SGS: {fabric['SGS Kodu']}</div>
                <div className="info-badge">{fabric['Bocanlar Kodu']}</div>
              </div>

              <div className="card-detail">
                <span className="detail-label">İçerik</span>
                <span className="detail-value">{fabric['İçerik'] || '-'}</span>
              </div>

              <div className="card-detail">
                <span className="detail-label">En</span>
                <span className="detail-value">{fabric['En (cm)'] || '-'}</span>
              </div>

              <div className="card-detail">
                <span className="detail-label">Gramaj</span>
                <span className="detail-value">{fabric['Gramaj (Gr)'] || '-'}</span>
              </div>

              <div className="card-detail">
                <span className="detail-label">Tedarikçi Firma</span>
                <span className="detail-value">Bocanlar Tekstil</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            Aramanızla eşleşen kumaş bulunamadı.
          </div>
        )}
      </div>

      {selectedFabric && (
        <div className="modal-overlay" onClick={() => setSelectedFabric(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFabric(null)}>×</button>

            <h2 className="modal-title">SGS: {selectedFabric['SGS Kodu']}</h2>
            <div className="modal-badge">{selectedFabric['Bocanlar Kodu']}</div>

            <div className="modal-details">
              <div className="card-detail">
                <span className="detail-label">Kumaş İçeriği:</span>
                <span className="detail-value">{selectedFabric['İçerik'] || '-'}</span>
              </div>
              <div className="card-detail">
                <span className="detail-label">Kumaş Eni:</span>
                <span className="detail-value">{selectedFabric['En (cm)'] || '-'}</span>
              </div>
              <div className="card-detail">
                <span className="detail-label">Gramaj:</span>
                <span className="detail-value">{selectedFabric['Gramaj (Gr)'] || '-'}</span>
              </div>
              <div className="card-detail">
                <span className="detail-label">Tedarikçi Firma:</span>
                <span className="detail-value">Bocanlar Tekstil</span>
              </div>
            </div>

            <div className="modal-actions">
              <a
                href={`/labels/${selectedFabric['SGS Kodu']}.docx`}
                download
                className="download-btn"
              >
                📥 Etiket İndir (.docx)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
