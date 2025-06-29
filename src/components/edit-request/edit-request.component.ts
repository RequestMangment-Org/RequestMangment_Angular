import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RequestServiceService } from '../../Service/RequestService/request-service.service';
import { ApplicationRequest } from '../../Interfaces/ApplicationRequest';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environments';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-edit-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MessageModule,CheckboxModule,
    ButtonModule, 
    InputTextModule, 
    CardModule  ],
  templateUrl: './edit-request.component.html',
  styleUrls: ['./edit-request.component.css'],
  providers: [DatePipe]
})
export class EditRequestComponent implements OnInit {
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
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe
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
    this.route.paramMap.subscribe(params => {
     
      const id = params.get('id');
      if (id) {
        this.currentRequestId = +id;
        this.loadRequestById(this.currentRequestId);
      } else {
        this.errorMessage = 'معرف الطلب غير موجود';
        this.router.navigate(['/requests']);
      }
    });
    this.OnSelectionChange();
    this.updateFileValidation();
  }

  private loadRequestById(id: number): void {
    this.isLoading = true;
    this.requestService.getRequestById(id).subscribe({
      next: (request) => {
        this.populateForm(request);
        this.updateFileValidation();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'فشل تحميل الطلب';
        this.router.navigate(['/requests']);
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
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  private updateFileValidation(): void {
    const visaFileControl = this.requestForm.get('visaFile');
    const approvalFileControl = this.requestForm.get('approvalFile');
    const identityDocumentControl = this.requestForm.get('identityDocument');
    const passportCopyControl = this.requestForm.get('passportCopy');
    const officialPermissionLetterControl = this.requestForm.get('officialPermissionLetter');
    const paymentReceiptControl = this.requestForm.get('paymentReceipt');

    if (this.requestForm.get('hasSchengenVisa')?.value && !this.visaFilePath) {
      visaFileControl?.setValidators([Validators.required]);
    } else {
      visaFileControl?.clearValidators();
    }
    visaFileControl?.updateValueAndValidity();

    if (this.requestForm.get('hasParentApproval')?.value && !this.approvalFilePath) {
      approvalFileControl?.setValidators([Validators.required]);
    } else {
      approvalFileControl?.clearValidators();
    }
    approvalFileControl?.updateValueAndValidity();

    if (this.requestForm.get('subscription')?.value) {
      if (!this.identityDocumentPath) {
        identityDocumentControl?.setValidators([Validators.required]);
      } else {
        identityDocumentControl?.clearValidators();
      }
      if (!this.passportCopyPath) {
        passportCopyControl?.setValidators([Validators.required]);
      } else {
        passportCopyControl?.clearValidators();
      }
      if (!this.paymentReceiptPath) {
        paymentReceiptControl?.setValidators([Validators.required]);
      } else {
        paymentReceiptControl?.clearValidators();
      }
      officialPermissionLetterControl?.setValidators([]); // Optional
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
      if (hasSchengenVisa && !this.visaFilePath) {
        visaFileControl?.setValidators([Validators.required]);
      } else {
        visaFileControl?.clearValidators();
        visaFileControl?.setValue(null);
        this.visaFile = null;
      }
      visaFileControl?.updateValueAndValidity();
    });

    this.requestForm.get('hasParentApproval')?.valueChanges.subscribe((hasParentApproval) => {
      const approvalFileControl = this.requestForm.get('approvalFile');
      if (hasParentApproval && !this.approvalFilePath) {
        approvalFileControl?.setValidators([Validators.required]);
      } else {
        approvalFileControl?.clearValidators();
        approvalFileControl?.setValue(null);
        this.approvalFile = null;
      }
      approvalFileControl?.updateValueAndValidity();
    });

    this.requestForm.get('subscription')?.valueChanges.subscribe((subscription) => {
      const identityDocumentControl = this.requestForm.get('identityDocument');
      const passportCopyControl = this.requestForm.get('passportCopy');
      const officialPermissionLetterControl = this.requestForm.get('officialPermissionLetter');
      const paymentReceiptControl = this.requestForm.get('paymentReceipt');

      if (subscription) {
        if (!this.identityDocumentPath) {
          identityDocumentControl?.setValidators([Validators.required]);
        }
        if (!this.passportCopyPath) {
          passportCopyControl?.setValidators([Validators.required]);
        }
        if (!this.paymentReceiptPath) {
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
          this.updateRequest(requestData);
        },
        error: (error) => {
          this.handleError('فشل رفع الملفات: ', error);
        }
      });
    } else {
      this.updateRequest(requestData);
    }
  }

  private cleanFilePath(filePath: string | null | undefined): string | null {
    if (!filePath) return null;
    return filePath.replace(environment.url, '');
  }

  private updateRequest(request: ApplicationRequest): void {
    if (!this.currentRequestId) {
      this.handleError('معرف الطلب غير موجود: ', {});
      return;
    }

    const cleanedRequest = {
      ...request,
      visaFilePath: this.cleanFilePath(request.visaFilePath),
      approvalFilePath: this.cleanFilePath(request.approvalFilePath),
      identityDocumentPath: this.cleanFilePath(request.identityDocumentPath),
      passportCopyPath: this.cleanFilePath(request.passportCopyPath),
      officialPermissionLetterPath: this.cleanFilePath(request.officialPermissionLetterPath),
      paymentReceiptPath: this.cleanFilePath(request.paymentReceiptPath)
    };

    this.requestService.updateRequest(this.currentRequestId, cleanedRequest).subscribe({
      next: () => {
        this.handleSuccess('تم تحديث الطلب بنجاح!');
      },
      error: (error) => {
        this.handleError('فشل تحديث الطلب: ', error);
      }
    });
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.successMessage = message;
  
  }

  private handleError(prefix: string, error: any): void {
    this.isLoading = false;
    this.errorMessage = prefix + (error.error?.message || 'حاول مرة أخرى');
  }


  isImage(filePath: string | null): boolean {
    if (!filePath) return false;
    return (
      filePath.toLowerCase().endsWith('.jpg') ||
      filePath.toLowerCase().endsWith('.jpeg') ||
      filePath.toLowerCase().endsWith('.png') ||
      filePath.toLowerCase().endsWith('.gif')
    );
  }

  isPdf(filePath: string | null): boolean {
    if (!filePath) return false;
    return filePath.toLowerCase().endsWith('.pdf');
  }

  openInNewTab(url: string): void {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }
}