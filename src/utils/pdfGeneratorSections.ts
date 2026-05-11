import jsPDF from 'jspdf';

interface ReportItem {
  name: string;
  price: number;
  quantity: number;
  completed: boolean;
  section_name: string;
}

interface Section {
  name: string;
  items: ReportItem[];
}

interface BudgetData {
  budget_amount: number;
}

export const generatePDFReportWithSections = (
  month: string,
  sections: Section[],
  budget: BudgetData | null,
  totalValue: number,
  completedValue: number
) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let yPosition = 20;

  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  const drawPieChart = (x: number, y: number, radius: number, data: { label: string; value: number; color: number[] }[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;

    let currentAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);

      const startX = x + radius * Math.cos(currentAngle);
      const startY = y + radius * Math.sin(currentAngle);

      doc.circle(x, y, radius, 'FD');

      const path: any[] = [];
      path.push({ x, y });
      for (let angle = currentAngle; angle <= endAngle; angle += 0.1) {
        path.push({
          x: x + radius * Math.cos(angle),
          y: y + radius * Math.sin(angle)
        });
      }
      path.push({ x, y });

      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.triangle(x, y, startX, startY, x + radius * Math.cos(endAngle), y + radius * Math.sin(endAngle), 'FD');

      currentAngle = endAngle;
    });
  };

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text('Relatorio de Compras', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text(`Mes: ${month}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 6;
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  const reportDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Gerado em: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 12;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  doc.setFillColor(240, 248, 255);
  doc.rect(marginLeft - 2, yPosition - 6, contentWidth + 4, 8, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text('Resumo Financeiro', marginLeft, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);

  if (budget) {
    doc.text(`Orcamento Total:`, marginLeft + 5, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${budget.budget_amount.toFixed(2)}`, pageWidth - marginRight - 5, yPosition, { align: 'right' });
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    const remainingBudget = budget.budget_amount - completedValue;
    doc.text(`Total Gasto:`, marginLeft + 5, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${completedValue.toFixed(2)}`, pageWidth - marginRight - 5, yPosition, { align: 'right' });
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(`Saldo Restante:`, marginLeft + 5, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(remainingBudget >= 0 ? 0 : 255, remainingBudget >= 0 ? 128 : 0, 0);
    doc.text(`R$ ${remainingBudget.toFixed(2)}`, pageWidth - marginRight - 5, yPosition, { align: 'right' });
    doc.setTextColor(40, 40, 40);
    yPosition += 7;

    const budgetUsage = budget.budget_amount > 0 ? (completedValue / budget.budget_amount) * 100 : 0;
    yPosition += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Uso do Orcamento: ${budgetUsage.toFixed(1)}%`, marginLeft + 5, yPosition);

    const barWidth = 80;
    const barHeight = 4;
    const barX = pageWidth - marginRight - barWidth - 5;
    const barY = yPosition - 3;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(barX, barY, barWidth, barHeight);

    const fillWidth = Math.min((budgetUsage / 100) * barWidth, barWidth);
    if (budgetUsage > 100) {
      doc.setFillColor(220, 53, 69);
    } else if (budgetUsage > 80) {
      doc.setFillColor(255, 193, 7);
    } else {
      doc.setFillColor(40, 167, 69);
    }
    doc.rect(barX, barY, fillWidth, barHeight, 'F');

    yPosition += 8;
  } else {
    doc.text(`Total Planejado:`, marginLeft + 5, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${totalValue.toFixed(2)}`, pageWidth - marginRight - 5, yPosition, { align: 'right' });
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Gasto:`, marginLeft + 5, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${completedValue.toFixed(2)}`, pageWidth - marginRight - 5, yPosition, { align: 'right' });
    yPosition += 7;
  }

  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 12;

  sections.forEach((section, sectionIndex) => {
    checkPageBreak(30);

    doc.setFillColor(245, 245, 250);
    doc.rect(marginLeft - 2, yPosition - 6, contentWidth + 4, 10, 'F');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 25, 112);
    doc.text(`${section.name}`, marginLeft + 2, yPosition);

    const sectionTotal = section.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.text(`Total: R$ ${sectionTotal.toFixed(2)}`, pageWidth - marginRight - 2, yPosition, { align: 'right' });

    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    const col1 = marginLeft + 2;
    const col2 = marginLeft + contentWidth * 0.52;
    const col3 = marginLeft + contentWidth * 0.68;
    const col4 = marginLeft + contentWidth * 0.78;
    const col5 = pageWidth - marginRight - 25;

    doc.text('Produto', col1, yPosition);
    doc.text('Preco', col2, yPosition);
    doc.text('Qtd', col3, yPosition);
    doc.text('Total', col4, yPosition);
    doc.text('Status', col5, yPosition);

    yPosition += 2;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    section.items.forEach((item, index) => {
      checkPageBreak(8);

      const itemTotal = item.price * item.quantity;
      const productName = item.name.length > 32 ? item.name.substring(0, 29) + '...' : item.name;

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 252);
        doc.rect(marginLeft - 1, yPosition - 4, contentWidth + 2, 7, 'F');
      }

      doc.setTextColor(40, 40, 40);
      doc.text(productName, col1, yPosition);
      doc.text(`R$ ${item.price.toFixed(2)}`, col2, yPosition);
      doc.text(item.quantity.toString(), col3, yPosition);
      doc.text(`R$ ${itemTotal.toFixed(2)}`, col4, yPosition);

      if (item.completed) {
        doc.setFillColor(40, 167, 69);
        doc.setDrawColor(40, 167, 69);
        doc.circle(col5 + 3, yPosition - 1.5, 1.5, 'FD');
        doc.setTextColor(40, 167, 69);
        doc.setFontSize(8);
        doc.text('OK', col5 + 6, yPosition);
        doc.setFontSize(9);
      } else {
        doc.setTextColor(128, 128, 128);
        doc.text('Pendente', col5, yPosition);
      }

      doc.setTextColor(40, 40, 40);
      yPosition += 7;
    });

    if (section.items.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text('Nenhum item nesta secao', marginLeft + 5, yPosition);
      yPosition += 8;
    }

    yPosition += 3;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginLeft + 2, yPosition, pageWidth - marginRight - 2, yPosition);
    yPosition += 10;

    if (sectionIndex < sections.length - 1) {
      checkPageBreak(20);
    }
  });

  yPosition += 5;
  checkPageBreak(40);

  doc.setFillColor(240, 248, 255);
  doc.rect(marginLeft - 2, yPosition - 6, contentWidth + 4, 8, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text('Estatisticas Gerais', marginLeft, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  const allItems = sections.flatMap(s => s.items);
  const totalItems = allItems.length;
  const completedItems = allItems.filter(i => i.completed).length;
  const pendingItems = totalItems - completedItems;
  const completionRate = totalItems > 0 ? ((completedItems / totalItems) * 100).toFixed(1) : '0.0';

  const stats = [
    { label: 'Total de Secoes:', value: sections.length.toString() },
    { label: 'Total de Produtos:', value: totalItems.toString() },
    { label: 'Produtos Comprados:', value: completedItems.toString() },
    { label: 'Produtos Pendentes:', value: pendingItems.toString() },
    { label: 'Taxa de Conclusao:', value: `${completionRate}%` },
  ];

  stats.forEach(stat => {
    checkPageBreak(7);
    doc.text(`${stat.label}`, marginLeft + 5, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, pageWidth - marginRight - 5, yPosition, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, pageHeight - 15, pageWidth - marginRight, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Pagina ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    doc.setFontSize(7);
    doc.text(
      'Relatorio de Compras - Sistema de Gestao Domestica',
      marginLeft,
      pageHeight - 10
    );
  }

  const fileName = `Relatorio_Compras_${month.replace('/', '-')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};
