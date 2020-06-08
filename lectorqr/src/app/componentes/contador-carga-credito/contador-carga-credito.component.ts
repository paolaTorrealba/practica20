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
  
  constructor(private usuarioService: UsuarioService, 
    private firebaseService: FirebaseService) {  
    }

  ngOnInit() {
    this.usuarioService.getAuthStateChanged().then((usuario:any) => {     
      this.firebaseService.getOne("Usuarios",usuario.uid).subscribe((data: any) =>{
      this.credito = data[0].credito;  
      })
    });
  }
}