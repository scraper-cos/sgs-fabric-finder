const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(process.cwd(), 'Bocarlar Kartela..xlsx');

try {
    const workbook = XLSX.readFile(excelPath);
    console.log('SheetNames:', workbook.SheetNames);
} catch (error) {
    console.error('Error:', error);
}
