import { Room, Client } from "@colyseus/core";
import { BellGameRoomState } from "./schema/BellGameRoomState";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

type Result = {
  player_ids  : string[][],
  input_bits  : boolean[][],
  answer_bits : boolean[][],
  won         :  boolean[]
}

const defaultResult: Result = { player_ids: [], input_bits: [], answer_bits: [], won: [] }
const adapter = new JSONFileSync<Result>("db.json");
const db = new LowSync(adapter, defaultResult)
db.read()

export class BellGameRoom extends Room<BellGameRoomState> {
  maxClients = 2;
  inputs = new Map<string, boolean>();
  answers = new Map<string, boolean>();

  onCreate (options: any) {
    this.setState(new BellGameRoomState());

    this.onMessage("answer", (client, message) => {
        if (!this.answers.has(client.sessionId)){
          this.answers.set(client.sessionId, Boolean(message))
        }
        
      if (this.answers.size == 2){
        let outcome = this.validateAnswers()
        this.broadcast("outcome", outcome)
        if (outcome) this.state.numberWon += 1;

        db.data.player_ids.push(this.clients.map((client) => (client.sessionId)))
        db.data.input_bits.push(Array.from(this.inputs.values())),
        db.data.answer_bits.push(Array.from(this.answers.values())),
        db.data.won.push(outcome)
        db.write()
        this.startGame()
      }

    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    if (this.hasReachedMaxClients()){
     this.startGame()
    }
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  startGame(){
    this.inputs.clear()
    this.answers.clear()
    this.sendInputs()
  }


  sendInputs() {
  this.state.attemptNumber += 1;
  this.clients.forEach(client => {
    var input = Math.random() >= 0.5;
    this.inputs.set(client.sessionId, input);
    client.send("input", input)
  });
}

  validateAnswers() {
    const [ans1, ans2] = this.answers.values();
    const [inp1, inp2] = this.inputs.values();
    if ((inp1 && inp2) == (( ans1 && !ans2 ) || ( !ans1 && ans2 ))){
      return true;
    }else{
      return false;
    }

  }
}