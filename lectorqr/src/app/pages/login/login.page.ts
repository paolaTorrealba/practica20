import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Usuario } from 'src/app/clases/usuario';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  validations_form: FormGroup;
  errorMessage: string = '';
  defaultUsers: Array<any> = [];
  usuario: Usuario;
  public email;
  public password;
 
  constructor(
    private navCtrl: NavController,
    private authService: UsuarioService,
    private formBuilder: FormBuilder,
    private storage: Storage
  ) {}
 
  ngOnInit() {
    this.agregarUsuariosDefault();
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    });
  }
 
 
  validation_messages = {
    'email': [
      { type: 'required', message: 'El email es requerido.' },
      { type: 'pattern', message: 'Ingrese un email válido.' }
    ],
    'password': [
      { type: 'required', message: 'La contraseña es requerida.' },
      { type: 'minlength', message: 'La password debe contener al menos 6 catacteres.' }
    ]
  };

  agregarUsuariosDefault(){
    this.defaultUsers.push({"email":"anonimo@anonimo.com", "password":"444444", "perfil":"usuario", "sexo":"masculino"});
    this.defaultUsers.push({"email":"tester@tester.com", "password":"555555", "perfil":"tester","sexo": "femenino"});
    this.defaultUsers.push({"email":"admin@admin.com", "password":"111111", "perfil":"admin", "sexo":"femenino"});
    this.defaultUsers.push({"email":"invitado@invitado.com", "password":"222222", "perfil":"invitado", "sexo":"femenino"});
    this.defaultUsers.push({"email":"usuario@usuario.com", "password":"333333", "perfil":"usuario", "sexo":"masculino"});

  }

  setUsuarioDefault(){
    this.loginUsuario(this.usuario);
  }
 
 
  loginUsuario(value){
    this.email= value.email;
    this.password= value.password;  
    
    console.log("value", value)   
    this.authService.loginUser(value)
    .then(res => {
      this.errorMessage = "";
      this.navCtrl.navigateForward('/principal');
    }, err => {
      this.errorMessage = err.message;
    })
  }
}