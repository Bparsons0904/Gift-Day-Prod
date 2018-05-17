export interface User {
    uid: string;
    email: string;
    grade?: string;
    displayName?: string;
    school?: string;
    photoURL?: string;
    id?: string;
    // firstName?: string;
    // lastName?: string;
    // phone?: string;
    // balance?: number;
    admin?: boolean;
    workshops: any[];

}
