import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { timingSafeEqual } from 'crypto';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  private splash= true;
  private notificationAudio= new Audio("../assets/sonidos/coin.mp3")
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if (this.splash){
setTimeout(() => {
  this.notificationAudio.play();
  setTimeout(()=> {
    this.pararAlarma();
    this.splash = false;
  }, 5650)
}, 5300)
      }
    });
  }

  pararAlarma() {
    this.notificationAudio.pause();
    this.notificationAudio.currentTime = 0;
  }
}
