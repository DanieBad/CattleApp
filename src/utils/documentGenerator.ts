import { jsPDF } from 'jspdf';
import type { Animal, FarmSettings } from '../types';

export interface DocumentData {
  seller: FarmSettings;
  buyer: {
    fullName: string;
    idNumber: string;
    address: string;
    contact: string;
    gln?: string;
  };
  driver: {
    fullName: string;
    idNumber: string;
    address: string;
    contact: string;
  };
  vehicle: {
    registration: string;
    make: string;
    model: string;
  };
  movement: {
    fromAddress: string;
    toAddress: string;
    date: string;
  };
  animals: Animal[];
  signatureDataUrl?: string;
}

export const generateDeclarationPdf = (data: DocumentData): Blob => {
  const doc = new jsPDF();
  let y = 20;
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FARMER / OWNER DECLARATION', 105, y, { align: 'center' });
  
  y += 20;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Header details
  doc.text(`I, ${data.seller.ownerFullName || data.seller.farmName || '________________________'},`, 20, y);
  y += 10;
  doc.text(`ID No: ${data.seller.ownerIdNumber || '________________________'}`, 20, y);
  y += 10;
  doc.text(`Residential / Physical Address: ${data.seller.ownerAddress || data.seller.district || '________________________'}`, 20, y);
  y += 10;
  doc.text(`within the municipal area of: ${data.seller.district || '________________________'},`, 20, y);
  
  y += 15;
  doc.text(`hereby declare that the following numbers of food producing animals:`, 20, y);
  
  y += 15;
  
  // Counts table
  let cattleCount = 0;
  let sheepCount = 0;
  
  data.animals.forEach(a => {
    if (a.species.toLowerCase() === 'cattle') cattleCount++;
    else if (a.species.toLowerCase() === 'sheep') sheepCount++;
  });
  
  doc.setFont('helvetica', 'bold');
  doc.text('Species', 40, y);
  doc.text('Number', 100, y);
  doc.setFont('helvetica', 'normal');
  
  y += 10;
  doc.text('Cattle', 40, y);
  doc.text(cattleCount.toString(), 100, y);
  
  y += 10;
  doc.text('Sheep', 40, y);
  doc.text(sheepCount.toString(), 100, y);
  
  y += 20;
  
  // Declaration body
  const bodyLines = [
    '1) are owned by me;',
    '2) are, to the best of my knowledge, healthy and without any clinical signs',
    '   of disease;',
    '3) originate from a premises / farm that is not under veterinary quarantine',
    '   for any controlled or notifiable disease;',
    '4) comply with the withdrawal periods of any medication or veterinary',
    '   products used on the animals;',
    '5) are not under treatment for any disease;'
  ];
  
  bodyLines.forEach(line => {
    doc.text(line, 20, y);
    y += 8;
  });
  
  y += 15;
  doc.text(`Signed at: ${data.seller.district || '__________________'}`, 20, y);
  doc.text(`Date: ${data.movement.date}`, 100, y);
  
  y += 15;
  if (data.signatureDataUrl) {
    doc.addImage(data.signatureDataUrl, 'PNG', 20, y, 50, 25);
  } else {
    doc.text('_________________________', 20, y + 10);
  }
  
  y += 35;
  doc.text(`Name (Print): ${data.seller.ownerFullName || '__________________'}`, 20, y);
  y += 10;
  doc.text(`Contact no: ${data.seller.ownerContactNumber || '__________________'}`, 20, y);
  
  y += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Note: "Animal" means any mammalian, bird, fish, reptile or amphibian which is a member of the', 20, y);
  y += 5;
  doc.text('phylum vertebrates and is intended for human consumption.', 20, y);
  
  return doc.output('blob');
};

export const generateRemovalCertificatePdf = (data: DocumentData): Blob => {
  const doc = new jsPDF();
  let y = 20;
  
  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REMOVAL CERTIFICATE', 105, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  doc.text('Section 8(1) of the Stock Theft Act 57 of 1959', 105, y, { align: 'center' });
  
  y += 15;
  
  const drawSection = (title: string, lines: string[], currentY: number) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, currentY);
    doc.setFont('helvetica', 'normal');
    let innerY = currentY + 8;
    lines.forEach(line => {
      doc.text(line, 25, innerY);
      innerY += 7;
    });
    return innerY + 5;
  };
  
  y = drawSection('SECTION A: OWNER PARTICULARS', [
    `Name: ${data.seller.ownerFullName || data.seller.farmName || ''}`,
    `ID: ${data.seller.ownerIdNumber || ''}`,
    `Address: ${data.seller.ownerAddress || data.seller.district || ''}`,
    `Contact: ${data.seller.ownerContactNumber || ''}`
  ], y);
  
  y = drawSection('SECTION B: NEW OWNER PARTICULARS', [
    `Name: ${data.buyer.fullName || ''}`,
    `ID: ${data.buyer.idNumber || ''}`,
    `Address: ${data.buyer.address || ''}`,
    `Contact: ${data.buyer.contact || ''}`
  ], y);
  
  y = drawSection('SECTION C: DRIVER PARTICULARS', [
    `Name: ${data.driver.fullName || ''}`,
    `ID: ${data.driver.idNumber || ''}`,
    `Address: ${data.driver.address || ''}`,
    `Contact: ${data.driver.contact || ''}`
  ], y);
  
  y = drawSection('SECTION D: VEHICLE PARTICULARS', [
    `Registration: ${data.vehicle.registration || ''}`,
    `Make & Model: ${data.vehicle.make || ''} ${data.vehicle.model || ''}`,
    `From: ${data.movement.fromAddress || ''}`,
    `To: ${data.movement.toAddress || ''}`,
    `Date of Issue: ${data.movement.date}`
  ], y);
  
  // Section E: Animals
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION E: ANIMAL IDENTIFICATION', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  const col1 = 25;
  const col2 = 60;
  const col3 = 100;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Species', col1, y);
  doc.text('Breed', col2, y);
  doc.text('Tag Number', col3, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.line(25, y - 4, 185, y - 4);
  
  data.animals.forEach(a => {
    // Check page break
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(a.species || '', col1, y);
    doc.text(a.breed || '', col2, y);
    doc.text(a.tagNumber || '', col3, y);
    y += 6;
  });
  
  y += 10;
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATION:', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  doc.text('I hereby certify that I am the owner/authorized agent of the stock described above.', 20, y);
  
  y += 15;
  if (data.signatureDataUrl) {
    doc.addImage(data.signatureDataUrl, 'PNG', 20, y, 50, 25);
  } else {
    doc.text('_________________________', 20, y + 10);
  }
  doc.text('Signature of Owner/Agent', 20, y + 30);
  
  return doc.output('blob');
};
