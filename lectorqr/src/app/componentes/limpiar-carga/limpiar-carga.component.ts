import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../servicios/firebase.service';
import { UsuarioService } from '../../servicios/usuario.service';

@Component({
  selector: 'app-limpiar-carga',
  templateUrl: './limpiar-carga.component.html',
  styleUrls: ['./limpiar-carga.component.scss'],
})
export class LimpiarCargaComponent implements OnInit {

  private usersCollection: string = "usersData"

  constructor(
    private firebaseService: FirebaseService, 
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {}

  clear(collection){
    this.firebaseService.clearCollection(collection);
  }

  overrideCollection(){
    let currentUser = this.usuarioService.getCurrentUser();
    this.firebaseService.getCollection('codigos').subscribe(snapshot => {
      snapshot.docs.forEach(doc => {
        doc.ref.update({["enabled"]:"true"});
      });
    });
    let objetoDoc = this.firebaseService.createDoc(this.usersCollection, currentUser.uid);
    this.firebaseService.getOnce(this.usersCollection, currentUser.uid).subscribe(doc => {
      if (!doc.exists) {
        return null;
      } else {
        objetoDoc.update({"credito":0});
      }
    })
  }
}
