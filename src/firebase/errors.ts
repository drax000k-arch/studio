
export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};

const FIRESTORE_PERMISSION_ERROR_NAME = 'FirestorePermissionError';

export class FirestorePermissionError extends Error {
    context: SecurityRuleContext;
    
    constructor(context: SecurityRuleContext) {
        const message = `FirestorePermissionError: Insufficient permissions for ${context.operation} on ${context.path}`;
        super(message);
        this.name = FIRESTORE_PERMISSION_ERROR_NAME;
        this.context = context;
        
        // This is to make the error serializable for the Next.js dev overlay
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
