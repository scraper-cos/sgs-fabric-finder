const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(process.cwd(), 'Bocarlar Kartela..xlsx');
const outputPath = path.join(process.cwd(), 'src', 'data.json');

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0]; // Assume data is in first sheet
    const sheet = workbook.Sheets[sheetName];

    // Parse to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`Parsed ${data.length} rows from sheet: ${sheetName}`);

    // Quick peek at the first row to understand structure
    if (data.length > 0) {
        console.log('Sample row key:', Object.keys(data[0]));
        console.log('Sample row value:', data[0]);
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log('Wrote data to src/data.json');

} catch (error) {
    console.error('Error parsing excel:', error);
}
