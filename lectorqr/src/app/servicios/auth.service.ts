import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { map } from 'rxjs/operators';
import { Usuario } from '../clases/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private AFauth : AngularFireAuth,
    private router : Router,
     private db : AngularFirestore) { }

 login(email:string, password:string){

   return new Promise((resolve, rejected) =>{
     this.AFauth.auth.signInWithEmailAndPassword(email, password).then(user => {
       resolve(user);
     }).catch(err => rejected(err));
   });   
 }

  
 logout(){
   this.AFauth.auth.signOut().then(() => {
     this.router.navigate(['/login']);
   })
 }

 register(email : string, password : string, name : string){

   return new Promise ((resolve, reject) => {
     this.AFauth.auth.createUserWithEmailAndPassword(email, password).then( res =>{
         // console.log(res.user.uid);
       const uid = res.user.uid;
         this.db.collection('users').doc(uid).set({
           name : name,
           uid : uid
         })
       
       resolve(res)
     }).catch( err => reject(err))
   })
   

 }

 getUsuarios(tipo:string) { 
   return this.db.collection(tipo).snapshotChanges().pipe(map(rooms => {
     return rooms.map(a =>{
       const data = a.payload.doc.data() as Usuario;
       data.id = a.payload.doc.id;
       return data;
     })
   }));
 }
}
