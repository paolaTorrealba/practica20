import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth.service';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { Storage } from '@ionic/storage';
// import { timingSafeEqual } from 'crypto';
@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit {
  public dataNombre:any="";
  public barcodeId:any="";
  public result=false;

  constructor( public authService: AuthService,
    private firebaseService: FirebaseService, 
    private storage: Storage,
    public actionSheetController: ActionSheetController
    ) { }

  ngOnInit() {
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
       buttons: [{
        text: 'Salir',
        role: 'destructive',
        icon: 'log-out',
        handler: () => {
          
          this.onLogout()

        },
      }]
    });
    await actionSheet.present();
  }

  async onLogout(){
     
      let validation = await this.obtenerDatos();
    console.log("validation", validation)
      if (validation) {
          console.log("barcodeId:", this.barcodeId)
          this.firebaseService.update("codigos", this.barcodeId, {"enabled":"true"});
          console.log("estoy en onLoguot");
          this.authService.logout();
          }    
  }

  obtenerDatos(){
    
    let data = this.storage.get('barcodeIdqr');
    
    let validationResult = Promise.all(["codigos",data]).then(values => {
        let result = false;
      // console.log("usr:",currentUserProfilePromise,"dataNombre[1]:",dataNombre,"barcodeId[1]:",barcodeId)
        console.log("values[0]=",values[0], " - values[1]=",values[1] )
     
        if(values[0]){ 
          this.barcodeId=String(values[1])
          return true;
        }
        return result;
      })
    return validationResult;
  }
}
