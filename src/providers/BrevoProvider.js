// example Provider
// https://github.com/getbrevo/brevo-node
const brevo = require('@getbrevo/brevo');
import { env } from '~/config/environment';
/**
 * Có thể xem thêm phần docs cấu hình theo từng ngôn ngữ khác nhau tùy dự á ở Brevo Dashboard > Account > SMTP&API > API Keys
 */
// Nếu sai thì sửa thử ở đây
let apiInstance = new brevo.TransactionalEmailsApi();

let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, customHTMLContent) => {
  // Khởi tạo 1 cái sendSmtpEmail với các thông tin cần thiết
  let sendSmtpEmail = new brevo.SendSmtpEmail();

  // Tài khoản gửi mail: phải là email tạo tài khoản trên Brevo
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME };

  // Những tài khoản nhận email
  // 'to' phải là 1 array để sau chúng ta có thể tùy biến gửi 1 email tới nhiều user tùy tình năng dự án
  sendSmtpEmail.to = [{ email: recipientEmail }];

  // Tiêu đề của email:
  sendSmtpEmail.subject = customSubject;

  // Nội dung email dạng html :
  sendSmtpEmail.htmlContent = customHTMLContent;

  // Gọi hành động gửi mail
  // thằng sendTransacEmail của thư viện return 1 Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export const BrevoProvider = {
  sendEmail
};
