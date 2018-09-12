type Platform = 'amazon' | 'apple' | 'google' | 'roku';

interface Payment {
    receipt: any,       // always required
    productId: string,
    packageName: string,
    secret: string,
    subscription?: boolean,
    keyObject?: any,    // required, if google
    userId?: string,    // required, if amazon
    devToken?: string,  // required, if roku
}

interface Response {
    receipt: any,
    platform: Platform,
    productId: string,
    transactionId: string,
    purchaseDate: number,
    expirationDate: number,
}

export function verifyPayment (platform: Platform, payment: Payment, callback: (error: string, response: Response) => void);
