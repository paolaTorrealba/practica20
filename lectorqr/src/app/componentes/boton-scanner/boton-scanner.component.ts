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
  public count:number = -1;
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
  
      this.firebaseService.getOne("Usuarios",usuario.uid).subscribe((data: any) =>{
        for (let i = 0; i < data.length ; i++){
          if(usuario.uid === data[i].id){   
           this.credito = data[i].credito;    
           this.perfil= data[i].perfil;
         }
        }
      console.log("perfil:", this.perfil)
      })
    });
    
  }
  
  async  scannear(){
    console.log("--scannear--")   

    if(this.ambiente == "mobile"){
      this.barcodeScanner.scan().then(barcodeData => {       
        let currentUser = this.usuarioService.getCurrentUser(); 
        this.contarCargasProm =  this.contarCargas(currentUser.uid, barcodeData.text);
        if( (this.count <= 1 && this.perfil === 'admin') || 
            (this.count < 1 && this.perfil != 'admin')) {
          this.getByIdAndUpdateCredit(barcodeData.text, "codigos");
        }
      }).catch(err => {
        this.presentToast("Dispositivo no habilitado para carga QR", "danger");
      });
    }
    else{
      let currentUser = this.usuarioService.getCurrentUser(); 
      this.contarCargasProm =  this.contarCargas(currentUser.uid, "ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172");
      console.log("perfil antes del if", this.perfil)
      console.log(this.count,this.count < 1)
      console.log(this.perfil != 'admin')
      if (this.count != -1){
        if( (this.count <= 1 && this.perfil === 'admin') || 
            (this.count < 1 && this.perfil != 'admin')) { 
          console.log("dentro del if 1")       
          this.getByIdAndUpdateCredit("ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172", "codigos");
        }
        else
           console.log("fuera del if 1", this.count)
        }  
      }  
  }

  getByIdAndUpdateCredit(barcodeId: string, codigos: string) {
      let currentUser = this.usuarioService.getCurrentUser();   
      this.firebaseService.getOneCodigo(codigos, barcodeId).subscribe((data: any) =>{
     
        for (let i = 0; i < data.length ; i++){
          if(barcodeId === data[i].id){   
            if (data[i].credito != undefined){
              this.sumarCredito= data[i].credito;
              if (this.sumarCredito != undefined){
                console.log("entro al if 2!!!")      
                this.firebaseService.update("Usuarios", currentUser.uid, 
                 {"credito":this.credito + this.sumarCredito });
              }
            } 
    
         }
        }  
            
      });
    //  ------------------------------------
    if (this.count != -1){
    if( (this.count <= 1 && this.perfil === 'admin') || 
        (this.count < 1 && this.perfil != 'admin')) {          
          this.firebaseService.update("codigos", barcodeId, {"enabled":"false"});
          if (this.sumarCredito != undefined){
            console.log("entro al if 3 s!!!")
            this.firebaseService.update("Usuarios", currentUser.uid,  {"credito":this.credito });

          }         
          this.firebaseService.add("cargasUsadas", {"fecha":Date.now(),"usuario":currentUser.uid, "barcodeId":barcodeId});
          this.contarCargasProm =  this.contarCargas(currentUser.uid, barcodeId);
          this.presentToast('Carga Realizada con Exito', "success");
 
      } else {
        this.presentToast('Código QR ya utilizado', "danger");
      } 
    }  
  }
  
  // validate(currentUser, doc, barcodeId){
  //   console.log(this.perfil)
  //   console.log("2 currentUser, doc, barcodeId",currentUser, doc, barcodeId)
  //   // let currentUserProfilePromise = this.storage.get('perfil');
  //   // let contarCargasPromise = this.contarCargas(currentUser.uid, barcodeId);  
  //   console.log("2) ***contarCargasPromise: ",this.count)
  //   let validationResult = Promise.all([this.perfil, this.count]).then(values => {
  //     let result = false;
  //     console.log("7) *** values",values[0], values[1])   

  //     console.log("9) Promise.all ", values[1]+1 <= 1  ) 

  //     if(values[1]+1 <= 1 && doc.enabled == "true" ) {
         
  //         console.log("12 Promise.all---IF-----------",values[1])       
  //         result = true;
  //       }
  //       else {
  //         console.log("10) Promise.all",values[1],"Fuera del IF")       
  //       }
  //       console.log("11) Promise.all - result",result)
  //     return result;
  //   })
  //   console.log("3) Promise.all -validationResult ", validationResult)
  //   return validationResult;
  // }

   async contarCargas(uId, barcodeId){  
     console.log(uId, barcodeId)
    return new Promise<number>((resolve) => {
      this.firebaseService.getAll("cargasUsadas", ref => 

      ref.where("usuario", "==", uId)
         .where("barcodeId", "==", barcodeId)).subscribe((docs: Array<any>) => {
               
          resolve(docs.length);          
          console.log("docs: ",docs)
          this.count=docs.length;
      })
    })
  }

  
  async presentToast(message, color) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: "bottom",
      color: color
    });
    toast.present();
  }
}