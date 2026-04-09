import { useState, useEffect, useMemo } from 'react'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcRRNNYgcIHr88tlnoL5TtkRnZvZl_LPhUZ-e6LKsjwERFPRRqWr1OUKLT84MY_ps/exec';

function App() {
  const [fabricData, setFabricData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [searchMode, setSearchMode] = useState('all') // 'all', 'sgs', 'supplier'
  const [selectedFabric, setSelectedFabric] = useState(null)

  useEffect(() => {
    fetch(SCRIPT_URL)
      .then(res => {
        if (!res.ok) throw new Error('Ağ hatası oluştu');
        return res.json();
      })
      .then(data => {
        const normalizedData = data.map(row => {
          let sgsCode = '';
          let supplierCode = '';
          let content = '';
          let width = '';
          let weight = '';
          const supplierName = row['Tedarikçi Firma'] || 'Bilinmiyor';

          Object.keys(row).forEach(key => {
            const k = key.toLowerCase().trim();
            const val = row[key];
            const cleanVal = val !== undefined && val !== null ? String(val).trim() : '';

            // SGS Kodu
            if (cleanVal && (k === 'sgs kodu' || k === 'firma kodu' || k === 'sgs kod' || k === 'sgs')) {
              sgsCode = cleanVal;
            }
            // İçerik
            else if (cleanVal && (k.includes('i̇çerik') || k.includes('icerik') || k.includes('içerik'))) {
              content = cleanVal;
            }
            // En
            else if (cleanVal && ((k.includes('en') && k.length < 10) || k.includes('genişlik'))) {
              width = cleanVal;
            }
            // Gramaj
            else if (cleanVal && (k.includes('gramaj') || k === 'gr' || k.includes('ağırlık'))) {
              weight = cleanVal;
            }
            // Tedarikçi Kodu (Anything with 'kodu' or 'kod' that isn't SGS or Firma)
            else if (cleanVal && (k.includes('kodu') || k.includes('kod')) && !k.includes('sgs') && !k.includes('firma')) {
              if (!supplierCode) {
                supplierCode = cleanVal;
              }
            }
          });

          // Fallbacks if loop didn't catch something
          if (!sgsCode) sgsCode = row['SGS Kodu'] || row['Firma Kodu'] || row['SGS KODU'] || '';
          if (!supplierCode) supplierCode = row['COSMOS Moda Kodu'] || row['Bocarlar Kodu'] || row['Marka Moda Kodu'] || row['Tedarikçi Kodu'] || row['Bocanlar Kodu'] || row['Cosmos Kodu'] || '';
          if (!content) content = row['İçerik'] || row['İçerik Bilgisi'] || '';
          if (!width) width = row['En (cm)'] || row['En'] || '';
          if (!weight) weight = row['Gramaj (Gr)'] || row['Gramaj'] || '';

          return {
            'SGS Kodu': sgsCode,
            'Tedarikçi Kodu': supplierCode,
            'İçerik': content,
            'En (cm)': width !== undefined ? width + '' : '',
            'Gramaj (Gr)': weight !== undefined ? weight + '' : '',
            'Tedarikçi Firma': supplierName
          };
        });
        setFabricData(normalizedData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Data fetch error:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
        setIsLoading(false);
      });
  }, []);

  const filteredFabrics = useMemo(() => {
    if (!searchTerm.trim()) return fabricData;

    const lowerTerm = searchTerm.toLowerCase();

    return fabricData.filter(fabric => {
      const sgsCode = String(fabric['SGS Kodu'] || '').toLowerCase();
      const supplierCode = String(fabric['Tedarikçi Kodu'] || '').toLowerCase();
      const content = String(fabric['İçerik'] || '').toLowerCase();
      const width = String(fabric['En (cm)'] || '').toLowerCase();
      const weight = String(fabric['Gramaj (Gr)'] || '').toLowerCase();
      const supplierName = String(fabric['Tedarikçi Firma'] || '').toLowerCase();

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
  }, [searchTerm, searchMode, fabricData]);

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
          disabled={isLoading}
        />

        <div className="search-options">
          <button
            className={`filter-btn ${searchMode === 'all' ? 'active' : ''}`}
            onClick={() => setSearchMode('all')}
            disabled={isLoading}
          >
            Tümü
          </button>
          <button
            className={`filter-btn ${searchMode === 'sgs' ? 'active' : ''}`}
            onClick={() => setSearchMode('sgs')}
            disabled={isLoading}
          >
            SGS Kodu
          </button>
          <button
            className={`filter-btn ${searchMode === 'supplier' ? 'active' : ''}`}
            onClick={() => setSearchMode('supplier')}
            disabled={isLoading}
          >
            Tedarikçi Kodu
          </button>
        </div>
      </div>

      <div className="results-grid">
        {isLoading ? (
          <div className="loading-spinner">Veriler e-tablodan yükleniyor...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredFabrics.length > 0 ? (
          filteredFabrics.map((fabric, index) => (
            <div
              key={index}
              className="fabric-card"
              onClick={() => setSelectedFabric(fabric)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-header">
                <div className="card-title">SGS: {fabric['SGS Kodu']}</div>
                <div className="info-badge">{fabric['Tedarikçi Kodu']}</div>
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
                <span className="detail-value">{fabric['Tedarikçi Firma']}</span>
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
            <div className="modal-badge">{selectedFabric['Tedarikçi Kodu']}</div>

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
                <span className="detail-value">{selectedFabric['Tedarikçi Firma']}</span>
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

