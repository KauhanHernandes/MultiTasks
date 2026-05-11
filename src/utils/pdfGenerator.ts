import jsPDF from 'jspdf';

interface ReportItem {
  name: string;
  price: number;
  quantity: number;
  completed: boolean;
}

interface BudgetData {
  budget_amount: number;
}

export const generatePDFReport = (
  month: string,
  items: ReportItem[],
  budget: BudgetData | null,
  totalValue: number,
  completedValue: number
) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let yPosition = 20;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatorio de Compras', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mes: ${month}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 5;
  doc.setFontSize(10);
  const reportDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Gerado em: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', marginLeft, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  if (budget) {
    doc.text(`Orcamento Total:`, marginLeft, yPosition);
    doc.text(`R$ ${budget.budget_amount.toFixed(2)}`, pageWidth - marginRight, yPosition, { align: 'right' });
    yPosition += 7;

    const remainingBudget = budget.budget_amount - completedValue;
    doc.text(`Total Gasto:`, marginLeft, yPosition);
    doc.text(`R$ ${completedValue.toFixed(2)}`, pageWidth - marginRight, yPosition, { align: 'right' });
    yPosition += 7;

    doc.text(`Saldo Restante:`, marginLeft, yPosition);
    doc.setTextColor(remainingBudget >= 0 ? 0 : 255, remainingBudget >= 0 ? 128 : 0, 0);
    doc.text(`R$ ${remainingBudget.toFixed(2)}`, pageWidth - marginRight, yPosition, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPosition += 7;
  } else {
    doc.text(`Total Planejado:`, marginLeft, yPosition);
    doc.text(`R$ ${totalValue.toFixed(2)}`, pageWidth - marginRight, yPosition, { align: 'right' });
    yPosition += 7;

    doc.text(`Total Gasto:`, marginLeft, yPosition);
    doc.text(`R$ ${completedValue.toFixed(2)}`, pageWidth - marginRight, yPosition, { align: 'right' });
    yPosition += 7;
  }

  yPosition += 5;
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Itens', marginLeft, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const col1 = marginLeft;
  const col2 = marginLeft + contentWidth * 0.5;
  const col3 = marginLeft + contentWidth * 0.65;
  const col4 = marginLeft + contentWidth * 0.75;
  const col5 = pageWidth - marginRight - 30;

  doc.text('Produto', col1, yPosition);
  doc.text('Preco', col2, yPosition);
  doc.text('Qtd', col3, yPosition);
  doc.text('Total', col4, yPosition);
  doc.text('Status', col5, yPosition);

  yPosition += 2;
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');

  items.forEach((item, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const itemTotal = item.price * item.quantity;
    const productName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;

    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 4, contentWidth + 4, 7, 'F');
    }

    doc.text(productName, col1, yPosition);
    doc.text(`R$ ${item.price.toFixed(2)}`, col2, yPosition);
    doc.text(item.quantity.toString(), col3, yPosition);
    doc.text(`R$ ${itemTotal.toFixed(2)}`, col4, yPosition);

    if (item.completed) {
      doc.setTextColor(0, 128, 0);
      doc.text('Comprado', col5, yPosition);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(128, 128, 128);
      doc.text('Pendente', col5, yPosition);
      doc.setTextColor(0, 0, 0);
    }

    yPosition += 7;
  });

  if (items.length === 0) {
    doc.setTextColor(128, 128, 128);
    doc.text('Nenhum item registrado', marginLeft, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;
  }

  yPosition += 5;
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatisticas', marginLeft, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const pendingItems = totalItems - completedItems;
  const completionRate = totalItems > 0 ? ((completedItems / totalItems) * 100).toFixed(1) : '0.0';

  doc.text(`Total de Produtos:`, marginLeft, yPosition);
  doc.text(`${totalItems}`, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 6;

  doc.text(`Produtos Comprados:`, marginLeft, yPosition);
  doc.text(`${completedItems}`, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 6;

  doc.text(`Produtos Pendentes:`, marginLeft, yPosition);
  doc.text(`${pendingItems}`, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 6;

  doc.text(`Taxa de Conclusao:`, marginLeft, yPosition);
  doc.text(`${completionRate}%`, pageWidth - marginRight, yPosition, { align: 'right' });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Pagina ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fileName = `Relatorio_Compras_${month.replace('/', '-')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};
