import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-contador-carga-credito',
  templateUrl: './contador-carga-credito.component.html',
  styleUrls: ['./contador-carga-credito.component.scss'],
})
export class ContadorCargaCreditoComponent implements OnInit {
  private credito: number;
  
  constructor(private usuarioService: UsuarioService, private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.usuarioService.getAuthStateChanged().then((usuario:any) => {
      this.firebaseService.getObservableFromDocument("usersData", usuario.uid).subscribe((data: number) =>{
        this.credito = data;
      })
    });
  }
}