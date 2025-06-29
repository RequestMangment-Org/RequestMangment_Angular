import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { ApplicationRequest } from '../../Interfaces/ApplicationRequest';
import { environment } from '../../environments/environments';
@Injectable({
  providedIn: 'root'
})
export class RequestServiceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  UploadFiles(
    visaFile: File | null,
    approvalFile: File | null,
    identityDocument: File | null,
    passportCopy: File | null,
    officialPermissionLetter: File | null,
    paymentReceipt: File | null
  ): Observable<{
    visaFilePath?: string | null,
    approvalFilePath?: string | null,
    identityDocumentPath?: string | null,
    passportCopyPath?: string | null,
    officialPermissionLetterPath?: string | null,
    paymentReceiptPath?: string | null
  }> {
    const formData = new FormData();
    if (visaFile) formData.append('visaFile', visaFile, visaFile.name);
    if (approvalFile) formData.append('approvalFile', approvalFile, approvalFile.name);
    if (identityDocument) formData.append('identityDocument', identityDocument, identityDocument.name);
    if (passportCopy) formData.append('passportCopy', passportCopy, passportCopy.name);
    if (officialPermissionLetter) formData.append('officialPermissionLetter', officialPermissionLetter, officialPermissionLetter.name);
    if (paymentReceipt) formData.append('paymentReceipt', paymentReceipt, paymentReceipt.name);

    return this.http.post<{
      visaFilePath?: string | null,
      approvalFilePath?: string | null,
      identityDocumentPath?: string | null,
      passportCopyPath?: string | null,
      officialPermissionLetterPath?: string | null,
      paymentReceiptPath?: string | null
    }>(`${this.apiUrl}/UploadFiles`, formData).pipe(
      catchError(error => {
        console.error('Upload error:', error);
        throw 'حدث خطأ أثناء رفع الملفات. يرجى المحاولة مرة أخرى';
      })
    );
  }
  submitRequest(request: ApplicationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Requests`, request);
  }

  getAllRequests(): Observable<ApplicationRequest[]> {
    return this.http.get<ApplicationRequest[]>(`${this.apiUrl}/requests`);
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requests/${id}`);
  }
  getRequestByPhone(phoneNumber: string): Observable<ApplicationRequest> {
    return this.http.get<ApplicationRequest>(`${this.apiUrl}/requests/by-phone/${phoneNumber}`);
  }

  updateRequest(id: number, request: ApplicationRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/requests/${id}`, request);
  }
  getRequestById(id: number): Observable<ApplicationRequest> {
    return this.http.get<ApplicationRequest>(`${this.apiUrl}/requests/${id}`);
  }
}