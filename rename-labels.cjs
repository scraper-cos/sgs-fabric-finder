const fs = require('fs');
const path = require('path');
const data = require('./src/data.json');

const labelsDir = path.join(__dirname, 'public/labels');

console.log('Starting rename process...');

let successCount = 0;
let failCount = 0;

data.forEach((item, index) => {
    const sgsCode = item['SGS Kodu'];
    const sequenceNum = index + 1;
    const oldName = `Kumas_Sira_${sequenceNum}.docx`;
    const newName = `${sgsCode}.docx`;

    const oldPath = path.join(labelsDir, oldName);
    const newPath = path.join(labelsDir, newName);

    try {
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            successCount++;
        } else {
            console.warn(`File not found: ${oldName}`);
            failCount++;
        }
    } catch (err) {
        console.error(`Error renaming ${oldName}:`, err);
        failCount++;
    }
});

console.log(`Rename complete. Success: ${successCount}, Failed: ${failCount}`);
