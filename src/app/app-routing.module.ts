import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

import { HomeComponent } from './components/home/home.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WorkshopsHomeComponent } from './components/workshops-home/workshops-home.component';
import { WorkshopsEditComponent, ConfirmComponent } from './components/workshops-edit/workshops-edit.component';
import { WorkshopsAddComponent } from './components/workshops-add/workshops-add.component';
import { WorkshopDetailsComponent } from './components/workshop-details/workshop-details.component';
import { PresentersDetailsComponent } from './components/presenters-details/presenters-details.component';
import { PresentersAddComponent } from './components/presenters-add/presenters-add.component';
import { PresentersEditComponent, DialogConfirmComponent } from './components/presenters-edit/presenters-edit.component';
import { PresentersHomeComponent } from './components/presenters-home/presenters-home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    // User Profile Addins
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'workshops', component: WorkshopsHomeComponent },
    { path: 'workshops/add', component: WorkshopsAddComponent, canActivate: [AdminGuard] },
    { path: 'workshops/edit/:id', component: WorkshopsEditComponent, canActivate: [AdminGuard] },
    { path: 'workshops/:id', component: WorkshopDetailsComponent },
    { path: 'presenters', component: PresentersHomeComponent },
    { path: 'presenters/add', component: PresentersAddComponent, canActivate: [AdminGuard] },
    { path: 'presenters/edit/:id', component: PresentersEditComponent, canActivate: [AdminGuard] },
    { path: 'presenters/:id', component: PresentersDetailsComponent },
    { path: '**', component: NotFoundComponent },
];
@NgModule({
    exports: [RouterModule],
    imports: [
        RouterModule.forRoot(routes)
    ],
    providers: [AuthGuard, AdminGuard]
})
export class AppRoutingModule { }
