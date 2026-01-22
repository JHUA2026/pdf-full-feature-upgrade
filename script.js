document.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;
  let logoBase64 = "";

  // ===== LIVE PREVIEW UPDATES =====
  const previewInputs = [
    "productName",
    "canvaLink",
    "fontFamily",
    "fontSize",
    "fontColor",
    "instructionText"
  ];

  previewInputs.forEach(id => {
    document.getElementById(id).addEventListener("input", updatePreview);
  });

  document.getElementById("logoFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      logoBase64 = reader.result;
      document.getElementById("previewLogo").src = logoBase64;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("generateBtn").addEventListener("click", generatePDF);

  function updatePreview() {
    document.getElementById("previewTitle").textContent =
      val("productName") || "Product Name";

    const linkEl = document.getElementById("previewLink");
    linkEl.textContent = "Open your purchase link here";
    linkEl.href = val("canvaLink") || "#";
    linkEl.style.color = "#0066cc";
    linkEl.style.textDecoration = "underline";

    const textEl = document.getElementById("previewText");
    textEl.textContent = val("instructionText") || "Your instructions will appear here…";
    textEl.style.fontFamily = val("fontFamily");
    textEl.style.fontSize = val("fontSize") + "px";
    textEl.style.color = val("fontColor");
  }

  // ===== PDF GENERATION =====
  function generatePDF() {
    const productName = val("productName");
    const link = val("canvaLink");
    const content = val("instructionText");

    if (!productName || !link || !content) {
      alert("Please fill in all required fields.");
      return;
    }

    const doc = new jsPDF({
      unit: "mm",
      format: val("paperSize")
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 30;
    let page = 1;

    function header() {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", pageWidth - 45, 10, 30, 15);
      }
    }

    function footer() {
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Page ${page}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    function newPage() {
      footer();
      doc.addPage();
      page++;
      y = 30;
      header();
    }

    header();

    // TITLE
    doc.setFont(val("fontFamily"), "bold");
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(productName, margin, y);
    y += 10;

    // LINK (FORCED BLUE + UNDERLINE)
    const linkText = "Open your purchase link here";
    doc.setFont(val("fontFamily"), "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);

    doc.textWithLink(linkText, margin, y, { url: link });

    const linkWidth = doc.getTextWidth(linkText);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 1, margin + linkWidth, y + 1);

    y += 15;

    // CONTENT
    doc.setFontSize(parseInt(val("fontSize")));
    doc.setTextColor(val("fontColor"));

    const lines = doc.splitTextToSize(content, pageWidth - margin * 2);
    lines.forEach(line => {
      if (y > pageHeight - 30) newPage();
      doc.text(line, margin, y);
      y += parseInt(val("fontSize")) + 1.5;
    });

    // THANK YOU PAGE
    if (document.getElementById("thankYouToggle").checked) {
      newPage();
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("Thank You!", margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setTextColor(70);
      doc.text(
        "Thank you for your purchase.\n\n" +
        "If you need help, please contact us via Etsy messages.\n\n" +
        "This is a digital product. No physical item will be shipped.",
        margin,
        y
      );
    }

    footer();
    doc.save("canva-instructions.pdf");
  }

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  updatePreview();
});
