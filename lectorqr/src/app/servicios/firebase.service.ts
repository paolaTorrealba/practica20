import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn } from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private objetoDoc: AngularFirestoreDocument<any>;
  private objetosCollection: AngularFirestoreCollection<any>;
  private objetos: Observable<any[]>;
  private objeto: Observable<any>;

  constructor(public afs: AngularFirestore){}

  add(collection: string, objeto: any): void {
    this.afs.collection(collection).add(objeto);
  }

  setDocument(collection:string, id:string, property:string, value:string): void {
    this.afs.collection(collection).doc(id).set({[property]:value});
  }

  update(collection: string, id:string, objeto:any): void {
      this.objetoDoc = this.afs.doc<any>(`${collection}/${id}`);
      this.objetoDoc.update(objeto);
  }

  delete(id: string, collection: string): void {
      this.objetoDoc = this.afs.doc<any>(`${collection}/${id}`);
      this.objetoDoc.delete();
  }

  clearCollection(collection){
    this.afs.collection(collection).get().subscribe(snapshot => {
      snapshot.docs.forEach(doc => {
        doc.ref.delete();
      });
    });
  }

  getAll(collection: string, queryFn?:QueryFn) {
    this.objetosCollection = this.afs.collection<any>(collection, queryFn);
    return this.objetos = this.objetosCollection.snapshotChanges()
        .pipe(map(changes => {
            return changes.map(action => {
                const data = action.payload.doc.data() as any;
                data.id = action.payload.doc.id;
                return data;
            });
        }));
  }

  getById(id: string, collection: string) {
    this.objetoDoc = this.afs.doc<any>(`${collection}/${id}`);
    return this.objeto = this.objetoDoc.snapshotChanges().pipe(map(action => {
        if (action.payload.exists === false) {
            return null;
        } else {
            const data = action.payload.data() as any;
            data.id = action.payload.id;
            return data;
        }
    }));
  }

  getObservableFromDocument(collection, id){
    return this.afs.collection(collection).doc(id).valueChanges();
  }

  getOnce(collection, id){
    return this.afs.collection(collection).doc(id).get();
  }

  getCollection(collection){
    return this.afs.collection(collection).get();
  }

  createDoc(collection, id){
    return this.afs.doc<any>(`${collection}/${id}`);;
  }
}