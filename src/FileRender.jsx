import React, { useCallback, useEffect, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

const EditPdfWithForm = () => {
  const [data, setData] = useState({
    patientName: "",
    age: "",
    gender: "",
    diagnosis: "",
    date: "",
    receiptNumber: "",
    description: "",
    sessions: "",
    rate: "",
    amount: "",
  });
  const [generatedPdf, setGeneratedPdf] = useState(null);

  const handleFormSubmit = useCallback(
    async (type) => {
      // Fetch the PDF with the letterhead from the public folder
      const existingPdfBytes = await fetch("/letter_head.pdf").then((res) =>
        res.arrayBuffer()
      );

      // Load the existing PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0]; // Assuming single-page PDF
      const { width } = firstPage.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const patientNameText = `Patient Name - ${data?.patientName}`;
      const dateText = `Date - ${data?.date}`;

      firstPage.drawText("RECEIPT", {
        x: width / 2, // Left-aligned
        y: 650, // Adjust the Y value as necessary for vertical positioning
        size: 12,
        bold,
        color: rgb(0, 0, 0),
      });

      const patientNameWidth = font.widthOfTextAtSize(patientNameText, 12);
      const dateWidth = font.widthOfTextAtSize(dateText, 12);
      // Add form data in the middle of the page
      // Add form data with justified space
      firstPage.drawText(patientNameText, {
        x: 100, // Left-aligned
        y: 600, // Adjust the Y value as necessary for vertical positioning
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(dateText, {
        x: width - dateWidth - 150, // Right-aligned
        y: 600, // Same Y value to keep on the same line
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(
        `Age/Gender - ${data?.age} / ${data?.gender.toUpperCase()}`,
        {
          x: 100,
          y: 580,
          size: 12,
          color: rgb(0, 0, 0),
        }
      );
      firstPage.drawText(`Diagnosis - ${data?.diagnosis}`, {
        x: 100,
        y: 560,
        size: 12,
        color: rgb(0, 0, 0),
        maxWidth: 250,
        lineHeight: 10,
      });

      firstPage.drawText(`Receipt Number - ${data?.receiptNumber}`, {
        x: width - dateWidth - 150,
        y: 580,
        size: 12,
        color: rgb(0, 0, 0),
      });

      // Table headers
      const tableStartY = 480;
      const cellPadding = 10;
      const cellHeight = 20;
      const columnWidths = [200, 100, 100, 100];

      // Header row
      firstPage.drawText("Description of treatment", {
        x: 50,
        y: tableStartY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText("No of sessions", {
        x: 50 + columnWidths[0] + cellPadding,
        y: tableStartY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText("Rate", {
        x: 50 + columnWidths[0] + columnWidths[1] + cellPadding * 2,
        y: tableStartY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText("Amount", {
        x:
          50 +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          cellPadding * 3,
        y: tableStartY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      // Draw bottom border under headers
      firstPage.drawLine({
        start: { x: 50, y: tableStartY - 5 },
        end: { x: width - 50, y: tableStartY - 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // Empty row after headers
      const emptyRowY = tableStartY - cellHeight - 5;
      firstPage.drawText("", {
        x: 50,
        y: emptyRowY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      // Draw dynamic row (below empty row) based on form inputs
      const dynamicRowY = emptyRowY - cellHeight;

      firstPage.drawText(data?.description, {
        x: 50,
        y: dynamicRowY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
        maxWidth: 150,
        lineHeight: 10,
      });
      const sessions =
        data?.sessions !== null && data?.sessions !== undefined
          ? typeof data.sessions === "number"
            ? data.sessions.toString()
            : data.sessions
          : "";

      firstPage.drawText(sessions, {
        x: 50 + columnWidths[0] + cellPadding,
        y: dynamicRowY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      const rating =
        data?.rate !== null && data?.rate !== undefined
          ? typeof data.rate === "number"
            ? data.rate.toString()
            : data.rate
          : "";

      firstPage.drawText(rating, {
        x: 50 + columnWidths[0] + columnWidths[1] + cellPadding * 2,
        y: dynamicRowY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      const amt =
        data?.amount !== null && data?.amount !== undefined
          ? typeof data.amount === "number"
            ? data.amount.toString()
            : data.amount
          : "";

      firstPage.drawText(amt, {
        x:
          50 +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          cellPadding * 3,
        y: dynamicRowY,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`Total - ${amt}`, {
        x: 50 + columnWidths[0] + columnWidths[1] + cellPadding * 2,
        y: 350,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      // Save the updated PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      setGeneratedPdf(URL.createObjectURL(pdfBlob));

      // Optionally download the generated PDF
      type === "save" && saveAs(pdfBlob, "Updated_Receipt.pdf");
    },
    [data]
  );
  const updateState = (e) => {
    const { name, value } = e.target;

    setData((prevData) => {
      // Use the new value if the field being updated is sessions or rate
      const sessions = name === "sessions" ? value : prevData.sessions;
      const rate = name === "rate" ? value : prevData.rate;

      // Calculate the new amount
      const newAmount = sessions && rate ? sessions * rate : prevData.amount;

      return {
        ...prevData,
        [name]: value, // Update the input field value
        amount: newAmount, // Update the amount based on the new or existing values
      };
    });
  };

  useEffect(() => {
    handleFormSubmit();
  }, [data, handleFormSubmit]);

  return (
    <div style={{ display: "flex", overflow: "hidden" }}>
      {/* PDF preview on the left */}
      {/* <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        <iframe
          src={generatedPdf}
          width="100%"
          height="100%"
          style={{ border: "none", height: "600px" }}
          sandbox="allow-scripts" // Disables default PDF controls
        />
      </div> */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          height: "95vh",
        }}
      >
        <object
          data={generatedPdf}
          type="application/pdf"
          width="100%"
          height="600px"
          style={{ border: "none" }}
        >
          <p>
            Your browser does not support PDFs.{" "}
            <a href={generatedPdf}>Download the PDF</a>.
          </p>
        </object>
      </div>

      {/* Form on the right */}
      <div
        style={{
          width: "50%",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          height: "80vh",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div className="input-section">
          <label>Patient Name:</label>
          <input
            type="text"
            value={data.patientName}
            pattern="([A-Z|a-z])\w+"
            name="patientName"
            // onChange={(e) => setData({ ...data, 'patientName': e.target.value })}
            onChange={updateState}
            required
          />
        </div>
        <div className="multiple-input">
          <div className="input-section">
            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={data.ageGender}
              onChange={updateState}
              required
            />
          </div>
          <div className="input-section">
            <label>Gender:</label>
            <div className="gender_section">
              <label className="radio-gender">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={data.gender === "male"}
                  onChange={updateState}
                  style={{ width: "auto" }}
                />
                Male
              </label>
              <label className="radio-gender">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={data.gender === "female"}
                  onChange={updateState}
                  style={{ width: "auto" }}
                />
                Female
              </label>
            </div>
          </div>
        </div>
        <div className="input-section">
          <label>Diagnosis:</label>
          <input
            type="text"
            value={data.diagnosis}
            name="diagnosis"
            onChange={updateState}
            required
          />
        </div>
        <div className="input-section">
          <label>Date:</label>
          <input
            type="date"
            value={data.date}
            name="date"
            onChange={updateState}
            required
          />
        </div>
        <div className="input-section">
          <label>Receipt Number:</label>
          <input
            type="text"
            value={data.receiptNumber}
            name="receiptNumber"
            onChange={updateState}
            required
          />
        </div>
        <div className="input-section">
          <label>Description of treatment:</label>
          <input
            type="text"
            value={data.description}
            name="description"
            onChange={updateState}
            required
          />
        </div>
        <div className="input-section">
          <label>No of sessions:</label>
          <input
            type="number"
            value={data.sessions}
            name="sessions"
            onChange={updateState}
            required
          />
        </div>
        <div className="input-section">
          <label>Rate:</label>
          <input
            type="number"
            value={data.rate}
            name="rate"
            onChange={updateState}
            required
          />
        </div>
        <div className="input-section">
          <label>Amount:</label>
          <input
            type="text"
            disabled
            value={data.amount}
            onChange={(e) =>
              setData({
                ...data,
                amount:
                  data.sessions !== "" && data.rate !== ""
                    ? data.sessions * data.rate
                    : e.target.value,
              })
            }
            required
          />
        </div>
        <button
          type="submit"
          className="download-button"
          onClick={() => handleFormSubmit("save")}
        >
          Download Updated PDF
        </button>
      </div>
    </div>
  );
};

export default EditPdfWithForm;
