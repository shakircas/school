import nodemailer from "nodemailer";

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendStudentCredentials({ name, email, password, phone }) {
  /* ---------- EMAIL ---------- */

  if (email) {
    await transporter.sendMail({
      from: `"EduManage" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Student Login Credentials",
      html: `
        <h3>Welcome ${name}</h3>
        <p>Your student account has been created.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>
        <p>Please change your password after first login.</p>
      `,
    });
  }

  /* ---------- SMS (OPTIONAL) ---------- */
  if (phone) {
    await sendSMS(
      phone,
      `EduManage Login:\nEmail: ${email}\nPassword: ${password}`
    );
  }
}

/* ================= SMS PROVIDER ================= */

async function sendSMS(phone, message) {
  // Integrate any Pakistani SMS API:
  // Zong / Jazz / Telenor / Twilio
  console.log("SMS SENT TO:", phone, message);
}
