declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }
  export function createTransport(options: any): Transporter;
  export function getTestMessageUrl(info: any): string;
  const nodemailer: {
    createTransport(options: any): Transporter;
    getTestMessageUrl(info: any): string;
  };
  export default nodemailer;
}
