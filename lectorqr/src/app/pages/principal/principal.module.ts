import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PrincipalPage } from './principal.page';
import { BotonScannerComponent } from 'src/app/componentes/boton-scanner/boton-scanner.component';
import { LimpiarCargaComponent } from 'src/app/componentes/limpiar-carga/limpiar-carga.component';
import { ContadorCargaCreditoComponent } from 'src/app/componentes/contador-carga-credito/contador-carga-credito.component';

const routes: Routes = [
  {
    path: '',
    component: PrincipalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  declarations: [PrincipalPage, BotonScannerComponent, ContadorCargaCreditoComponent, LimpiarCargaComponent]
})
export class PrincipalPageModule {}
