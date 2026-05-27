import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const exportToPDF = (inventory, requisitions = []) => {
  const doc = new jsPDF();
  
  doc.text("Reporte Consolidado de Gestion", 14, 15);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

  // Cálculo de KPIs
  const totalInsumos = inventory.length;
  // Calculamos el valor total usando los campos correctos del store
  const valorTotal = inventory.reduce((acc, item) => {
    return acc + (Number(item.quantity) * Number(item.unitCost || 0));
  }, 0);
  const pendingCount = Array.isArray(requisitions) 
    ? requisitions.filter(r => r.estado === 'Pendiente').length 
    : 0;
  
  // 3. Agregar Sección de KPIs al PDF
  autoTable(doc, {
    startY: 30,
    head: [['KPI', 'Valor']],
    body: [
      ['Total de Insumos', totalInsumos],
      ['Valor Total del Inventario', `$${valorTotal.toFixed(2)} USD`],
      ['Solicitudes Pendientes', pendingCount]
    ],
  });

  // 4. Agregar Detalle del Inventario
  doc.addPage();
  doc.text("Detalle de Inventario", 14, 15);
  
  autoTable(doc, {
    startY: 25,
    head: [['Nombre', 'Stock', 'Costo Unitario']],
    body: inventory.map(i => [
      i.name || 'Sin nombre', // Usamos 'name' porque así lo registras en addSupply
      i.quantity || 0,        // 'quantity' es correcto
      `$${Number(i.unitCost || 0).toFixed(2)}` // 'unitCost' es correcto
    ]),
  });

  doc.save("Reporte_Formal_Gerencia.pdf");
};