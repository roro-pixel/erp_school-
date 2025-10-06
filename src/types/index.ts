export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  classId: string;
  familyId: string;
  parentId: string;
  phoneNumber: string;
  email: string;
}

export interface Family {
  id: string;
  familyName: string;
  address: string;
  phone: string;
  email: string;
}

export interface Parent {
  id: string;
  firstname: string;
  lastname: string;
  relationship: string;
  familyId: string;
  profession: string;
  phone: string;
  email: string;
}

export interface Class {
  id: string;
  name: string;
  levelId: string;
  classDescription: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
}

export interface Fee{
  id: string;
  name: string;
  amount: number;
  feeDescription: string;
  typeFee: string;
  paymentFrequency: string;
  classes: {
      id: string;
      name: string;
      academicYear: string;
    }[];
  effectiveFrom: string;
}

export interface StudentFeeProfile {
  id: string;
  page: number;
  size: number;
  sort: string;
  classId: string;
}

export interface Payment {
  id: string;
  studentFeeProfileId: string;
  feeId: string;
  amount: number;
  quantity: number;
  paymentMethod: string;
  applicablePeriod: string;
  note: string;
}

export interface Invoice {
  id: string;
  studentIds:string;
  feeIds: string;
  dueDate: Date
  notes: string;
}

export interface Document {
  id: string;
  file: string;
  documentType: string;
  entityType: string;
  entityId: string;
  description: string;
}


export interface StudentResponse {
  id: string;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: string;
  studentId: string;
  classes: string;
  active: boolean;
  family: string;
  studentEmail?: string;
  studentPhone?: string;
  parentFirstname: string;
  parentLastname: string;
  parentPhone: string;
  parentEmail: string;
  relationship: string;
}

export interface FamilyResponse {
  id: string;
  familyName: string;
  address: string;
  phone: string;
  email?: string;
  students: StudentBasicInfo[];
  parents: ParentBasicInfo[];
}

export interface StudentBasicInfo {
    id: string;
    firstname: string;
    lastname: string;
    classes: string; 
  }

export interface ParentBasicInfo {
  id: string;
  firstname: string;
  lastname: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface ParentResponse {
  id: string;
  firstname: string;
  lastname: string;
  relationship: string;
  familyId: string;
  familyName: string;
  profession?: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassResponse extends Class {
  academicYear: string;
  students: StudentBasicInfo[];
}

export interface LevelResponse extends Level {
  classes: ClassBasicInfo[];
}

export interface ClassBasicInfo {
  id: string;
  name: string;
  academicYear: string;
}

export interface FeeResponse {
  id: string;
  name: string;
  amount: number;
  feeDescription: string;
  typeFee: string;
  paymentFrequency: string;
  classes: ClassBasicInfo[];
  effectiveFrom: string;
}

export interface StudentFeeProfileResponse {
  id: string;
  studentId: string;
  firstname: string;
  lastname: string;
  classes: string;
  family: string;
  parentFirstname: string;
  parentLastname: string;
  parentPhone: string;
  parentEmail: string;
  oustandingAmount: string;
  reduction: string;
}

export interface PaymentResponse {
  id: string;
  studentFeeProfileId: string;
  studentId: string;
  studentFirstname: string;
  classes: string;
  family: string;
  parentFirstname: string;
  feeId: string;
  feeName: string;
  amount: string;
  quantity: number;
  usedPaymentMethod: string;
  academicYear: string;
  applicablePeriod: string;
  recordBy: string;
  isDue: boolean;
  paymentReference: string;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  classes: string;
  familyId: string;
  familyName: string;
  parentName: string;
  parentEmail: string;
  issueDate: string;
  dueDate: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  notes: string;
  academicYear: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

interface InvoiceItem {
  feeId: string;
  feeName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface DocumentResponse {
  documentId: string;
  fileName: string;
  documentType: string;
  contentType: string;
  fileSize: number;
  description: string;
  uploadDate: string;
  verified: boolean;
  verificationDate?: string;
  downloadUrl: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: PageInfo;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    direction: string;
    properties: string;
  };
}

export interface ErrorResponse {
  timestamps: string;
  status: number;
  error: string;
  message: string;
  path: string;
}