const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const sources = [
  {
    name: 'Bocanlar Tekstil',
    filename: 'Bocarlar Kartela..xlsx',
  },
  {
    name: 'Marka Moda',
    filename: 'MarkaModa.xlsx',
  }
];

const outputPath = path.join(process.cwd(), 'src', 'data.json');
let allData = [];

try {
  for (const source of sources) {
    const excelPath = path.join(process.cwd(), source.filename);
    
    // Check if the file exists before attempting to read it
    if (!fs.existsSync(excelPath)) {
        console.warn(`File not found, skipping: ${excelPath}`);
        continue;
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0]; // Assume data is in first sheet
    const sheet = workbook.Sheets[sheetName];

    // Parse to JSON
    const data = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`Parsed ${data.length} rows from sheet: ${sheetName} in ${source.filename}`);

    // Normalize Data Structure
    const normalizedData = data.map(row => {
        let sgsCode = row['SGS Kodu'] || row['Firma Kodu'];
        let supplierCode = row['Bocanlar Kodu'] || row['Marka Moda Kodu'];
        let content = row['İçerik'] || row['İçerik Bilgisi'];
        let width = row['En (cm)'];
        let weight = row['Gramaj (Gr)'] || row['Gramaj (gr)'];

        return {
            'SGS Kodu': sgsCode,
            'Tedarikçi Kodu': supplierCode,
            'İçerik': content,
            'En (cm)': width !== undefined ? width + '' : '',
            'Gramaj (Gr)': weight !== undefined ? weight + '' : '',
            'Tedarikçi Firma': source.name
        };
    });

    allData = allData.concat(normalizedData);
  }

  // Quick peek at the first row to understand structure
  if (allData.length > 0) {
      console.log('Sample row key:', Object.keys(allData[0]));
      console.log('Sample row value:', allData[0]);
  }

  fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
  console.log(`Wrote total ${allData.length} records to src/data.json`);

} catch (error) {
  console.error('Error parsing excel:', error);
}
