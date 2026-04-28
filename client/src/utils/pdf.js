import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatearMoneda, formatearFecha } from './formato';

export const generarPDFFactura = (factura) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const MARGEN = 20;

  // ── PALETA ──────────────────────────────────────
  const VERDE      = [5, 150, 105];    // brand-600 #059669
  const VERDE_SUAVE= [236, 253, 245];  // brand-50
  const GRIS_OSCURO= [15, 23, 42];     // slate-900
  const GRIS_MED   = [100, 116, 139];  // slate-500
  const GRIS_CLARO = [241, 245, 249];  // slate-100
  const BLANCO     = [255, 255, 255];

  // ── HEADER ──────────────────────────────────────
  doc.setFillColor(...VERDE);
  doc.rect(0, 0, W, 42, 'F');

  // Logo texto
  doc.setTextColor(...BLANCO);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CanVet', MARGEN, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 0.7);
  doc.text('Sistema de Gestión de Servicios Caninos', MARGEN, 25);
  doc.text('Clínica Veterinaria CanVet', MARGEN, 31);

  // N° Factura lado derecho
  doc.setTextColor(...BLANCO);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FACTURA', W - MARGEN, 14, { align: 'right' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(factura.numero || 'FAC-0000', W - MARGEN, 25, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${formatearFecha(factura.fecha)}`, W - MARGEN, 33, { align: 'right' });

  // Estado
  const estadoColor = factura.estado === 'pagada' ? [5,150,105] : factura.estado === 'anulada' ? [220,38,38] : [59,130,246];
  doc.setFillColor(...estadoColor);
  doc.roundedRect(W - MARGEN - 30, 35.5, 32, 8, 2, 2, 'F');
  doc.setTextColor(...BLANCO);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text((factura.estado || 'EMITIDA').toUpperCase(), W - MARGEN + 1, 40.5, { align: 'right' });

  // ── DATOS DEL CLIENTE ───────────────────────────
  let y = 55;
  const prop = factura.propietario || {};

  // Tarjeta datos cliente
  doc.setFillColor(...GRIS_CLARO);
  doc.roundedRect(MARGEN, y, W - 2 * MARGEN, 32, 3, 3, 'F');

  doc.setTextColor(...GRIS_MED);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURADO A', MARGEN + 5, y + 8);

  doc.setTextColor(...GRIS_OSCURO);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(prop.nombre || '—', MARGEN + 5, y + 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRIS_MED);
  const infoCliente = [
    prop.documento ? `CC: ${prop.documento}` : null,
    prop.telefono  ? `Tel: ${prop.telefono}` : null,
    prop.email     ? prop.email : null,
    prop.direccion ? prop.direccion : null,
  ].filter(Boolean).join('   ·   ');
  doc.text(infoCliente, MARGEN + 5, y + 24);

  // ── TABLA DE SERVICIOS ──────────────────────────
  y += 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRIS_OSCURO);
  doc.text('Detalle de servicios', MARGEN, y);
  y += 5;

  const filas = (factura.detalles || []).map(d => [
    d.nombreServicio || d.servicio?.nombre || '—',
    d.cantidad.toString(),
    formatearMoneda(d.precioUnitario),
    formatearMoneda(d.subtotalLinea),
  ]);

  doc.autoTable({
    startY: y,
    head: [['DESCRIPCIÓN', 'CANT.', 'PRECIO UNIT.', 'SUBTOTAL']],
    body: filas,
    margin: { left: MARGEN, right: MARGEN },
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      textColor: GRIS_OSCURO,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: GRIS_OSCURO,
      textColor: BLANCO,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right',  cellWidth: 38 },
      3: { halign: 'right',  cellWidth: 38 },
    },
  });

  // ── TOTALES ─────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 6;
  const colX   = W - MARGEN - 80;
  const valX   = W - MARGEN;

  const lineItem = (label, valor, yPos, bold = false) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...GRIS_MED);
    doc.text(label, colX, yPos);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(valor, valX, yPos, { align: 'right' });
  };

  lineItem('Subtotal:', formatearMoneda(factura.subtotal), finalY);
  lineItem('IVA (19%):', formatearMoneda(factura.iva), finalY + 7);

  // Línea separadora
  doc.setDrawColor(...VERDE);
  doc.setLineWidth(0.5);
  doc.line(colX, finalY + 10, valX, finalY + 10);

  // Total destacado
  doc.setFillColor(...VERDE_SUAVE);
  doc.roundedRect(colX - 5, finalY + 12, 80 + 5, 12, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...VERDE);
  doc.text('TOTAL', colX, finalY + 20);
  doc.text(formatearMoneda(factura.total), valX, finalY + 20, { align: 'right' });

  // ── NOTAS ───────────────────────────────────────
  if (factura.notas) {
    const notasY = finalY + 30;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_MED);
    doc.text('NOTAS:', MARGEN, notasY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(factura.notas, MARGEN + 15, notasY);
  }

  // ── PIE DE PÁGINA ────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...GRIS_CLARO);
  doc.rect(0, pageH - 18, W, 18, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRIS_MED);
  doc.text('CanVet — Sistema de Gestión de Servicios Caninos', W / 2, pageH - 10, { align: 'center' });
  doc.text('Politécnico Grancolombiano · Gerencia de Proyectos Informáticos 2026', W / 2, pageH - 5, { align: 'center' });

  doc.save(`${factura.numero || 'factura'}.pdf`);
};
