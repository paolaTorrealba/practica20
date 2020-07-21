import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-contador-carga-credito',
  templateUrl: './contador-carga-credito.component.html',
  styleUrls: ['./contador-carga-credito.component.scss'],
})
export class ContadorCargaCreditoComponent implements OnInit {
  public credito: number;
  public perfil: string;
  
  constructor(private usuarioService: UsuarioService, 
    private firebaseService: FirebaseService) {  
      console.log("constructor de contador")
    }

  ngOnInit() {

    this.usuarioService.getAuthStateChanged().then((usuario:any) => {  
     //  console.log("traigo los datos del usuario:",usuario)  
      this.firebaseService.getOneUsuario("Usuarios",usuario.uid).subscribe((data: Array<any>) =>{
      for (let i = 0; i < data.length ; i++){
       if(usuario.uid === data[i].id){   
        this.credito = data[i].credito;    
        this.perfil= data[i].perfil;
      }
    }
      })
    });
  }
}