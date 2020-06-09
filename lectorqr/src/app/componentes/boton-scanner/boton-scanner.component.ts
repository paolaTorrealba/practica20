import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-boton-scanner',
  templateUrl: './boton-scanner.component.html',
  styleUrls: ['./boton-scanner.component.scss'],
})
export class BotonScannerComponent implements OnInit {
  public ambiente: string = "web";
  public credito: number;
  public perfil: string;
  public count:number = 0;
  public contarCargasProm;
  public sumarCredito: number =undefined;
 
  constructor(
    private firebaseService: FirebaseService, 
    private barcodeScanner: BarcodeScanner, 
    private usuarioService: UsuarioService, 
    private toastController: ToastController,  
  ) {
   
  }

  ngOnInit(){
    this.usuarioService.getAuthStateChanged().then((usuario:any) => {    
      console.log("ngOnInit-boton", usuario) 
      this.firebaseService.getOne("Usuarios",usuario.uid).subscribe((data: any) =>{
      this.credito = data[0].credito;      
      this.perfil= data[0].perfil;
      })
    });
    
  }
  
  async  scannear(){
    console.log("-scannear-")   

    if(this.ambiente == "mobile"){
      this.barcodeScanner.scan().then(barcodeData => {       
        let currentUser = this.usuarioService.getCurrentUser(); 
        this.contarCargasProm =  this.contarCargas(currentUser.uid, barcodeData.text);
        if( this.contarCargasProm <= 2) {
          this.getByIdAndUpdateCredit(barcodeData.text, "codigos");
        }
        this.getByIdAndUpdateCredit(barcodeData.text, "codigos");
      }).catch(err => {
        this.presentToast("Dispositivo no habilitado para carga QR", "danger");
      });
    }
    else{
      let currentUser = this.usuarioService.getCurrentUser(); 
      this.contarCargasProm =  this.contarCargas(currentUser.uid, "8c95def646b6127282ed50454b73240300dccabc");
      if( this.count <= 1){        
        this.getByIdAndUpdateCredit("8c95def646b6127282ed50454b73240300dccabc", "codigos");
      }
      else
      console.log("fuera del if", this.count)
    }    
  }

  getByIdAndUpdateCredit(barcodeId: string, codigos: string) {
      let currentUser = this.usuarioService.getCurrentUser();   
      this.firebaseService.getOneCodigo(codigos, barcodeId).subscribe((data: any) =>{
      if (data[0].credito != undefined){
          this.sumarCredito= data[0].credito;
          if (this.sumarCredito != undefined){
            console.log("entro al if!!!")      
            this.firebaseService.update("Usuarios", currentUser.uid,  {"credito":this.credito + this.sumarCredito });
          }
        }        
      });
    //  ------------------------------------
      
      if (this.count <= 1) {         
          this.firebaseService.update("codigos", barcodeId, {"enabled":"false"});
          if (this.sumarCredito != undefined){
            console.log("entro al2 if!!!")
            this.firebaseService.update("Usuarios", currentUser.uid,  {"credito":this.credito });

          }         
          this.firebaseService.add("cargasUsadas", {"fecha":Date.now(),"usuario":currentUser.uid, "id":barcodeId});
          this.contarCargasProm =  this.contarCargas(currentUser.uid, "8c95def646b6127282ed50454b73240300dccabc");
          this.presentToast('Carga Realizada con Exito', "success");
 
      } else {
        this.presentToast('Código QR ya utilizado', "danger");
      }   
  }
  
  validate(currentUser, doc, barcodeId){
    console.log(this.perfil)
    console.log("2 currentUser, doc, barcodeId",currentUser, doc, barcodeId)
    // let currentUserProfilePromise = this.storage.get('perfil');
    // let contarCargasPromise = this.contarCargas(currentUser.uid, barcodeId);  
    console.log("2) ***contarCargasPromise: ",this.count)
    let validationResult = Promise.all([this.perfil, this.count]).then(values => {
      let result = false;
      console.log("7) *** values",values[0], values[1])   

      console.log("9) Promise.all ", values[1]+1 <= 1  ) 

      if(values[1]+1 <= 1 && doc.enabled == "true" ) {
         
          console.log("12 Promise.all---IF-----------",values[1])       
          result = true;
        }
        else {
          console.log("10) Promise.all",values[1],"Fuera del IF")       
        }
        console.log("11) Promise.all - result",result)
      return result;
    })
    console.log("3) Promise.all -validationResult ", validationResult)
    return validationResult;
  }

   async contarCargas(uId, barcodeId){  
    return new Promise<number>((resolve) => {
      this.firebaseService.getAll("cargasUsadas", ref => ref.where("usuario", "==", uId).where("id", "==", barcodeId)).subscribe((docs: Array<any>) => {
        resolve(docs.length);
        this.count=docs.length;
      })
    })
  }

  
  async presentToast(message, color) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: "middle",
      color: color
    });
    toast.present();
  }
}