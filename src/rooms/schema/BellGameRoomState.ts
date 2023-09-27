import { Schema, Context, type, filter } from "@colyseus/schema";

export class BellGameRoomState extends Schema {

  @type("number") attemptNumber: number = 0;
  @type("number") numberWon: number = 0;

}
