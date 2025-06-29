import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRequetAdminComponent } from './add-requet-admin.component';

describe('AddRequetAdminComponent', () => {
  let component: AddRequetAdminComponent;
  let fixture: ComponentFixture<AddRequetAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRequetAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRequetAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
