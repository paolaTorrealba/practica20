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
  private device: string = "web";
  private chargesCollection: string = "cargasUsadas"
  private usersCollection: string = "Usuarios"
  // public elcodigo:string="hola";
  // public elcodig:string="hola";
  // public elcodigo1:string="hola";
  // public elcodigo2:string="hola";
  // public elcodigo3:string="hola";
  // public elcodigo4:string="hola";
  // public elcodigo5:string="hola";
  // public elcodigo6:string="hola";
  // public cod7:string="hola";
  // public cod8:string="hola";
  // public cod9:string="hola";
  // public cod10:string="hola";

  public variableControl=false;
  public cambioEstado=true;

  constructor(
    private firebaseService: FirebaseService, 
    private barcodeScanner: BarcodeScanner, 
    private userService: UsuarioService, 
    private toastController: ToastController,
    private storage: Storage
  ) {}

  ngOnInit(){}
  
  scan(){
    if(this.device == "mobile"){
      this.barcodeScanner.scan().then(barcodeData => {
        // this.elcodigo="1-"+barcodeData.text;
         //console.log('Barcode data', barcodeData.text);
        if((barcodeData.text=="8c95def646b6127282ed50454b73240300dccabc")||
        (barcodeData.text=="2786f4877b9091dcad7f35751bfcf5d5ea712b2f")){
            this.getByIdAndUpdateCredit(barcodeData.text, "codigos");
        }
        else {
          this.getByIdAndUpdateCredit("ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172", "codigos");
        }

      }).catch(err => {
        this.presentToast("Dispositivo no habilitado para carga QR", "danger");
      });
    }
    else{     
      this.getByIdAndUpdateCredit("ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172", "codigos");
    }
  }

  getByIdAndUpdateCredit(barcodeId: string, dataNombre: string) {
     //console.log("2getByIdAndUpdateCredit")
    let currentUser = this.userService.getCurrentUser();
    this.firebaseService.getOnce(dataNombre, barcodeId).subscribe(async doc => {
      // console.log("lei el doc:", doc, doc.data(),"credito",doc.data().credito)
       //this.elcodigo4="4-"+dataNombre+" "+barcodeId;
      let validation = await this.validate(currentUser, doc, barcodeId);
      // console.log("salio del validate", validation)
     
      if (validation) {
        // this.elcodigo3="3-"+"validation";
          // this.firebaseService.getOneUsuario(this.usersCollection, currentUser.uid).subscribe(data =>{
          this.firebaseService.getOnce(this.usersCollection, currentUser.uid).toPromise().then(data =>{
          // console.log( data.get("credito"))
          // this.elcodigo2="cred actual-"+data.get("credito");
          // console.log("data.credito",data.get("credito"))  
          let actualCredit = data.get("credito") || 0;
          // console.log("credito leido",doc.data().credito)
          let credit = actualCredit + doc.data().credito;
          // this.elcodigo1="doc-"+doc.data().credito;
          // let credit = actualCredit
          console.log("Credito a actualizar", credit)
          console.log(this.variableControl,this.cambioEstado)
          if (!this.variableControl){ //si es admin, carga dos veces, sino carga 1 vez
            if (this.cambioEstado){ // es admin y es la segunda carga
              this.variableControl=true;
            }
         
             //console.log("actualizo1", dataNombre)
            
            this.storage.set('dataNombreqr',dataNombre);
            this.storage.set('barcodeIdqr',barcodeId); 

            if(this.cambioEstado){
             //  console.log("this.cambioEstado",this.cambioEstado)
              // this.firebaseService.update(dataNombre, barcodeId, {"enabled":"false"});
            }          
             //console.log("actualizo2")
            this.firebaseService.add(this.chargesCollection, {"date":Date.now(),"usuario":currentUser.uid, "id":barcodeId});
           
             console.log("actualizo3","Usuarios")
            this.firebaseService.update("Usuarios", currentUser.uid, 
                           {"credito":credit });
            // this.firebaseService.setDocument(this.usersCollection, currentUser.uid, "credito", credit);
            this.presentToast('Carga Realizada con Exito', "success");
          }
         
        })
      } else {
        this.presentToast('Código QR ya utilizado', "danger");
      }
    })
  }
  
  validate(currentUser, doc, barcodeId){   
     // console.log("validate-doc: ", doc, doc.exists )
    let currentUserProfilePromise = this.storage.get('perfil');
    // this.cod7=String(currentUserProfilePromise);
     //console.log("validate-current: ", currentUserProfilePromise )
    let chargesCountPromise = this.countCharges(currentUser.uid, barcodeId);
     //this.cod9=String(chargesCountPromise);
    let validationResult = Promise.all([currentUserProfilePromise, chargesCountPromise]).then(values => {
      let result = false;
     //  console.log("validate-values[0]=",values[0],"-values[1]=",values[1], 
     //  "existe:",doc.exists,"data:",doc.data().enabled)
     
      if (values[0] == "admin" && values[1] <=1) {
        this.cambioEstado=false; //carga una vez mas
         //console.log("this.cambioEsta",this.cambioEstado)
      }
      if (values[0] == "admin" && values[1] == 2) {
        this.cambioEstado=true;
        console.log("es admin y ya cargo dos veces")
      }
      if(doc.exists && ((values[0] == "admin" && values[1] <= 1) || 
        (values[0] != "admin" && values[1] == 0) && doc.data().enabled == "true")) {
        //   this.cod10="es true";
          result = true;
        }
      return result;
    })
    return validationResult;
  }

  countCharges(uId, barcodeId){
    // this.elcodigo6="6-"+barcodeId;
    return new Promise<any>((resolve) => {
      this.firebaseService.getAll(this.chargesCollection, ref => ref.where("usuario", "==", uId).where("id", "==", barcodeId)).subscribe((docs: Array<any>) => {
        resolve(docs.length);
      //   this.cod8=String(docs.length);
      })
    })
  }

  
  async presentToast(message, color) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: "top",
      color: color
    });
    toast.present();
  }

  // public ambiente: string = "web";
  // public credito: number;
  // public perfil: string;
  // public count:number = 0;
  // public contarCargasProm;
  // public sumarCredito: number =undefined;
 
  // constructor(
  //   private firebaseService: FirebaseService, 
  //   private barcodeScanner: BarcodeScanner, 
  //   private usuarioService: UsuarioService, 
  //   private toastController: ToastController,  
  // ) {
   
  // }

  // ngOnInit(){
  //   this.usuarioService.getAuthStateChanged().then((usuario:any) => { 
  
  //     this.firebaseService.getOne("Usuarios",usuario.uid).subscribe((data: any) =>{
  //       for (let i = 0; i < data.length ; i++){
  //         if(usuario.uid === data[i].id){   
  //          this.credito = data[i].credito;    
  //          this.perfil= data[i].perfil;
  //        }
  //       }
  //     console.log("perfil:", this.perfil)
  //     })
  //   });
    
  // }
  
  // async  scannear(){
  //   console.log("--scannear--")   

  //   if(this.ambiente == "mobile"){
  //     this.barcodeScanner.scan().then(barcodeData => {       
  //       let currentUser = this.usuarioService.getCurrentUser(); 
  //       this.contarCargasProm =  this.contarCargas(currentUser.uid, barcodeData.text);
  //       if( (this.count <= 1 && this.perfil === 'admin') || 
  //           (this.count < 1 && this.perfil != 'admin')) {
  //         this.getByIdAndUpdateCredit(barcodeData.text, "codigos");
  //       }
  //     }).catch(err => {
  //       this.presentToast("Dispositivo no habilitado para carga QR", "danger");
  //     });
  //   }
  //   else{
  //     let currentUser = this.usuarioService.getCurrentUser(); 
  //     this.contarCargasProm =  this.contarCargas(currentUser.uid, "8c95def646b6127282ed50454b73240300dccabc");
  //     console.log("perfil antes del if", this.perfil)
  //     console.log("this.count",this.count)
  //     console.log("es admin? ",this.perfil == 'admin')

  //     if (this.contarCargasProm==0){ //este usuario no ha usado este qr
  //       console.log("aun no lo ha usado")
  //       this.getByIdAndUpdateCredit("8c95def646b6127282ed50454b73240300dccabc", "codigos");
  //       this.count= this.count +1;
  //     }
  //     if (this.count != 0){
  //       if( (this.count <= 1 && this.perfil === 'admin') || 
  //           (this.count < 1 && this.perfil != 'admin')) { 
  //         console.log("dentro del if 1")       
  //         this.getByIdAndUpdateCredit("8c95def646b6127282ed50454b73240300dccabc", "codigos");
  //       }
  //       else
  //          console.log("fuera del IF1, count: ", this.count)
  //          this.presentToast('Código QR ya utilizado', "danger");
  //       }  
  //     }  
  // }

  // getByIdAndUpdateCredit(barcodeId: string, codigos: string) {
  //   console.log("getByIdAndUpdateCredit")
  //     let currentUser = this.usuarioService.getCurrentUser();   
  //     this.firebaseService.getOneCodigo(codigos, barcodeId).subscribe((data: any) =>{
     
  //       for (let i = 0; i < data.length ; i++){
  //         if(barcodeId === data[i].id){   
  //           if (data[i].credito != undefined){
  //             this.sumarCredito= data[i].credito;
  //             if (this.sumarCredito != undefined){
  //               console.log("entro al if 2!!!")      
  //               this.firebaseService.update("Usuarios", currentUser.uid, 
  //                {"credito":this.credito + this.sumarCredito });
  //             }
  //           } 
    
  //        }
  //       }  
            
  //     });
  //   //  ------------------------------------
  //   if (this.count != 0){
  //   if( (this.count <= 1 && this.perfil === 'admin') || 
  //       (this.count < 1 && this.perfil != 'admin')) {          
  //         this.firebaseService.update("codigos", barcodeId, {"enabled":"false"});
  //         if (this.sumarCredito != undefined){
  //           console.log("entro al if 3 s!!!")
  //           this.firebaseService.update("Usuarios", currentUser.uid,  {"credito":this.credito });

  //         }         
  //         this.firebaseService.add("cargasUsadas", {"fecha":Date.now(),"usuario":currentUser.uid, "barcodeId":barcodeId});
  //         this.contarCargasProm =  this.contarCargas(currentUser.uid, barcodeId);
  //         this.presentToast('Carga Realizada con Exito', "success");
 
  //     } else {
  //       this.presentToast('Código QR ya utilizado', "danger");
  //     } 
  //   }  
  // }
  
  

  //  async contarCargas(uId, barcodeId){  
  //    console.log(uId, barcodeId)
  //   return new Promise<number>((resolve) => {
  //     this.firebaseService.getAll("cargasUsadas", ref => 

  //     ref.where("usuario", "==", uId)
  //        .where("barcodeId", "==", barcodeId)).subscribe((docs: Array<any>) => {
               
  //         resolve(docs.length);          
  //         console.log("docs: ",docs)
  //         this.count=docs.length;
  //         console.log(" this.count : ", this.count)
  //     })
  //   })
  // }

  
  // async presentToast(message, color) {
  //   const toast = await this.toastController.create({
  //     message: message,
  //     duration: 2000,
  //     position: "bottom",
  //     color: color
  //   });
  //   toast.present();
  // }
}