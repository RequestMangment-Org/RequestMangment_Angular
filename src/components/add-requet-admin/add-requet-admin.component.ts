import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestServiceService } from '../../Service/RequestService/request-service.service';
import { Router } from '@angular/router';
import { ApplicationRequest } from '../../Interfaces/ApplicationRequest';
import { environment } from '../../environments/environments';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-requet-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-requet-admin.component.html',
  styleUrl: './add-requet-admin.component.css'
})
export class AddRequetAdminComponent implements OnInit {
  @Output() requestSubmitted = new EventEmitter<void>(); 
  requestForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  visaFile: File | null = null;
  approvalFile: File | null = null;
  identityDocument: File | null = null;
  passportCopy: File | null = null;
  officialPermissionLetter: File | null = null;
  paymentReceipt: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isEditMode = false;
  currentRequestId: number | null = null;
  visaFilePath: string | null = null;
  approvalFilePath: string | null = null;
  identityDocumentPath: string | null = null;
  passportCopyPath: string | null = null;
  officialPermissionLetterPath: string | null = null;
  paymentReceiptPath: string | null = null;

  constructor(
    private fb: FormBuilder,
    private requestService: RequestServiceService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^05[0-9]{8}$')]],
      birthDate: ['', [Validators.required, this.pastDateValidator(), this.maxAgeValidator(100)]],
      isInClub: [false],
      clubName: ['', [Validators.maxLength(100)]],
      hasSchengenVisa: [false],
      visaFile: [null],
      hasParentApproval: [false],
      approvalFile: [null],
      subscription: [false, [Validators.required]],
      identityDocument: [null],
      passportCopy: [null],
      officialPermissionLetter: [null],
      paymentReceipt: [null]
    });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.fullName && user.phoneNumber) {
          this.requestForm.patchValue({
            fullName: user.fullName,
            phoneNumber: user.phoneNumber
          });
          if (user.phoneNumber) {
            this.loadExistingRequest(user.phoneNumber);
          }
        } else {
          console.warn('Invalid user data in localStorage');
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    this.OnSelectionChange();
    this.updateFileValidation();
  }

  startNewRequest(): void {
    this.isEditMode = false;
    this.currentRequestId = null;
    this.resetForm();
  }

  private loadExistingRequest(phoneNumber: string): void {
    this.isLoading = true;
    this.requestService.getRequestByPhone(phoneNumber).subscribe({
      next: (request) => {
        this.isEditMode = true;
        this.currentRequestId = request.id ?? null;
        this.populateForm(request);
        this.updateFileValidation();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private populateForm(request: ApplicationRequest): void {
    this.requestForm.patchValue({
      fullName: request.fullName,
      phoneNumber: request.phoneNumber,
      birthDate: this.formatDate(request.birthDate),
      isInClub: request.isInClub,
      clubName: request.clubName || '',
      hasSchengenVisa: request.hasSchengenVisa,
      hasParentApproval: request.hasParentApproval,
      subscription: request.subscription,
      identityDocument: null,
      passportCopy: null,
      officialPermissionLetter: null,
      paymentReceipt: null
    });
    this.visaFilePath = request.visaFilePath ?? null;
    this.approvalFilePath = request.approvalFilePath ?? null;
    this.identityDocumentPath = request.identityDocumentPath ?? null;
    this.passportCopyPath = request.passportCopyPath ?? null;
    this.officialPermissionLetterPath = request.officialPermissionLetterPath ?? null;
    this.paymentReceiptPath = request.paymentReceiptPath ?? null;
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private updateFileValidation(): void {
    const visaFileControl = this.requestForm.get('visaFile');
    const approvalFileControl = this.requestForm.get('approvalFile');
    const identityDocumentControl = this.requestForm.get('identityDocument');
    const passportCopyControl = this.requestForm.get('passportCopy');
    const officialPermissionLetterControl = this.requestForm.get('officialPermissionLetter');
    const paymentReceiptControl = this.requestForm.get('paymentReceipt');

    if (this.requestForm.get('hasSchengenVisa')?.value) {
      if (this.isEditMode && this.visaFilePath) {
        visaFileControl?.clearValidators();
      } else {
        visaFileControl?.setValidators([Validators.required]);
      }
    } else {
      visaFileControl?.clearValidators();
    }
    visaFileControl?.updateValueAndValidity();

    if (this.requestForm.get('hasParentApproval')?.value) {
      if (this.isEditMode && this.approvalFilePath) {
        approvalFileControl?.clearValidators();
      } else {
        approvalFileControl?.setValidators([Validators.required]);
      }
    } else {
      approvalFileControl?.clearValidators();
    }
    approvalFileControl?.updateValueAndValidity();

    if (this.requestForm.get('subscription')?.value) {
      if (this.isEditMode && this.identityDocumentPath) {
        identityDocumentControl?.clearValidators();
      } else {
        identityDocumentControl?.setValidators([Validators.required]);
      }
      if (this.isEditMode && this.passportCopyPath) {
        passportCopyControl?.clearValidators();
      } else {
        passportCopyControl?.setValidators([Validators.required]);
      }
      if (this.isEditMode && this.paymentReceiptPath) {
        paymentReceiptControl?.clearValidators();
      } else {
        paymentReceiptControl?.setValidators([Validators.required]);
      }
      officialPermissionLetterControl?.setValidators([]); // Optional field
    } else {
      identityDocumentControl?.clearValidators();
      passportCopyControl?.clearValidators();
      officialPermissionLetterControl?.clearValidators();
      paymentReceiptControl?.clearValidators();
    }
    identityDocumentControl?.updateValueAndValidity();
    passportCopyControl?.updateValueAndValidity();
    officialPermissionLetterControl?.updateValueAndValidity();
    paymentReceiptControl?.updateValueAndValidity();
  }

  OnSelectionChange() {
    this.requestForm.get('isInClub')?.valueChanges.subscribe((isInClub) => {
      const clubNameControl = this.requestForm.get('clubName');
      if (isInClub) {
        clubNameControl?.setValidators([Validators.required]);
      } else {
        clubNameControl?.clearValidators();
        clubNameControl?.setValue(null);
      }
      clubNameControl?.updateValueAndValidity();
    });

    this.requestForm.get('hasSchengenVisa')?.valueChanges.subscribe((hasSchengenVisa) => {
      const visaFileControl = this.requestForm.get('visaFile');
      if (hasSchengenVisa) {
        if (!this.isEditMode || !this.visaFilePath) {
          visaFileControl?.setValidators([Validators.required]);
        } else {
          visaFileControl?.clearValidators();
        }
      } else {
        visaFileControl?.clearValidators();
        visaFileControl?.setValue(null);
        this.visaFile = null;
        this.visaFilePath = null;
      }
      visaFileControl?.updateValueAndValidity();
    });

    this.requestForm.get('hasParentApproval')?.valueChanges.subscribe((hasParentApproval) => {
      const approvalFileControl = this.requestForm.get('approvalFile');
      if (hasParentApproval) {
        if (!this.isEditMode || !this.approvalFilePath) {
          approvalFileControl?.setValidators([Validators.required]);
        } else {
          approvalFileControl?.clearValidators();
        }
      } else {
        approvalFileControl?.clearValidators();
        approvalFileControl?.setValue(null);
        this.approvalFile = null;
        this.approvalFilePath = null;
      }
      approvalFileControl?.updateValueAndValidity();
    });

    this.requestForm.get('subscription')?.valueChanges.subscribe((subscription) => {
      const identityDocumentControl = this.requestForm.get('identityDocument');
      const passportCopyControl = this.requestForm.get('passportCopy');
      const officialPermissionLetterControl = this.requestForm.get('officialPermissionLetter');
      const paymentReceiptControl = this.requestForm.get('paymentReceipt');

      if (subscription) {
        if (!this.isEditMode || !this.identityDocumentPath) {
          identityDocumentControl?.setValidators([Validators.required]);
        }
        if (!this.isEditMode || !this.passportCopyPath) {
          passportCopyControl?.setValidators([Validators.required]);
        }
        if (!this.isEditMode || !this.paymentReceiptPath) {
          paymentReceiptControl?.setValidators([Validators.required]);
        }
        officialPermissionLetterControl?.setValidators([]); // Optional
      } else {
        identityDocumentControl?.clearValidators();
        passportCopyControl?.clearValidators();
        officialPermissionLetterControl?.clearValidators();
        paymentReceiptControl?.clearValidators();
        identityDocumentControl?.setValue(null);
        passportCopyControl?.setValue(null);
        officialPermissionLetterControl?.setValue(null);
        paymentReceiptControl?.setValue(null);
        this.identityDocument = null;
        this.passportCopy = null;
        this.officialPermissionLetter = null;
        this.paymentReceipt = null;
        this.identityDocumentPath = null;
        this.passportCopyPath = null;
        this.officialPermissionLetterPath = null;
        this.paymentReceiptPath = null;
      }
      identityDocumentControl?.updateValueAndValidity();
      passportCopyControl?.updateValueAndValidity();
      officialPermissionLetterControl?.updateValueAndValidity();
      paymentReceiptControl?.updateValueAndValidity();
    });
  }

  pastDateValidator() {
    return (control: any) => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      return selectedDate <= today ? null : { futureDate: true };
    };
  }

  maxAgeValidator(maxYears: number) {
    return (control: any) => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      const maxDate = new Date(today.getFullYear() - maxYears, today.getMonth(), today.getDate());
      return selectedDate >= maxDate ? null : { tooOld: true };
    };
  }

  onFileChange(event: Event, field: 'visaFile' | 'approvalFile' | 'identityDocument' | 'passportCopy' | 'officialPermissionLetter' | 'paymentReceipt'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = `حجم ملف ${this.getFieldLabel(field)} يتجاوز 5 ميغابايت`;
        this.requestForm.get(field)?.setValue(null);
        this.clearFile(field);
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        this.errorMessage = `صيغة ملف ${this.getFieldLabel(field)} غير مدعومة (يجب أن تكون PDF, JPG, PNG)`;
        this.requestForm.get(field)?.setValue(null);
        this.clearFile(field);
        return;
      }
      this.requestForm.get(field)?.setValue(file);
      this.setFile(field, file);
      this.errorMessage = null;
    } else {
      this.requestForm.get(field)?.setValue(null);
      this.clearFile(field);
    }
    this.updateFileValidation();
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      visaFile: 'تأشيرة الشنغن',
      approvalFile: 'موافقة ولي الأمر',
      identityDocument: 'وثيقة الهوية',
      passportCopy: 'نسخة جواز السفر',
      officialPermissionLetter: 'خطاب الإذن الرسمي',
      paymentReceipt: 'إيصال الدفع'
    };
    return labels[field] || field;
  }

  private setFile(field: string, file: File): void {
    switch (field) {
      case 'visaFile':
        this.visaFile = file;
        this.visaFilePath = null;
        break;
      case 'approvalFile':
        this.approvalFile = file;
        this.approvalFilePath = null;
        break;
      case 'identityDocument':
        this.identityDocument = file;
        this.identityDocumentPath = null;
        break;
      case 'passportCopy':
        this.passportCopy = file;
        this.passportCopyPath = null;
        break;
      case 'officialPermissionLetter':
        this.officialPermissionLetter = file;
        this.officialPermissionLetterPath = null;
        break;
      case 'paymentReceipt':
        this.paymentReceipt = file;
        this.paymentReceiptPath = null;
        break;
    }
  }

  private clearFile(field: string): void {
    switch (field) {
      case 'visaFile':
        this.visaFile = null;
        break;
      case 'approvalFile':
        this.approvalFile = null;
        break;
      case 'identityDocument':
        this.identityDocument = null;
        break;
      case 'passportCopy':
        this.passportCopy = null;
        break;
      case 'officialPermissionLetter':
        this.officialPermissionLetter = null;
        break;
      case 'paymentReceipt':
        this.paymentReceipt = null;
        break;
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.updateFileValidation();

    if (this.requestForm.invalid) {
      this.isLoading = false;
      console.log('Form is invalid:', this.requestForm.errors);
      return;
    }

    this.isLoading = true;

    const requestData: ApplicationRequest = {
      id: this.currentRequestId ?? undefined,
      fullName: this.requestForm.get('fullName')?.value,
      phoneNumber: this.requestForm.get('phoneNumber')?.value,
      birthDate: new Date(this.requestForm.get('birthDate')?.value),
      isInClub: this.requestForm.get('isInClub')?.value,
      clubName: this.requestForm.get('clubName')?.value || null,
      hasSchengenVisa: this.requestForm.get('hasSchengenVisa')?.value,
      hasParentApproval: this.requestForm.get('hasParentApproval')?.value,
      subscription: this.requestForm.get('subscription')?.value,
      visaFilePath: this.cleanFilePath(this.visaFilePath),
      approvalFilePath: this.cleanFilePath(this.approvalFilePath),
      identityDocumentPath: this.cleanFilePath(this.identityDocumentPath),
      passportCopyPath: this.cleanFilePath(this.passportCopyPath),
      officialPermissionLetterPath: this.cleanFilePath(this.officialPermissionLetterPath),
      paymentReceiptPath: this.cleanFilePath(this.paymentReceiptPath),
      submissionDate: new Date()
    };

    if (this.visaFile || this.approvalFile || this.identityDocument || this.passportCopy || this.officialPermissionLetter || this.paymentReceipt) {
      this.requestService.UploadFiles(
        this.visaFile,
        this.approvalFile,
        this.identityDocument,
        this.passportCopy,
        this.officialPermissionLetter,
        this.paymentReceipt
      ).subscribe({
        next: (response) => {
          requestData.visaFilePath = this.cleanFilePath(response.visaFilePath) ?? this.cleanFilePath(this.visaFilePath);
          requestData.approvalFilePath = this.cleanFilePath(response.approvalFilePath) ?? this.cleanFilePath(this.approvalFilePath);
          requestData.identityDocumentPath = this.cleanFilePath(response.identityDocumentPath) ?? this.cleanFilePath(this.identityDocumentPath);
          requestData.passportCopyPath = this.cleanFilePath(response.passportCopyPath) ?? this.cleanFilePath(this.passportCopyPath);
          requestData.officialPermissionLetterPath = this.cleanFilePath(response.officialPermissionLetterPath) ?? this.cleanFilePath(this.officialPermissionLetterPath);
          requestData.paymentReceiptPath = this.cleanFilePath(response.paymentReceiptPath) ?? this.cleanFilePath(this.paymentReceiptPath);
          this.processRequest(requestData);
        },
        error: (error) => {
          this.handleError('فشل رفع الملفات: ', error);
        }
      });
    } else {
      this.processRequest(requestData);
    }     this.router.navigate(['/admin/requests']);

  }

  private cleanFilePath(filePath: string | null | undefined): string | null {
    if (!filePath) return null;
    return filePath.replace(environment.url, '');
  }

  private processRequest(request: ApplicationRequest): void {
    const cleanedRequest = {
      ...request,
      visaFilePath: this.cleanFilePath(request.visaFilePath),
      approvalFilePath: this.cleanFilePath(request.approvalFilePath),
      identityDocumentPath: this.cleanFilePath(request.identityDocumentPath),
      passportCopyPath: this.cleanFilePath(request.passportCopyPath),
      officialPermissionLetterPath: this.cleanFilePath(request.officialPermissionLetterPath),
      paymentReceiptPath: this.cleanFilePath(request.paymentReceiptPath)
    };

    if (this.isEditMode && this.currentRequestId) {
      this.requestService.updateRequest(this.currentRequestId, cleanedRequest).subscribe({
        next: (response) => {
          this.handleSuccess('تم تحديث الطلب بنجاح!');
        },
        error: (error) => {
          this.handleError('فشل تحديث الطلب: ', error);
        }
      });
    } else {
      this.requestService.submitRequest(cleanedRequest).subscribe({
        next: (response) => {
          this.handleSuccess('تم تقديم الطلب بنجاح!');
        },
        error: (error) => {
          this.handleError('فشل تقديم الطلب: ', error);
        }
      });
    }
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.successMessage = message;
    this.requestSubmitted.emit(); 
    this.resetForm();
  }

  private handleError(prefix: string, error: any): void {
    this.isLoading = false;
    this.errorMessage = prefix + (error.error?.message || 'حاول مرة أخرى');
  }

  private resetForm(): void {
    this.requestForm.reset({
      isInClub: false,
      hasSchengenVisa: false,
      hasParentApproval: false,
      subscription: false
    });
    this.visaFile = null;
    this.approvalFile = null;
    this.identityDocument = null;
    this.passportCopy = null;
    this.officialPermissionLetter = null;
    this.paymentReceipt = null;
    this.visaFilePath = null;
    this.approvalFilePath = null;
    this.identityDocumentPath = null;
    this.passportCopyPath = null;
    this.officialPermissionLetterPath = null;
    this.paymentReceiptPath = null;
    this.isSubmitted = false;
  }

  isImageFile(filePath: string | null): boolean {
    if (!filePath) return false;
    return filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png');
  }
    toggleSubscription() {
  const currentValue = this.requestForm.get('subscription')?.value;
  this.requestForm.get('subscription')?.setValue(!currentValue);
  
  
  this.requestForm.updateValueAndValidity();
}
copyAccountNumber() {
  const accountNumber = document.getElementById('accountToCopy')?.textContent;
  if (accountNumber) {
    navigator.clipboard.writeText(accountNumber)
      .then(() => {
        
        const btn = document.querySelector('.copy-btn') as HTMLElement;
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ!';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 10000);
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('حدث خطأ أثناء محاولة النسخ');
      });
  }
}
}