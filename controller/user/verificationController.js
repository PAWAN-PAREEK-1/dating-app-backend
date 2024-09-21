import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../../models/user.js";

export const genrateVerificationToken = (user, email) => {
  const payload = { user, email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
};

export const sendVerficationEmail = (user, token) => {
  const verifiacationLink = `http://localhost:8080/api/user/auth/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail password (use an app password if 2FA is enabled)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS, // Your Gmail address
    to: user.email,
    subject: "Verify Your Email",
    text: `Click this link to verify your email: ${verifiacationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    }
  });
};

export const sendForgotPasswordEmail = (user, token) => {
  const verifiacationLink = `http://localhost:8080/public/reset?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail password (use an app password if 2FA is enabled)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS, // Your Gmail address
    to: user.email,
    subject: "Reset Your Password",
    text: `Click this link to change your password: ${verifiacationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    }
  });
};


export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    const { user, email } = decoded;

    const findUser = await User.findById(user);

    if (!findUser) {
      return res.status(400).json({ message: "please register first" });
    }

    if (findUser.email != email) {
      return res.status(400).json({ message: "User Email not register" });
    }

    if (findUser.isEmailVerified === true) {
      return res.status(400).json({ message: "User is already verified" });
    }

    findUser.isEmailVerified = true;

    await findUser.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};


