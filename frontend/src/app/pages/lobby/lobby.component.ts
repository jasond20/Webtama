import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { AuthService } from "@auth0/auth0-angular";
import { ViewEncapsulation } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { StripeService } from 'ngx-stripe';
import { JSON } from "sequelize";
import { Json } from "sequelize/types/utils";

let userId: number = -1;

@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class LobbyComponent implements OnInit {
  error: string = ""; // string representing the error message
  isAuthenticated$ = this.authService.isAuthenticated$;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private stripeService: StripeService
  ) {}

  ngOnInit(): void {
    this.checkAuth();

    if (userId === -1) {
      this.apiService.me().subscribe((data) => {
        userId = data as number;
        console.log(data);
        console.log(userId);
        this.setup();
      });
    } else {
      this.setup();
    }
  }

  setup() {
    this.apiService.getRooms().subscribe({
      next: (data) => {
        if (data.rooms.length === 0) {
          let title = document.getElementById("lobbyInfo")!;
          title.innerHTML = "No rooms found";
        } else {
          for (let i = 0; i < data.rooms.length; i++) {
            this.showRoom(data.rooms[i].id);
          }
        }

        document.getElementById("roomCreate")!.addEventListener("click", () => {
          this.addRoom();
        });
        document.getElementById("matchmake")!.addEventListener("click", () => {
          this.match();
        });
      },
    });
  }

  checkout() {
    // Check the server.js tab to see an example implementation
    const session = this.apiService.checkout();
    session.subscribe((data) => {
      const id = data as string;
      this.stripeService.redirectToCheckout({ sessionId: id }).subscribe((res) => {
        console.log(res);
      });
    });
  }

  checkAuth() {
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (!isAuth) {
        console.log("not authenticated");
      }
    });
  }

  addRoom() {
    let roomId = -1;
    this.apiService.addRoom("Roomy ").subscribe((data) => {
      roomId = data as number;
      this.showRoom(roomId);
      let title = document.getElementById("lobbyInfo")!;
      title.innerHTML = "";
      return roomId;
    });
  }

  match() {
    let foundRoom: number = -1;

    this.apiService.matchmake().subscribe((data) => {
      foundRoom = data as number;
      this.joinRoom(foundRoom, userId);
    });
  }

  showRoom(roomId: number) {
    const display = document.createElement("div");
    display.className = "roomRow";
    display.innerHTML = "Room: " + roomId;
    const joinBtn = document.createElement("button");
    joinBtn.classList.add("kiaButton");
    joinBtn.classList.add("joinButton");
    joinBtn.setAttribute("roomId", roomId.toString());
    joinBtn.innerHTML = "Join";

    joinBtn.addEventListener("click", () => {
      this.joinRoom(roomId, userId);
    });
    display.appendChild(joinBtn);
    const lobbyList = document.getElementById("lobbyList")!;
    lobbyList.appendChild(display);
  }

  joinRoom(roomId: number, userId: number) {
    this.apiService.joinRoom(roomId, userId).subscribe((data) => {
      console.log(data);
      this.goToGame();
    });
  }

  goToGame() {
    if (this.isAuthenticated$) {
      this.router.navigate(["/game"]);
    } else {
      // handle not authenticated case, e.g. show a message or redirect to login page
      console.log("not authenticated");
    }
  }
}
