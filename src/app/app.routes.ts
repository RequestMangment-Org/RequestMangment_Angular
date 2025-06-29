
import { Routes } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { AboutComponentComponent } from '../components/about-component/about-component.component';
import { RegisterComponentComponent } from '../components/register-component/register-component.component';
import { RequestComponent } from '../components/request/request.component';
import { RequestGuard } from '../Gurds/rquest.guard';
import { DashboardComponent } from '../components/Admin-Dashboard/dashboard/dashboard.component';
import { DisplyRequestsComponent } from '../components/Admin-Dashboard/disply-requests/disply-requests.component';
import { AboutUsListComponent } from '../components/Admin-Dashboard/about-us-list/about-us-list.component';
import { LoginComponent } from '../components/login/login.component';
import { authGuard } from '../Gurds/auth.guard';
import { UserRquestComponent } from '../components/user-rquest/user-rquest.component';
import { EditRequestComponent } from '../components/Admin-Dashboard/edit-request/edit-request.component';
import { AboutUsFormComponent } from '../components/Admin-Dashboard/about-us-form/about-us-form.component';



export const routes: Routes = [
  {
    path: '',
    component: HeaderComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'about' },
      { path: 'about', component: AboutComponentComponent },
      { path: 'user-login', component: RegisterComponentComponent },
      { path: 'request-order', component: RequestComponent },
      { path: 'userRequest', component: UserRquestComponent },
    ],
  },
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [authGuard],

    children: [
      { path: '', pathMatch: 'full', redirectTo: 'requests' },
      { path: 'requests', component: DisplyRequestsComponent },
      { path: 'about-us', component: AboutUsListComponent },
      { path: 'about-us/add', component: AboutUsFormComponent },
      { path: 'about-us/edit/:id', component: AboutUsFormComponent },
      { path: 'edit-request/:id', component: EditRequestComponent }

    ],
  },
    { path: 'login', component:LoginComponent }, 

  { path: '**', redirectTo: '' }, 
];

