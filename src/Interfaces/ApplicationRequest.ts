export interface ApplicationRequest  {
  id?: number;
  fullName: string;
  birthDate: Date;
  phoneNumber: string;
  isInClub: boolean;
  clubName?: string | null;
  hasSchengenVisa: boolean;
  visaFilePath?: string | null;
  hasParentApproval: boolean;
  approvalFilePath?: string | null;
   subscription: boolean; 
  identityDocumentPath?: string | null; 
  passportCopyPath?: string | null;
  officialPermissionLetterPath?: string | null; 
  paymentReceiptPath?: string | null; 
  submissionDate?: Date;
}
