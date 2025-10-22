// const nodemailer = require("nodemailer");
// require("dotenv").config();
// const { getCRMToken, saveContactToCRM } = require("../services/crmService");

// const sendMail = async (req, res) => {
//   const data = req.body;
// console.log(data);

//   const emailContent = `

//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER, // your Gmail
//       pass: process.env.EMAIL_PASS, // your app password
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_TO, // your receiving email
//     subject: `New Loan Application - ${data.name}`,
//     html: emailContent,
//   };

//   try {
//     // 1. Send Email
//     await transporter.sendMail(mailOptions);

//     // 2. Prepare CRM Payload
//     const crmPayload = {
//       UnassignedContactList: [
//         {
//           FirstName: "",
//           LastName: "",
//           MobileNumber: "",
//           EmailId: "",
//           Location: "",
//           createddt: "",
//           remarks: "",
//           TotalRows: 0,
//         },
//       ],
//       FirstName: data.name,
//       LastName: "Test",
//       MobileNumber: data.mobileNumber,
//       EmailId: "test@gmail.com",
//       LocationId: "3012",
//       // ReferenceName: "demo",
//       // ProductName: "Loan",
//     };

//     // 3. Get token and save contact to CRM
//     const token = await getCRMToken();
//     await saveContactToCRM(crmPayload, token);

//     res.status(200).json({ message: "Email and CRM submission successful!" });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Failed to send email or submit to CRM" });
//   }
// };

// module.exports = { sendMail };

// const sendMail = async (req, res) => {
//   const data = req.body;

//   const emailContent = `

//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const crmPayload = {
//     UnassignedContactList: [
//       {
//         FirstName: "",
//         LastName: "",
//         MobileNumber: "",
//         EmailId: "",
//         Location: "",
//         createddt: "",
//         remarks: "",
//         TotalRows: 0,
//       },
//     ],
//     FirstName: data.name,
//     LastName: "Test",
//     MobileNumber: data.mobileNumber,
//     EmailId: "test@gmail.com",
//     LocationId: "3012",
//     ReferenceName: "demo",
//     ProductName: "Loan",
//   };

//   try {
//     const token = await getCRMToken();
//     await saveContactToCRM(crmPayload, token);
//   } catch (err) {
//     return res.status(500).json({ message: "CRM submission failed" });
//   }

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_TO,
//     subject: `New Loan Application - ${data.name}`,
//     html: emailContent,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Email sent successfully!" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ message: "Failed to send email" });
//   }
// };

// module.exports = { sendMail };

const nodemailer = require("nodemailer");
require("dotenv").config();
const { getCRMToken, saveContactToCRM } = require("../services/crmService");

const sendMail = async (req, res) => {
  const data = req.body;
  console.log(data);

  const emailContent = `
     <h3>New Loan Request</h3>
    <p><strong>First Name:</strong> ${data.FirstName}</p>
  <p><strong>Last Name:</strong> ${data.LastName}</p>
  <p><strong>Mobile Number:</strong> ${data.MobileNumber}</p>
    <p><strong>Loan Type:</strong> ${data.loanType}</p>
    <p><strong>Email Id:</strong> ${data.EmailId}</p>
    <p><strong>Company Name:</strong> ${data.companyName}</p>
     <p><strong>Location:</strong> ${data.LocationId}</p>
    <p><strong>Loan Amount:</strong> ${data.loanAmount}</p>
    <p><strong>Gross Annual Income:</strong> ${data.grossAnnualIncome}</p>
     <p><strong>Nature Of Business:</strong> ${data.natureOfBusiness}</p>
      <p><strong>Business Account:</strong> ${data.businessAccount}</p>
      <p><strong>Yearly Turnover:</strong> ${data.yearlyTurnover}</p>

      <p><strong>Net Profit:</strong> ${data.netProfit}</p>`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: `New Loan Application - ${data.name}`,
    html: emailContent,
  };
  const crmPayload = {
    UnassignedContactList: [
      {
        FirstName: "",
        LastName: "",
        MobileNumber: "",
        EmailId: "",
        Location: "",
        createddt: "",
        remarks: "",
        TotalRows: 0,
      },
    ],
    FirstName: data.FirstName,
    LastName: data.LastName,
    MobileNumber: data.MobileNumber,
    EmailId: data.EmailId,
    LocationId: data.LocationId,
    // ReferenceName: "hghgvhvghv",
    // ProductName: data.ProductName,
  };

  try {
    const token = await getCRMToken();
    await saveContactToCRM(crmPayload, token);
  } catch (err) {
    return res.status(500).json({ message: "CRM submission failed" });
  }

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

module.exports = { sendMail };
