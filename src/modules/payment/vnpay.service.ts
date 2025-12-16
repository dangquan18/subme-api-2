import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

@Injectable()
export class VnpayService {
  private vnp_TmnCode: string;
  private vnp_HashSecret: string;
  private vnp_Url: string;
  private vnp_ReturnUrl: string;

  constructor(private configService: ConfigService) {
    this.vnp_TmnCode = this.configService.get<string>('VNP_TMN_CODE');
    this.vnp_HashSecret = this.configService.get<string>('VNP_HASH_SECRET');
    this.vnp_Url = this.configService.get<string>('VNP_URL');
    this.vnp_ReturnUrl = this.configService.get<string>('VNP_RETURN_URL');
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  createPaymentUrl(
    orderId: string,
    amount: number,
    orderInfo: string,
    ipAddr: string,
  ): string {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 phút

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPay yêu cầu amount * 100
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sắp xếp params theo thứ tự alphabet
    vnp_Params = this.sortObject(vnp_Params);

    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    return this.vnp_Url + '?' + new URLSearchParams(vnp_Params).toString();
  }

  /**
   * Verify return từ VNPay
   */
  verifyReturnUrl(vnpParams: any): { isValid: boolean; message: string } {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      // Kiểm tra response code
      if (vnpParams['vnp_ResponseCode'] === '00') {
        return {
          isValid: true,
          message: 'Thanh toán thành công',
        };
      } else {
        return {
          isValid: false,
          message: 'Thanh toán thất bại',
        };
      }
    } else {
      return {
        isValid: false,
        message: 'Chữ ký không hợp lệ',
      };
    }
  }

  /**
   * Format date to YYYYMMDDHHmmss
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Sort object by key
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }
}
