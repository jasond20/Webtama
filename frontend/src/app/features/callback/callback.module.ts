import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CallbackRoutingModule } from "./callback-routing.module";
import { SharedModule } from "src/app/shared/shared.module";
import { CallbackComponent } from "./callback.component";

@NgModule({
  declarations: [CallbackComponent],
  imports: [CommonModule, CallbackRoutingModule, SharedModule],
})
export class CallbackModule {}
