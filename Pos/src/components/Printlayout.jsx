const generateInvoiceForPrint = (invoice, profile) => {
  try {
    // Validate required parameters
    if (!invoice || !profile) {
      throw new Error("Invoice or profile data is missing");
    }

    // Set default values for critical fields
    invoice = {
      invoiceno: "",
      salestype: "",
      employee: "",
      cartItems: [],
      cartCount: [],
      GrandtotalAmount: 0,
      groupedTaxSummary: [],
      subTotal: 0,
      paymentMethods: [{ method: "", amount: 0 }],
      remainingBalance: 0,
      ...invoice
    };

    profile = [{
      logoUrl: "",
      storeName: "N/A",
      address: "N/A",
      city: "N/A",
      state: "N/A",
      pincode: "N/A",
      gstno: "N/A",
      ...profile[0]
    }];

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Unable to open print window. Please allow pop-ups for this site and try again.");
      return;
    }

    const formatCurrency = (amount) => {
      return typeof amount === 'number' ? `₹${amount.toFixed(2)}` : '₹0.00';
    };

    const invoiceContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice</title>
   <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
      }

      body {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
      }

      .main-pd-wrapper {
        max-width: 100%;
        width: 100%;
        padding: 15px;
        margin: 0 auto;
      }

      @media print {
        .main-pd-wrapper {
          width: 100%;
          padding: 0;
          box-shadow: none;
        }
      }

      @media (min-width: 768px) {
        .main-pd-wrapper {
          width: 450px;
          box-shadow: 0 0 10px #ddd;
          border-radius: 10px;
        }
      }

      .store-header {
        text-align: center;
        margin-bottom: 15px;
      }

      .store-header img {
        max-height: 60px;
        max-width: 100%;
      }

      .store-name {
        font-weight: bold;
        color: #000;
        font-size: 18px;
        margin: 10px 0;
      }

      .store-address {
        margin: 10px 0;
      }

      .invoice-meta {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin: 25px 0;
      }

      .invoice-meta div {
        margin-bottom: 8px;
        width: 48%;
      }

      .divider {
        border-top: 1px dashed #999;
        margin: 15px 0;
      }

      table {
        width: 100%;
        margin: 10px 0;
      }

      th, td {
        padding: 8px 5px;
        text-align: left;
        word-break: break-word;
      }

      th {
        font-weight: bold;
        background-color: #f5f5f5;
      }

      .items-table th:nth-child(1) {
        width: 8%;
      }
      .items-table th:nth-child(2) {
        width: 42%;
      }
      .items-table th:nth-child(3),
      .items-table th:nth-child(4),
      .items-table th:nth-child(5) {
        width: 16%;
        text-align: center;
      }

      .items-table td:nth-child(3),
      .items-table td:nth-child(4),
      .items-table td:nth-child(5) {
        text-align: center;
      }

      .summary-table {
        background-color: #fcbd024f;
        margin: 15px 0;
      }

      .summary-table th {
        background-color: transparent;
      }

      .summary-table th:nth-child(2) {
        text-align: center;
      }

      .tax-table {
        margin: 15px 0;
      }

      .tax-table th,
      .tax-table td {
        text-align: center;
      }

      .barcode {
        text-align: center;
        margin: 20px 0;
      }

      .footer {
        text-align: center;
        margin-top: 20px;
      }

      .thank-you {
        margin-top: 10px;
      }

      @media (max-width: 480px) {
        .invoice-meta div {
          width: 100%;
        }
        
        .items-table th:nth-child(1) {
          width: 10%;
        }
        .items-table th:nth-child(2) {
          width: 30%;
        }
        .items-table th:nth-child(3),
        .items-table th:nth-child(4),
        .items-table th:nth-child(5) {
          width: 20%;
        }
      }
    </style>
  </head>
  <body>
    <section class="main-pd-wrapper">
      <div class="store-header">
        ${profile[0]?.logoUrl ? `<img src="${profile[0].logoUrl}" alt="Store Logo" />` : ''}
        <p class="store-name">${profile[0]?.storeName || 'N/A'}</p>
        <p class="store-address">
          ${profile[0]?.address || 'N/A'}, <br>
          ${profile[0]?.city || 'N/A'}, ${profile[0]?.state || 'N/A'}-${profile[0]?.pincode || 'N/A'}
        </p>
        <p>
          <b>GSTIN:</b> ${profile[0]?.gstno || 'N/A'}
        </p>
      </div>

      <div class="invoice-meta">
        <div><b>Bill No:</b> ${invoice.invoiceno}</div>
        <div><b>Sales Type:</b> ${invoice.salestype}</div>
        <div><b>Date:</b> ${new Date(invoice.createdAt || Date.now()).toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(',', '')}
        </div>
        <div><b>Attender:</b> ${invoice.employee}</div>
      </div>

      <div class="divider"></div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Sn.</th>
            <th>Item Name</th>
            <th>QTY</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.cartItems || []).map((item, index) => `
            <tr>
              <td>${index + 1}</td>  
              <td>${item.title || 'N/A'} ${item.variant}${item.unit}</td>
              <td>${item.quantity || 0}</td>
              <td>${formatCurrency(item.price)}</td>
              <td>${formatCurrency((item.quantity || 0) * (item.price || 0))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <table class="summary-table">
        <thead>
          <tr>
            <th>Count</th>
            <th>${invoice.cartCount[0]?.totalItemsQuantity || 0}/${invoice.cartCount[0]?.cartItemsCount || 0}</th>
            <th>&nbsp;</th>
            <th>Total</th>
            <th>${invoice.GrandtotalAmount}</th>
          </tr>
        </thead>
      </table>
      
      ${invoice.groupedTaxSummary?.length > 0 ? `
      <table class="tax-table">
        <thead>
          <tr>
            <th>Taxable</th>
            <th>CGST %</th>
            <th>CGST Amt</th>
            <th>SGST %</th>
            <th>SGST Amt</th>
            <th>Tax Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.groupedTaxSummary
             .filter(taxGroup => taxGroup.taxRate !== "0%" && taxGroup.taxRate !== 0)
            .map(taxGroup => `
              <tr>
                <td>${taxGroup.taxRate}</td>
                <td>${taxGroup.cgst ? taxGroup.cgst + '%' : ''}</td>
                <td>${taxGroup.cgstprice ? formatCurrency(taxGroup.cgstprice) : ''}</td>
                <td>${taxGroup.sgst ? taxGroup.sgst + '%' : ''}</td>
                <td>${taxGroup.sgstprice ? formatCurrency(taxGroup.sgstprice) : ''}</td>
                <td>${formatCurrency((taxGroup.cgstprice || 0) + (taxGroup.sgstprice || 0))}</td>
              </tr>
            `).join('')}
        </tbody> 
      </table>
      ` : ''}

      <div>
        <b>Payment method:</b> ${invoice.paymentMethods[0]?.method || 'N/A'}: ${formatCurrency(invoice.paymentMethods[0]?.amount || 0)}<br>
        <b>Balance:</b> ${formatCurrency(invoice.remainingBalance || 0)}
      </div>

      <div class="barcode">
        <svg id="barcode"></svg>
      </div>

      <div class="footer">
        <p><b>Thank you for your order!</b></p>
        <p class="thank-you">Please visit again!</p>
      </div>
    </section>

    <script>
      try {
        JsBarcode("#barcode", "${invoice.invoiceno}", {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: true
        });
        
        // Add error fallback for barcode
        document.getElementById('barcode').addEventListener('error', function() {
          this.innerHTML = '<text x="50%" y="50%" text-anchor="middle">${invoice.invoiceno}</text>';
        });
      } catch (error) {
        console.error("Barcode error:", error);
        document.getElementById('barcode').innerHTML = '<text x="50%" y="50%" text-anchor="middle">${invoice.invoiceno}</text>';
      }
      
      window.onload = function() {
        setTimeout(function() {
          try {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          } catch (printError) {
            console.error("Print error:", printError);
          }
        }, 500);
      };
    </script>
  </body>
</html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();

  } catch (error) {
    console.error("Error in generateInvoiceForPrint:", error);
    alert(`Failed to generate invoice: ${error.message}`);
  }
};

export default generateInvoiceForPrint;