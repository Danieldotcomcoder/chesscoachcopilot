const fs = require('fs');
const pdf = require('pdf-parse');

const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const text = data.text;
  const paragraphs = text.split('\n\n'); // Splitting text into paragraphs
  return paragraphs;
};

module.exports = extractTextFromPDF;


